import { useEffect, useId, useRef, useState } from 'react'

import {
  marketingProductsHashHref,
  marketingProductsHref,
} from '../utils/productLinks.js'

const PRODUCTS_MENU_ITEMS = [
  {
    href: marketingProductsHref(),
    label: 'SnapShot',
    children: [
      {
        href: marketingProductsHashHref('safety'),
        label: 'SAFETY',
      },
      {
        href: marketingProductsHashHref('security'),
        label: 'SECURITY',
      },
      {
        href: marketingProductsHashHref('systems'),
        label: 'SYSTEMS',
      },
      {
        href: marketingProductsHashHref('status'),
        label: 'STATUS',
      },
    ],
  },
]

function ProductsMenuLink() {
  const menuUid = `p${useId().replace(/:/g, '')}`

  const [open, setOpen] = useState(false)

  const wrapRef = useRef(null)
  const leaveTimerRef = useRef(null)

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }

  const scheduleClose = () => {
    clearLeaveTimer()

    leaveTimerRef.current = window.setTimeout(() => {
      if (wrapRef.current?.contains(document.activeElement)) return

      setOpen(false)
    }, 220)
  }

  useEffect(() => () => clearLeaveTimer(), [])

  useEffect(() => {
    if (!open) return

    const onDocMouseDown = (e) => {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(e.target)
      ) {
        setOpen(false)
      }
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener(
        'mousedown',
        onDocMouseDown,
      )

      document.removeEventListener(
        'keydown',
        onKeyDown,
      )
    }
  }, [open])

  return (
    <div
      ref={wrapRef}
      className={`menu-products-wrap${open ? ' is-open' : ''}`}
      onMouseEnter={() => {
        clearLeaveTimer()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(e) => {
        const next = e.relatedTarget

        if (
          next instanceof Node &&
          wrapRef.current?.contains(next)
        ) {
          return
        }

        setOpen(false)
      }}
    >
      <a
        href="/#products"
        className="menu-products-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={`products-nav-menu-${menuUid}`}
        id={`products-nav-trigger-${menuUid}`}
        onClick={() => setOpen(false)}
      >
        PRODUCTS

        <span
          className="menu-products-caret"
          aria-hidden="true"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen((v) => !v)
          }}
        >
          ▾
        </span>
      </a>

      <div
        id={`products-nav-menu-${menuUid}`}
        className="menu-products-dropdown"
        role="menu"
        aria-hidden={!open}
      >
        {PRODUCTS_MENU_ITEMS.map((item) => (
          <div
            key={item.label}
            className="menu-products-group"
          >
            <a
              href={item.href}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="menu-products-parent"
            >
              {item.label}
            </a>

            {item.children?.length ? (
              <div className="menu-products-subitems">
                {item.children.map((child) => (
                  <a
                    key={child.label}
                    href={child.href}
                    role="menuitem"
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                    className="menu-products-child"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductsMenuLink