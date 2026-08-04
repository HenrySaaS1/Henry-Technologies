import heroMainSecondImage from '../assets/hero-image-2.jpeg'

import caseStudies from '../data/caseStudies.js'

import aiIconImage from '../assets/uploads/img-1.png'
import securityIconImage from '../assets/uploads/img-3.png'
import analyticsIconImage from '../assets/uploads/img-4.png'

import systemsProductImage from '../assets/uploads/product-systems-new.png'
import safetyProductImage from '../assets/uploads/product-safety-new.png'
import securityProductImage from '../assets/uploads/product-security-new.png'
import statusProductImage from '../assets/uploads/product-status-new.jpg'

import aboutHenryImage from '../assets/about-henry.png'

import HeroLiveChartsHud from '../HeroLiveCharts.jsx'

import targetManufacturingImage from '../assets/uploads/target-manufacturing.jpg'
import targetWarehouseImage from '../assets/uploads/target-warehouse.jpg'
import targetConstructionImage from '../assets/uploads/target-construction.jpg'

import {
  marketingProductsHashHref,
} from '../utils/productLinks.js'

const PRODUCT_IMAGES = {
  systems: systemsProductImage,
  safety: safetyProductImage,
  security: securityProductImage,
  status: statusProductImage,
}

const snapshotMobileCards = [
  {
    id: 'oee',
    title: 'Plant pulse',
    value: '94.2%',
    unit: 'OEE',
    hint: 'vs target 90%',
    freshness: 'Updated 2 min ago',
    accent: 'blue',
  },
  {
    id: 'units',
    title: 'Throughput',
    value: '512',
    unit: 'units / hr',
    hint: '+3.8% vs morning shift',
    freshness: 'Live shift',
    accent: 'cyan',
  },
  {
    id: 'alerts',
    title: 'Open alerts',
    value: '3',
    unit: 'need attention',
    hint: '2 high · 1 medium',
    freshness: 'Just now',
    accent: 'amber',
  },
  {
    id: 'lines',
    title: 'Lines running',
    value: '12 / 14',
    unit: 'assets',
    hint: 'Press Cell 2 idle',
    freshness: 'Refreshed every 5 min',
    accent: 'violet',
  },
  {
    id: 'snapshot',
    title: 'HENRY SnapShot',
    value: 'Live',
    unit: 'multi-site',
    hint: 'BU 125 · 120 · 140',
    freshness: 'What teams see on mobile',
    accent: 'navy',
  },
]

const solutions = [
  {
    title: 'Continuous Data Monitoring',
    text:
      'Track production performance and key metrics continuously to keep operations running smoothly and efficiently.',
    image: securityIconImage,
  },
  {
    title: 'AI-Powered Insights',
    text:
      'Leverage advanced AI to identify patterns, optimize processes, and predict issues before they happen.',
    image: aiIconImage,
  },
  {
    title: 'Smart Dashboard Reporting',
    text:
      'Visualize critical data with easy-to-understand dashboards designed for faster and better decision-making.',
    image: analyticsIconImage,
  },
]

const products = [
  {
    slug: 'safety',
    title: 'SAFETY',
    text:
      'Proactively detect and prevent safety risks on the factory floor. From boundary violations to unsafe behaviors, stay compliant and protect your workforce at all times.',
    image: PRODUCT_IMAGES.safety,
  },
  {
    slug: 'security',
    title: 'SECURITY',
    text:
      'Keep your facility secure with intelligent monitoring. Detect anomalies like unauthorized access, unlocked doors, or suspicious activity, before they become problems.',
    image: PRODUCT_IMAGES.security,
  },
  {
    slug: 'systems',
    title: 'SYSTEMS',
    text:
      'A unified view of your entire plant, powered by IIoT. Monitor machines, equipment, and workflows in on-demand time to optimize performance and reduce downtime.',
    image: PRODUCT_IMAGES.systems,
  },
  {
    slug: 'status',
    title: 'STATUS',
    text:
      'Get a clear view of work in process across your plant, projects, and operations. Track what is being built, current completion status, and whether progress is on schedule against the projected completion date.',
    image: PRODUCT_IMAGES.status,
  },
]

const targetClients = [
  {
    title: 'Manufacturing',
    image: targetManufacturingImage,
    text: 'HENRY helps manufacturing teams monitor production activity, workplace safety, machine systems, and work-in-progress from one unified view. It improves operational visibility, supports faster issue detection, and helps teams make better decisions across the factory floor.',
  },
  {
    title: 'Warehouse',
    image: targetWarehouseImage,
    text: 'HENRY gives warehouse operations better visibility across inventory movement, aisle safety, loading areas, and day-to-day workflows. It helps reduce blind spots, improve coordination, and keep warehouse environments safer, faster, and more efficient.',
  },
  {
    title: 'Construction',
    image: targetConstructionImage,
    text: 'HENRY supports construction teams with better tracking of project progress, site safety, equipment usage, and operational updates. It helps teams stay informed in near real time, improve coordination, and maintain better control across active job sites.',
  },
]

