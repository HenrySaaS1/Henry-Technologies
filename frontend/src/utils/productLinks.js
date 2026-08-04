/** `/products#slug` for marketing CTAs; honors Vite `base` and current origin. */
export function marketingProductsHashHref(slug) {
  const base = import.meta.env.BASE_URL || '/'

  if (typeof window === 'undefined') {
    return `${base}products#${slug}`
  }

  const normalizedBase =
    base === '/'
      ? `${window.location.origin}/`
      : `${window.location.origin}${base.endsWith('/') ? base : `${base}/`}`

  try {
    const u = new URL(`products#${slug}`, normalizedBase)
    return `${u.pathname}${u.search}${u.hash}`
  } catch {
    return `${base}products#${slug}`
  }
}

/** `/products` top; honors Vite `base` and current origin. */
export function marketingProductsHref() {
  const base = import.meta.env.BASE_URL || '/'

  if (typeof window === 'undefined') {
    return `${base}products`.replace(/\/{2,}/g, '/')
  }

  const normalizedBase =
    base === '/'
      ? `${window.location.origin}/`
      : `${window.location.origin}${base.endsWith('/') ? base : `${base}/`}`

  try {
    return new URL('products', normalizedBase).pathname
  } catch {
    return `${base}products`.replace(/\/{2,}/g, '/')
  }
}