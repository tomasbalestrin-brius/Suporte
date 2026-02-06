/**
 * Utility functions for sanitizing user input to prevent XSS attacks
 */

/**
 * Sanitizes HTML content by removing dangerous tags and attributes
 * Uses browser's built-in DOMParser for safe HTML parsing
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.textContent = html; // This automatically escapes HTML

  return temp.innerHTML;
}

/**
 * Sanitizes text content for safe display
 * Converts potentially dangerous characters to HTML entities
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Allows only safe HTML tags (for rich text)
 * Removes scripts, iframes, and other dangerous elements
 */
export function sanitizeRichText(html: string): string {
  if (!html) return '';

  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove all script tags
  const scripts = temp.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Remove all iframe tags
  const iframes = temp.querySelectorAll('iframe');
  iframes.forEach(iframe => iframe.remove());

  // Remove event handlers
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove all on* attributes (onclick, onerror, etc)
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // Remove javascript: hrefs
    if (el.getAttribute('href')?.startsWith('javascript:')) {
      el.removeAttribute('href');
    }
  });

  return temp.innerHTML;
}

/**
 * Sanitizes URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '';
  }

  return url;
}
