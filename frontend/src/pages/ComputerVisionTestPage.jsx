
import { useState, useEffect, useCallback } from 'react'
import { apiJson } from '../apiClient.js'
import './ComputerVisionTestPage.css'

export default function ComputerVisionTestPage() {
  const [images, setImages] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [lastSync, setLastSync] = useState(null)

  const fetchImages = useCallback(async () => {
    try {
      setError('')
      const data = await apiJson('/api/cv/images')
      setImages(data.images || [])
      setNextCursor(data.nextCursor || null)
      setLastSync(new Date())
    } catch (err) {
      setError(err.message || 'Unable to retrieve images.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()

    const interval = setInterval(fetchImages, 60000)
    return () => clearInterval(interval)
  }, [fetchImages])

  async function loadMore() {
    if (!nextCursor || loadingMore) return

    setLoadingMore(true)
    try {
      const data = await apiJson(
        `/api/cv/images?cursor=${encodeURIComponent(nextCursor)}`
      )

      setImages(prev => {
        const seen = new Set(prev.map(img => img.name))
        return [
          ...prev,
          ...(data.images || []).filter(img => !seen.has(img.name))
        ]
      })
      setNextCursor(data.nextCursor || null)
    } catch (err) {
      setError(err.message || 'Could not load more images.')
    } finally {
      setLoadingMore(false)
    }
  }

  const today = new Date().toDateString()

  const todayCount = images.filter(
    img =>
      img.uploadedAt &&
      new Date(img.uploadedAt).toDateString() === today
  ).length

  const latestImage = images.reduce((latest, img) => {
    if (!img.uploadedAt) return latest
    if (!latest || new Date(img.uploadedAt) > new Date(latest)) {
      return img.uploadedAt
    }
    return latest
  }, null)

  const metrics = [
    { label: 'Loaded Images', value: images.length },
    { label: "Today's Loaded Images", value: todayCount },
    { label: 'Location', value: 'Cuddalore, Tamil Nadu, India' },
    { label: 'Camera / Stream', value: 'STREAM_0' },
    {
      label: 'Latest Loaded Image',
      value: latestImage
        ? new Date(latestImage).toLocaleString()
        : '—'
    }
  ]

  return (
    <main className="cv-test-page">
      <header className="cv-test-header">
        <div>
          <p className="cv-test-eyebrow">HENRY TECHNOLOGIES</p>
          <h1>Computer Vision Dashboard</h1>
          <p>Live Image Monitoring & Analysis</p>
        </div>
        <span className="cv-test-status">
          {error ? 'Connection Error' : loading ? 'Connecting...' : 'Connected'}
        </span>
      </header>

      <section className="cv-test-metrics">
        {metrics.map(metric => (
          <div className="cv-test-metric" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </section>

      <section className="cv-test-gallery">
        <div className="cv-test-gallery-header">
          <div>
            <h2>Captured Images</h2>
            <p>Azure Blob Storage / cv-container / STREAM_0</p>
          </div>
          <button
            className="cv-refresh-btn"
            onClick={fetchImages}
          >
            Refresh Images
          </button>
        </div>

        {lastSync && (
          <p className="cv-sync">
            Last synchronized: {lastSync.toLocaleTimeString()}
            {' '} • Automatic refresh every 60 seconds
          </p>
        )}

        {error && <p className="cv-error">{error}</p>}

        {loading ? (
          <div className="cv-test-empty">
            <h3>Loading images from Azure...</h3>
          </div>
        ) : images.length === 0 ? (
          <div className="cv-test-empty">
            <h3>No images found</h3>
            <p>Waiting for images from Azure Blob Storage.</p>
          </div>
        ) : (
          <>
            <div className="cv-image-grid">
              {images.map(img => (
                <div className="cv-image-card" key={img.name}>
                  <button
                    className="cv-image-preview"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.url}
                      alt={img.filename}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                  <div className="cv-image-info">
                    <strong>{img.filename}</strong>
                    <span>
                      {img.uploadedAt
                        ? new Date(img.uploadedAt).toLocaleString()
                        : 'No timestamp'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {nextCursor && (
              <div className="cv-load-more">
                <button onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading...' : 'Load More Images'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedImage && (
        <div className="cv-modal" onClick={() => setSelectedImage(null)}>
          <div
            className="cv-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="cv-modal-close"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image"
            >
              ×
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              referrerPolicy="no-referrer"
            />
            <p>{selectedImage.filename}</p>
          </div>
        </div>
      )}
    </main>
  )
}
