export const CANONICAL_BASE = 'https://yogisfarms.com';

/**
 * Computes the normalized canonical URL for any route/pathname.
 * - Strips query parameters and hash fragments
 * - Removes trailing slashes
 * - Maps route aliases to their canonical versions (/about -> /about-us, /blog/:id -> /blogs/:id, etc.)
 * - Handles root as https://yogisfarms.com
 * - Automatically handles any existing, dynamic, or future pages/slugs
 */
export const computeCanonicalUrl = (pathname, customCanonical) => {
  if (customCanonical && typeof customCanonical === 'string' && customCanonical.trim()) {
    return customCanonical.trim();
  }

  const rawPath = (pathname !== undefined && pathname !== null && pathname !== '') 
    ? pathname 
    : (typeof window !== 'undefined' ? window.location.pathname : '/');

  const cleanPath = (rawPath || '/').split('?')[0].split('#')[0];
  if (!cleanPath || cleanPath === '/' || cleanPath === '') {
    return CANONICAL_BASE;
  }

  let normalized = cleanPath.replace(/\/+$/, '');
  if (!normalized) return CANONICAL_BASE;

  // Normalize aliases to primary canonical routes
  if (normalized === '/about') normalized = '/about-us';
  if (normalized === '/contact') normalized = '/contact-us';
  if (normalized === '/blog') normalized = '/blogs';
  if (normalized.startsWith('/blog/')) {
    normalized = '/blogs' + normalized.substring(5);
  }

  return `${CANONICAL_BASE}${normalized}`;
};

/**
 * Injects or updates <link rel="canonical"> and <meta property="og:url"> in document head.
 */
export const setCanonicalTag = (url) => {
  if (typeof document === 'undefined' || !url) return;

  // <link rel="canonical">
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.rel = 'canonical';
    document.head.appendChild(canonicalTag);
  }
  canonicalTag.href = url;

  // <meta property="og:url">
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.content = url;
};
