import { useEffect } from 'react';

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Affiliate Hub';

// Lightweight SEO helper (no react-helmet-async - it doesn't yet support
// React 19 peer deps). Sets document.title and the meta description
// directly; swap for react-helmet-async once it ships R19 support if
// richer head management (OG tags, etc.) is needed later.
export default function SEO({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
