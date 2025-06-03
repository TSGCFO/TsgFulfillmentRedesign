/**
 * Browser Console Quote Button Test
 * 
 * Copy and paste this entire script into your browser console
 * on any page to test quote buttons
 */

function testQuoteButtons() {
  console.clear();
  console.log('🧪 QUOTE BUTTON TEST STARTING...\n');
  
  // Check if contact section exists
  const contactSection = document.getElementById('contact');
  if (!contactSection) {
    console.log('❌ FAIL: No contact section found on this page');
    console.log('Quote buttons need a contact section to scroll to');
    return;
  }
  console.log('✅ Contact section found');
  
  // Find all quote-related buttons
  const allButtons = Array.from(document.querySelectorAll('button, a'));
  const quoteButtons = allButtons.filter(btn => {
    const text = btn.textContent?.toLowerCase() || '';
    return text.includes('quote') || 
           text.includes('get a') || 
           text.includes('request a') ||
           text.includes('contact us');
  });
  
  if (quoteButtons.length === 0) {
    console.log('❌ No quote buttons found on this page');
    return;
  }
  
  console.log(`📍 Found ${quoteButtons.length} potential quote button(s):`);
  
  quoteButtons.forEach((btn, index) => {
    const text = btn.textContent?.trim() || 'No text';
    const hasClick = btn.onclick !== null || 
                    btn.getAttribute('onclick') !== null ||
                    btn.hasAttribute('data-testid');
    
    console.log(`${index + 1}. "${text}" - ${hasClick ? '✅ Has handler' : '⚠️ Check manually'}`);
  });
  
  console.log('\n🔧 MANUAL TEST INSTRUCTIONS:');
  console.log('1. Scroll to top of page');
  console.log('2. Click each quote button listed above');
  console.log('3. Verify it scrolls smoothly to the contact form');
  console.log('4. If button only shows notification, it needs fixing');
  
  // Test function for individual buttons
  window.testButton = function(buttonIndex) {
    if (buttonIndex < 1 || buttonIndex > quoteButtons.length) {
      console.log('❌ Invalid button index');
      return;
    }
    
    const button = quoteButtons[buttonIndex - 1];
    const initialY = window.scrollY;
    
    console.log(`Testing button: "${button.textContent?.trim()}"`);
    button.click();
    
    setTimeout(() => {
      const scrolled = Math.abs(window.scrollY - initialY) > 50;
      const contactRect = contactSection.getBoundingClientRect();
      const contactVisible = contactRect.top < window.innerHeight && contactRect.bottom > 0;
      
      if (scrolled && contactVisible) {
        console.log('✅ Button works correctly - scrolled to contact form');
      } else if (scrolled) {
        console.log('⚠️ Button scrolled but contact form may not be visible');
      } else {
        console.log('❌ Button did not scroll - NEEDS FIXING');
      }
    }, 1500);
  };
  
  console.log('\n🎯 QUICK TEST:');
  console.log('Type: testButton(1) to test the first button');
  console.log('Type: testButton(2) to test the second button, etc.');
}

// Auto-run the test
testQuoteButtons();