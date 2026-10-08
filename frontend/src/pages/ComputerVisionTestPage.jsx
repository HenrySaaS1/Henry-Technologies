
import './ComputerVisionTestPage.css'

export default function ComputerVisionTestPage() {
  const metrics = [
    { label: 'Total Images', value: '—' },
    { label: "Today's Images", value: '—' },
    { label: 'Location', value: 'Not configured' },
    { label: 'Camera / Stream', value: 'STREAM_0' },
    { label: 'Last Image Received', value: '—' },
  ]

  return (
    <main className="cv-test-page">
      <header className="cv-test-header">
        <div>
          <p className="cv-test-eyebrow">HENRY TECHNOLOGIES</p>
          <h1>Computer Vision Dashboard</h1>
          <p>Image Monitoring & Analysis</p>
        </div>
        <span className="cv-test-status">Integration Pending</span>
      </header>

      <section className="cv-test-metrics">
        {metrics.map((metric) => (
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
        </div>
        <div className="cv-test-empty">
          <h3>Waiting for Azure Integration</h3>
          <p>
            Images will appear automatically after the secure
            Azure Blob Storage connection is configured.
          </p>
        </div>
      </section>
    </main>
  )
}
