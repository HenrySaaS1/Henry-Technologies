import snapshotProductImage from '../assets/uploads/product-snapshot-new.png'
import systemsProductImage from '../assets/uploads/product-systems-new.png'
import safetyProductImage from '../assets/uploads/product-safety-new.png'
import securityProductImage from '../assets/uploads/product-security-new.png'
import statusProductImage from '../assets/uploads/product-status-new.jpg'

const PRODUCT_IMAGES = {
  snapshot: snapshotProductImage,
  systems: systemsProductImage,
  safety: safetyProductImage,
  security: securityProductImage,
  status: statusProductImage,
}

const productDetails = [
  {
    slug: 'safety',
    title: 'SAFETY',
    intro:
      'HENRY Safety ensures a safer workplace through intelligent monitoring and alerts. Detects risks proactively and enforce safety protocols across your factory floor.',
    body:
      'From compliance to prevention, safety helps protect both people and operations.',
    bullets: [
      'Boundary Violation Detection: Identify safety line breaches instantly',
      'Unsafe Behaviour Alerts: Monitor and flag risky actions',
      'Immediate Notifications: Get immediate alerts for safety issues',
      'Compliance Monitoring: Ensure adherence to safety standards',
      'Incident Prevention: Reduce risks before they escalate',
    ],
    benefits: [
      'Save time and resources',
      'Reduce human errors',
      'Increase productivity',
      'Scale operations effortlessly',
    ],
    image: PRODUCT_IMAGES.safety,
  },
  {
    slug: 'security',
    title: 'SECURITY',
    intro:
      'HENRY Security provides advanced monitoring to safeguard your facility. Detects threats, prevents unauthorised access, and maintains full control over your premises.',
    body:
      'Built for modern industrial environments, Security keeps your operations protected 24/7.',
    bullets: [
      'Access Monitoring: On-demand detection of unauthorised entry',
      'Anomaly Detection: Identify unusual activities instantly',
      'Smart Surveillance Integration: Connect cameras and sensors seamlessly',
      'Alert System: Get notified of security breaches immediately',
      '24/7 Protection: Consistent monitoring for complete peace of mind',
    ],
    benefits: [
      'Improve operational efficiency',
      'Reduce downtime and errors',
      'Make faster, smarter decisions',
      'Gain full control over business performance',
    ],
    image: PRODUCT_IMAGES.security,
  },
  {
    slug: 'systems',
    title: 'SYSTEMS',
    intro:
      'HENRY Systems connects your entire plant through IIoT, providing a unified operational view. Monitor machines, workflows, and operations with on-demand visibility to improve efficiency and reduce downtime.',
    body:
      'Designed for modern manufacturing, Systems brings clarity and control to complex operations.',
    bullets: [
      'Machine Monitoring: Track equipment health and performance whenever needed',
      'IIoT Integration: Seamlessly connect sensors, PLCs, and devices',
      'Downtime Analysis: Identify and reduce operational inefficiencies',
      'Centralised Dashboard: View all systems in one unified interface',
      'Performance Optimisation: Improve output with data-driven insights',
    ],
    benefits: [
      'Increase production efficiency',
      'Identify bottlenecks quickly',
      'Reduce operational costs',
      'Improve decision-making with accurate data',
    ],
    image: PRODUCT_IMAGES.systems,
  },
  {
    slug: 'status',
    title: 'STATUS',
    intro:
      'HENRY Status gives your team a clear, near real-time view of work in process across your operations, including machines, boats, yachts, houses, buildings, and other active projects.',
    body:
      'Track what is being built, where each job stands, and how actual progress compares against the projected completion timeline on an hourly or daily basis.',
    bullets: [
      'Work-in-Process View: See active builds, jobs, and project stages in one place',
      'Progress Tracking: Monitor hourly or daily completion status against planned timelines',
      'Projected Completion: Compare current progress with expected completion dates',
      'Status Updates: Help teams identify delays, stay aligned, and keep projects moving forward',
      'Operational Visibility: Track updates across machines, boats, yachts, houses, buildings, and more',
    ],
    benefits: [
      'Improve response time',
      'Reduce operational delays',
      'Increase visibility across workflows',
      'Maintain smoother plant operations',
    ],
    image: PRODUCT_IMAGES.status,
  },
]

