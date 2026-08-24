import henryLogo from '../assets/henry-full-logo.png'
import linkedinLogo from '../assets/linkedin-logo.png'
import youtubeLogo from '../assets/youtube-logo.png'

import {
  marketingProductsHashHref,
  marketingProductsHref,
} from '../utils/productLinks.js'

function SiteFooter() {
  return (
    <footer
      className="site-footer"
      aria-label="Site footer"
    >
      <div className="site-footer-inner">

        <div className="site-footer-brand">

          <div className="site-footer-logo-lockup">
            <img
              className="site-footer-logo-img"
              src={henryLogo}
              alt="HENRY Technologies"
            />
          </div>

          <p>
            Transforming Visual Information
            <br />
            Into Actionable Data
          </p>

        </div>

        <div className="site-footer-column">

          <h3>Quick Links</h3>

          <a href="/">
            Home
          </a>

          <a href={marketingProductsHref()}>
            Products
          </a>

          <a href="/case-studies">
            Case Studies
          </a>

          <a href="/#request-demo">
            Contact
          </a>

        </div>

        <div className="site-footer-column">

          <h3>What We Do</h3>

          <a href={marketingProductsHref()}>
            HENRY SnapShot
          </a>

          <a
            href={marketingProductsHashHref('safety')}
          >
            HENRY Safety
          </a>

          <a
            href={marketingProductsHashHref('security')}
          >
            HENRY Security
          </a>

          <a
            href={marketingProductsHashHref('systems')}
          >
            HENRY Systems
          </a>

          <a
            href={marketingProductsHashHref('status')}
          >
            HENRY Status
          </a>

        </div>

        <div className="site-footer-column site-footer-contact">

          <h3>Contact</h3>

          <p className="site-footer-contact-item">
            <span
              className="site-footer-contact-icon"
              aria-hidden="true"
            >
              📍
            </span>

            United States · India
          </p>

          <a
            className="site-footer-contact-item"
            href="mailto:info@goaskhenry.com"
          >
            <span
              className="site-footer-contact-icon"
              aria-hidden="true"
            >
              ✉️
            </span>

            info@goaskhenry.com
          </a>

          <a
            className="site-footer-contact-item"
            href="https://www.linkedin.com/company/henry-tech-inc"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="site-footer-social-logo"
              src={linkedinLogo}
              alt=""
              aria-hidden="true"
            />

            LinkedIn
          </a>

          <a
            className="site-footer-contact-item"
            href="https://www.youtube.com/@henry-tech-inc"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="site-footer-social-logo"
              src={youtubeLogo}
              alt=""
              aria-hidden="true"
            />

            YouTube
          </a>

        </div>

      </div>

      <div className="site-footer-bottom">
        <p>
          © 2026 HENRY Technologies, Inc. All rights reserved.
        </p>
      </div>

    </footer>
  )
}

export default SiteFooter