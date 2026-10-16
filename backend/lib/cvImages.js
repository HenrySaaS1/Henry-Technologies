import { rateLimit } from 'express-rate-limit';
import { Router } from 'express';
import {
  BlobServiceClient,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';

const router = Router();

const accountName = 'henrydata1';
const containerName = 'cv-container';
// Example overrides: STREAM_0/ or DASHBOARD/ (includes dated subfolders).
const imagePrefix = String(process.env.CV_IMAGE_PREFIX || 'STREAM_0/')
  .trim()
  .replace(/^\/+/, '');

const imageFilePattern = /\.(jpe?g|png|webp)$/i;
const maxMetadataBytes = 64 * 1024;

const publicImageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please try again later.',
  },
});

function fieldAsText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) || null : null;
}

/** A missing or invalid sidecar never prevents the image from loading. */
async function readImageMetadata(container, imageBlobName) {
  const jsonBlobName = imageBlobName.replace(imageFilePattern, '.json');
  const jsonBlob = container.getBlobClient(jsonBlobName);

  try {
    const properties = await jsonBlob.getProperties();
    if ((properties.contentLength ?? 0) > maxMetadataBytes) {
      console.warn('[cv-images] JSON sidecar exceeds size limit:', jsonBlobName);
      return null;
    }

    const jsonBuffer = await jsonBlob.downloadToBuffer();
    if (jsonBuffer.length > maxMetadataBytes) return null;

    const metadata = JSON.parse(jsonBuffer.toString('utf8').replace(/^\uFEFF/, ''));
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    return {
      title: fieldAsText(metadata.title, 250),
      description: fieldAsText(metadata.description, 5000),
      risk_status: fieldAsText(metadata.risk_status, 60),
    };
  } catch (error) {
    if (
      error?.statusCode === 404 ||
      error?.code === 'BlobNotFound' ||
      error?.details?.errorCode === 'BlobNotFound'
    ) {
      return null;
    }
    console.warn('[cv-images] Could not read JSON sidecar:', jsonBlobName, error?.message);
    return null;
  }
}

// Public, read-only Computer Vision gallery API.
router.get('/images', publicImageRateLimit, async (req, res) => {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.CV_PUBLIC_GALLERY_ENABLED !== 'true'
  ) {
    return res.status(404).json({ message: 'Computer Vision gallery is unavailable' });
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return res.status(503).json({ message: 'Azure Blob Storage is not configured' });
  }

  const continuationToken =
    typeof req.query.cursor === 'string' ? req.query.cursor : undefined;

  if (continuationToken && continuationToken.length > 4096) {
    return res.status(400).json({ message: 'Invalid pagination cursor' });
  }

  try {
    const blobService = BlobServiceClient.fromConnectionString(connectionString);
    const container = blobService.getContainerClient(containerName);

    // One blob-listing page may contain BOTH .jpg and .json sidecars.
    // Pagination still uses the Azure continuation token, so no images are skipped.
    const pageSize = 48;
    const iterator = container
      .listBlobsFlat({ prefix: imagePrefix })
      .byPage({ continuationToken, maxPageSize: pageSize });

    const { value: page } = await iterator.next();
    const imageBlobs = (page?.segment?.blobItems || []).filter(blob =>
      imageFilePattern.test(blob.name)
    );

    const images = await Promise.all(
      imageBlobs.map(async blob => {
        const blobClient = container.getBlobClient(blob.name);
        const [url, metadata] = await Promise.all([
          blobClient.generateSasUrl({
            permissions: BlobSASPermissions.parse('r'),
            startsOn: new Date(Date.now() - 60_000),
            expiresOn: new Date(Date.now() + 5 * 60_000),
            protocol: SASProtocol.Https,
          }),
          readImageMetadata(container, blob.name),
        ]);

        return {
          name: blob.name,
          filename: blob.name.split('/').pop(),
          uploadedAt: blob.properties.lastModified?.toISOString() || null,
          size: blob.properties.contentLength ?? 0,
          url,
          title: metadata?.title ?? null,
          description: metadata?.description ?? null,
          risk_status: metadata?.risk_status ?? null,
        };
      })
    );

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      images,
      nextCursor: page?.continuationToken || null,
      stream: imagePrefix.replace(/\/$/, ''),
      storageAccount: accountName,
    });
  } catch (error) {
    console.error('[cv-images]', error);
    return res.status(500).json({
      message: 'Could not retrieve images from Azure Storage',
    });
  }
});

export default router;
