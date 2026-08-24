import henryLogo from '../assets/henry-full-logo.png'
import ProductsMenuLink from './ProductsMenuLink.jsx'

/**
 * Header + mobile PRICING link toggle.
 *
 * Set to true when you want PRICING
 * back in the top navigation.
 */
export const SHOW_NAV_PRICING_LINK = false

function NavPricingMenuLink() {
  if (!SHOW_NAV_PRICING_LINK) {
    return null
  }

  return (
    <a href="/pricing">
      PRICING
    </a>
  )
}

function SiteHeader({
  currentUser,
  mobileMenuOpen,
  setMobileMenuOpen,
  mobileNavLinks,
  renderMobileMenu,
  openAuthFromAnyPage,
  signOut,
}) {
  return (
    <>
      <header className="topbar">

        <div className="topbar-start">

          <button
            type="button"
            className="logo"
            aria-label="Go to HENRY Technologies home"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.assign('/')
              }
            }}
          >
            <span className="logo-lockup">
              <img
                src={henryLogo}
                alt="HENRY Technologies"
                className="logo-mark logo-mark--full"
                width={320}
                height={100}
                decoding="async"
              />
            </span>
          </button>

        </div>

        <nav
          className="topbar-left menu"
          aria-label="Primary navigation"
        >
          <ProductsMenuLink />

          <a href="/case-studies">
            CASE STUDIES
          </a>

          <NavPricingMenuLink />

          <a href="/#about">
            ABOUT
          </a>

          <a href="/#request-demo">
            CONTACT
          </a>
        </nav>

        <div className="topbar-right">

          <div className="topbar-actions">

            <a
              className="btn-contact-nav"
              href="/#request-demo"
            >
              Request a demo
            </a>

            {currentUser ? (
              <button
                type="button"
                className="btn-signin-nav"
                onClick={signOut}
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-signin-nav"
                  onClick={() =>
                    openAuthFromAnyPage('signup')
                  }
                >
                  Sign Up
                </button>

                <button
                  type="button"
                  className="btn-dark small"
                  onClick={() =>
                    openAuthFromAnyPage('signin')
                  }
                >
                  Sign In
                </button>
              </>
            )}

          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={
              mobileMenuOpen
                ? 'Close navigation menu'
                : 'Open navigation menu'
            }
            aria-expanded={mobileMenuOpen}
            onClick={() =>
              setMobileMenuOpen((v) => !v)
            }
          >
            {mobileMenuOpen ? '×' : '☰'}
          </button>

        </div>

      </header>

      {renderMobileMenu(mobileNavLinks)}
    </>
  )
}

export default SiteHeader