function ProductsPage({ openBookDemo }) {
  const scrollToProductDetail = (slug) => {
    if (typeof window === 'undefined') return

    const el = document.getElementById(slug)

    if (!el) return

    const topbar = document.querySelector('.topbar')

    const offset =
      (topbar
        ? topbar.getBoundingClientRect().height
        : 72) + 16

    const top =
      el.getBoundingClientRect().top +
      window.scrollY -
      offset

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth',
    })
  }

  return (
    <section
      className="products-detailed-page"
      aria-label="Detailed products"
    >
      <div className="products-snapshot-hero">

        <div className="products-snapshot-hero-text">

          <h2 className="products-snapshot-hero-title">
            <span className="products-snapshot-hero-title__henry">
              HENRY
            </span>{' '}

            <span className="products-snapshot-hero-title__snapshot">
              SnapShot
              <span
                className="products-snapshot-tm"
                aria-label="trademark"
              >
                ™
              </span>
            </span>
          </h2>

          <p className="products-snapshot-hero-tagline">
            Visual Intelligence For Smart Business Operations
          </p>

          <p className="products-snapshot-hero-body">
            HENRY SnapShot is a visual intelligence product designed to
            capture and analyse key moments from business operations. It
            helps teams monitor job status, production progress, workflow
            updates, system performance, safety concerns, and
            security-related activities in one place. Using images, video,
            and operational data, HENRY SnapShot converts day-to-day
            operations into simple, actionable insights. It gives managers
            a quick view of what is happening, what needs attention, and
            where delays, risks, safety issues, or security concerns may
            exist.
          </p>

          <p className="products-snapshot-hero-body">
            HENRY SnapShot supports stronger operational control by helping
            teams track systems, identify unsafe conditions, improve
            workplace security, and respond faster to potential issues.
            HENRY SnapShot is built to improve visibility, speed up
            decision-making, and create a safer, more secure, and more
            efficient business environment.
          </p>

          <button
            type="button"
            className="products-snapshot-hero-cta"
            onClick={() => scrollToProductDetail('safety')}
          >
            Explore SnapShot{' '}
            <span aria-hidden="true">
              →
            </span>
          </button>

        </div>

        <div
          className="products-snapshot-hero-visual"
          aria-hidden="true"
        >
          <div className="products-snapshot-hero-frame">
            <img
              src={snapshotProductImage}
              alt=""
              decoding="async"
            />
          </div>
        </div>

      </div>

      {productDetails.map((item, idx) => (
        <article
          id={item.slug}
          key={item.title}
          className={`product-detail-row${
            idx % 2 === 1 ? ' reverse' : ''
          }`}
        >
          <div className="product-detail-media">

            <div className="product-detail-visual">

              <img
                src={item.image}
                alt={item.title}
              />

              <div className="product-benefits-overlay">

                <h4>Benefits</h4>

                <ul>
                  {(item.benefits || []).map((line) => (
                    <li key={line}>
                      {line}
                    </li>
                  ))}
                </ul>

              </div>

            </div>

            <button
              type="button"
              className="btn-dark small"
              onClick={openBookDemo}
            >
              Book a Demo
            </button>

          </div>

          <div className="product-detail-content">

            <h3>{item.title}</h3>

            <p>{item.intro}</p>

            <p>{item.body}</p>

            <ul>
              {item.bullets.map((line) => (
                <li key={line}>
                  <span aria-hidden="true">
                    ☑
                  </span>{' '}
                  {line}
                </li>
              ))}
            </ul>

          </div>

        </article>
      ))}
    </section>
  )
}

export default ProductsPage