function HomePage({
  authBypass,
  onGetStarted,
}) {
  return (
    <>
      <section
        className="hero"
        style={{
          '--hero-url': `url(${heroMainSecondImage})`,
        }}
      >
        <div className="hero-inner">
          <HeroLiveChartsHud />

          <div className="overlay">
            <h1>
              When You Need Answers Now
            </h1>

            <p>
              Transforming Visual Information{' '}
              <br className="mobile-hero-break" />
              Into Actionable Data
            </p>

            <button
              className="btn-primary"
              onClick={onGetStarted}
            >
              {authBypass
                ? 'Open workspace'
                : 'Get Started'}
            </button>
          </div>
        </div>
      </section>

      <section
        id="snapshot-preview"
        className="snapshot-mobile-section"
        aria-labelledby="snapshot-mobile-heading"
      >
        <div className="snapshot-mobile-inner">

          <div className="snapshot-mobile-head">
            <h2 id="snapshot-mobile-heading">
              SnapShot on mobile
            </h2>

            <p>
              Swipe through live-style tiles — the same
              at-a-glance view teams check between line walks
              and meetings. HENRY SnapShot keeps metrics
              readable on a phone.
            </p>
          </div>

          <div
            className="snapshot-mobile-scroll"
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Example operations snapshot cards. Scroll horizontally."
          >
            <div className="snapshot-mobile-track">
              {snapshotMobileCards.map((card) => (
                <article
                  key={card.id}
                  className={`snapshot-mobile-card snapshot-mobile-card--${card.accent}`}
                  aria-label={`${card.title}: ${card.value} ${card.unit}`}
                >
                  <div
                    className="snapshot-mobile-chrome"
                    aria-hidden="true"
                  >
                    <span className="snapshot-mobile-time">
                      9:41
                    </span>

                    <span className="snapshot-mobile-signal">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>

                  <div className="snapshot-mobile-body">
                    <p className="snapshot-mobile-title">
                      {card.title}
                    </p>

                    <p className="snapshot-mobile-value">
                      {card.value}{' '}
                      <span className="snapshot-mobile-unit">
                        {card.unit}
                      </span>
                    </p>

                    <p className="snapshot-mobile-hint">
                      {card.hint}
                    </p>
                  </div>

                  <p className="snapshot-mobile-fresh">
                    {card.freshness}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="snapshot-mobile-actions">
            <a
              className="btn-primary snapshot-mobile-cta"
              href={marketingProductsHashHref('safety')}
            >
              Explore SnapShot
            </a>

            <span
              className="snapshot-mobile-hint-scroll"
              aria-hidden="true"
            >
              ← Swipe for more →
            </span>
          </div>

        </div>
      </section>

      <section className="solutions">
        <h2>
          Business Intelligence Tools with Actionable Insights
        </h2>

        <div className="card-grid three">
          {solutions.map((item) => (
            <article
              key={item.title}
              className="card"
            >
              <img
                className="solution-image"
                src={item.image}
                alt={item.title}
              />

              <h3>
                {item.title}
              </h3>

              <p>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="products"
        className="products"
      >
        <h2 className="products-title">
          HENRY SnapShot
        </h2>

        <p className="products-subtitle">
          Streamline your operations with smart automation.
          From consistent monitoring to predictive maintenance,
          automate processes and save valuable time.
        </p>

        <div className="card-grid four">
          {products.map((item) => (
            <article
              key={item.title}
              className="card product"
            >
              <img
                className="product-image"
                src={item.image}
                alt={item.title}
              />

              <h3>
                {item.title}
              </h3>

              <p>
                {item.text}
              </p>

              <a
                href={marketingProductsHashHref(item.slug)}
                className="btn-dark small btn-product-learn"
              >
                Learn More
              </a>
            </article>
          ))}
        </div>
      </section>

      <section
        id="target-clients"
        className="target-clients"
      >
        <h2 className="target-clients-title">
          TARGET CLIENTS
        </h2>

        <p className="target-clients-subtitle">
          HENRY is built to support industries that need better visibility,
          safer operations, and faster decision-making.
        </p>

        <div className="card-grid three target-clients-grid">
          {targetClients.map((item) => (
            <article
              key={item.title}
              className="card target-client-card"
            >
              <div className="target-client-image-wrap">
                <img
                  src={item.image}
                  alt={item.title}
                  className="target-client-image"
                />
              </div>

              <div className="target-client-content">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="case-studies"
        className="case-studies"
      >
        <h2>
          CASE STUDIES
        </h2>

        <div className="card-grid three">
          {caseStudies.map((item) => {
            const slug =
              `case-${item.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')}`

            return (
              <article
                key={item.title}
                className="card"
              >
                <img
                  className="case-image"
                  src={item.image}
                  alt={item.title}
                />

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.text}
                </p>

                <button
                  type="button"
                  className="btn-dark small"
                  onClick={() => {
                    if (
                      typeof window !== 'undefined'
                    ) {
                      window.open(
                        `/case-studies#${slug}`,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  }}
                >
                  Learn More
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section
        id="about"
        className="about about-last"
      >
        <div className="about-image">
          <img
            src={aboutHenryImage}
            alt="About Henry"
          />
        </div>

        <div className="about-content">
          <h2>
            ABOUT HENRY TECHNOLOGIES
          </h2>

          <h3>
            Smarter Business
            <br />
            Starts Here
          </h3>

          <p>
            HENRY Technologies helps your business make faster,
            smarter decisions using on-demand data and AI-powered
            insights. From consistent monitoring operations to
            optimizing performance, everything you need is in one
            powerful platform.
          </p>

          <ul>
            <li>
              On-Demand Factory Visibility
            </li>

            <li>
              AI-Driven Decision Making
            </li>

            <li>
              Improved Efficiency &amp; Productivity
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}

export default HomePage