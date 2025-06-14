/**
 * Redirects utility to handle URL changes and keep SEO value
 * Maps old paths to new paths for 301 redirects
 */

// Map of old URLs to new URLs for permanent redirects
export const redirectMap: Record<string, string> = {
  // Legacy PHP URLs to current service pages
  '/warehouse.php': '/services/warehousing',
  '/kitting.php': '/services/kitting-services',
  '/reverse.php': '/services/reverse-logistics',
  '/inventory.php': '/services/inventory-management',
  '/freight.php': '/services/freight-forwarding',
  '/hand-assembly.php': '/services/hand-assembly',
  '/custom-packaging.php': '/services/value-added-services',
  '/health-care-marketing.php': '/services/healthcare-services',
  '/fulfillment.php': '/services/fulfillment',
  '/services.php': '/#services',
  
  // Fix incorrect service URLs that cause 404s
  '/services/order-fulfillment': '/services/fulfillment',
  '/services/warehousing-services': '/services/warehousing', 
  
  // Other legacy URLs
  '/about': '/',
  '/contact.php': '/contact-form',
  '/contact': '/contact-form',
  '/testimonials.php': '/',
  '/why-us.php': '/',
  
  // Image URLs should not be treated as pages - redirect to homepage
  '/images/facility/loading-docks.jpg': '/',
  '/images/facility/office-space.jpg': '/',
  '/images/facility/warehouse-exterior.jpg': '/',
  '/images/facility/warehouse-interior.jpg': '/',
  '/images/operations/order-processing.jpg': '/',
  '/images/operations/packing-stations.jpg': '/',
  '/images/operations/picking-operations.jpg': '/',
  '/images/operations/shipping-area.jpg': '/',
  '/images/services/freight-logistics.jpg': '/',
  '/images/services/fulfillment-services.jpg': '/',
  '/images/services/kitting-assembly.jpg': '/',
  '/images/services/warehousing-solutions.jpg': '/',
  '/images/technology/automated-systems.jpg': '/',
  '/images/technology/barcode-scanning.jpg': '/',
  '/images/technology/tracking-dashboard.jpg': '/',
  '/images/technology/wms-system.jpg': '/',
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