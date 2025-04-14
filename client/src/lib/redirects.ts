/**
 * Redirects utility to handle URL changes and keep SEO value
 * Maps old paths to new paths for 301 redirects
 */

// Map of old URLs to new URLs for permanent redirects
export const redirectMap: Record<string, string> = {
  // Old URL pattern to new URL pattern
  '/warehouse.php': '/services/warehousing-services',
  '/kitting.php': '/services/kitting-services',
  '/reverse.php': '/services/reverse-logistics',
  '/inventory.php': '/services/inventory-management',
  '/freight.php': '/services/freight-forwarding',
  '/hand-assembly.php': '/services/hand-assembly',
  '/custom-packaging.php': '/services/custom-packaging',
  '/health-care-marketing.php': '/services/healthcare-services',
  
  // Other potential legacy URLs
  '/about': '/about-us', 
  '/contact.php': '/contact',
  '/fulfillment.php': '/services/order-fulfillment',
  '/services.php': '/services',
  '/testimonials.php': '/testimonials',
  '/why-us.php': '/about-us',
};

/**
 * Check if the current path requires a redirect
 * @param path - Current URL path
 * @returns The new path to redirect to, or null if no redirect needed
 */
export function checkRedirect(path: string): string | null {
  // Remove any query parameters for matching
  const cleanPath = path.split('?')[0];
  
  // Direct match in redirect map
  if (redirectMap[cleanPath]) {
    return redirectMap[cleanPath];
  }
  
  // Case-insensitive match (useful for mixed case URLs)
  const lowercasePath = cleanPath.toLowerCase();
  for (const [oldPath, newPath] of Object.entries(redirectMap)) {
    if (oldPath.toLowerCase() === lowercasePath) {
      return newPath;
    }
  }
  
  // No redirect needed
  return null;
}

/**
 * Set canonical URL in document head
 * @param url - The canonical URL (without domain)
 */
export function setCanonicalUrl(url: string): void {
  const fullUrl = `https://tsgfulfillment.com${url}`;
  
  // Find existing canonical tag or create a new one
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  
  canonicalLink.setAttribute('href', fullUrl);
}

export default { redirectMap, checkRedirect, setCanonicalUrl };