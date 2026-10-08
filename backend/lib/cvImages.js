
import { rateLimit } from "express-rate-limit";
import { Router } from "express";
import {
  BlobServiceClient,
  BlobSASPermissions,
  SASProtocol,
} from "@azure/storage-blob";

const router = Router();

const accountName = "henrydata1";
const containerName = "cv-container";
const imagePrefix = "STREAM_0/";

// Limit public requests to prevent excessive API usage.
const publicImageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

// Public, read-only Computer Vision image API.
router.get("/images", publicImageRateLimit, async (req, res) => {
  // Explicitly enable the public gallery in production.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.CV_PUBLIC_GALLERY_ENABLED !== "true"
  ) {
    return res.status(404).json({
      message: "Computer Vision gallery is unavailable",
    });
  }

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!connectionString) {
    return res.status(503).json({
      message: "Azure Blob Storage is not configured",
    });
  }

  const continuationToken =
    typeof req.query.cursor === "string"
      ? req.query.cursor
      : undefined;

  if (continuationToken && continuationToken.length > 4096) {
    return res.status(400).json({
      message: "Invalid pagination cursor",
    });
  }

  try {
    const client =
      BlobServiceClient.fromConnectionString(connectionString);

    const container = client.getContainerClient(containerName);

    // Retrieve images in batches.
    const pageSize = 24;

    const iterator = container
      .listBlobsFlat({ prefix: imagePrefix })
      .byPage({
        continuationToken,
        maxPageSize: pageSize,
      });

    const { value: page } = await iterator.next();

    // Accept supported image formats only.
    const blobs = (page?.segment?.blobItems || []).filter(
      (blob) => /\.(jpg|jpeg|png|webp)$/i.test(blob.name)
    );

    const images = await Promise.all(
      blobs.map(async (blob) => {
        const blobClient = container.getBlobClient(blob.name);

        // Generate a temporary, read-only image URL.
        const url = await blobClient.generateSasUrl({
          permissions: BlobSASPermissions.parse("r"),
          startsOn: new Date(Date.now() - 60000),
          expiresOn: new Date(Date.now() + 5 * 60000),
          protocol: SASProtocol.Https,
        });

        return {
          name: blob.name,
          filename: blob.name.split("/").pop(),
          uploadedAt:
            blob.properties.lastModified?.toISOString() || null,
          size: blob.properties.contentLength || 0,
          url,
        };
      })
    );

    res.setHeader("Cache-Control", "no-store");

    return res.json({
      images,
      nextCursor: page?.continuationToken || null,
      stream: "STREAM_0",
      storageAccount: accountName,
    });

  } catch (error) {
    console.error("[cv/images]", error);

    return res.status(500).json({
      message: "Could not retrieve images from Azure Storage",
    });
  }
});

export default router;
