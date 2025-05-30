/**
 * Browser-based Image URL Extractor
 * 
 * Run this script in your browser console while viewing your website
 * to extract all currently loaded image URLs
 */

function extractCurrentImages() {
  const images = [];
  const imageElements = document.querySelectorAll('img');
  
  imageElements.forEach((img, index) => {
    if (img.src && img.src.startsWith('http')) {
      images.push({
        index: index + 1,
        src: img.src,
        alt: img.alt || '',
        className: img.className || '',
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        element: img.outerHTML.substring(0, 200) + '...'
      });
    }
  });
  
  // Also check for background images in CSS
  const elementsWithBgImages = [];
  document.querySelectorAll('*').forEach(element => {
    const style = window.getComputedStyle(element);
    const bgImage = style.backgroundImage;
    
    if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
      const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1] && match[1].startsWith('http')) {
        elementsWithBgImages.push({
          src: match[1],
          element: element.tagName,
          className: element.className || '',
          context: 'background-image'
        });
      }
    }
  });
  
  console.log('=== EXTRACTED IMAGES ===');
  console.log(`Found ${images.length} img elements and ${elementsWithBgImages.length} background images`);
  
  console.log('\n--- IMG ELEMENTS ---');
  images.forEach(img => {
    console.log(`${img.index}. ${img.src}`);
    console.log(`   Alt: ${img.alt}`);
    console.log(`   Size: ${img.width}x${img.height}`);
    console.log(`   Class: ${img.className}`);
    console.log('');
  });
  
  console.log('\n--- BACKGROUND IMAGES ---');
  elementsWithBgImages.forEach((bg, index) => {
    console.log(`${index + 1}. ${bg.src}`);
    console.log(`   Element: ${bg.element}`);
    console.log(`   Class: ${bg.className}`);
    console.log('');
  });
  
  // Create downloadable JSON
  const allImages = [
    ...images.map(img => ({ ...img, type: 'img-element' })),
    ...elementsWithBgImages.map(bg => ({ ...bg, type: 'background-image' }))
  ];
  
  const dataStr = JSON.stringify(allImages, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'extracted-images.json';
  link.click();
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total images found: ${allImages.length}`);
  console.log('Image data downloaded as extracted-images.json');
  
  // Return unique URLs for easy copying
  const uniqueUrls = [...new Set(allImages.map(img => img.src))];
  console.log('\n=== UNIQUE URLS (for copying) ===');
  uniqueUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  return uniqueUrls;
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = { extractCurrentImages };
}

console.log('Image extractor loaded. Run extractCurrentImages() to scan the current page.');