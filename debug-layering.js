// Debug script to diagnose BrowserView layering issue
// Add this to main process for debugging

const debugLayering = () => {
  console.log('🔍 === LAYERING DEBUG START ===');
  
  // Check main window state
  console.log('📱 Main window bounds:', mainWindow.getBounds());
  console.log('📱 Main window isVisible:', mainWindow.isVisible());
  console.log('📱 Main window isFocused:', mainWindow.isFocused());
  
  // Check BrowserView state
  if (webView) {
    console.log('🌐 BrowserView bounds:', webView.getBounds());
    console.log('🌐 BrowserView isVisible:', webView.isVisible());
    console.log('🌐 BrowserView webContents URL:', webView.webContents.getURL());
  }
  
  // Check renderer DOM
  mainWindow.webContents.executeJavaScript(`
    console.log('🎨 === RENDERER DOM DEBUG ===');
    
    const navBar = document.querySelector('.navigation-bar');
    if (navBar) {
      console.log('🎨 Navigation bar found:', navBar);
      console.log('🎨 Navigation bar rect:', navBar.getBoundingClientRect());
      console.log('🎨 Navigation bar computed style:', window.getComputedStyle(navBar));
      console.log('🎨 Navigation bar z-index:', window.getComputedStyle(navBar).zIndex);
    } else {
      console.log('❌ Navigation bar NOT found!');
    }
    
    const browserContainer = document.querySelector('.browser-view-container');
    if (browserContainer) {
      console.log('🎨 Browser container found:', browserContainer);
      console.log('🎨 Browser container rect:', browserContainer.getBoundingClientRect());
      console.log('🎨 Browser container computed style:', window.getComputedStyle(browserContainer));
    }
    
    console.log('🎨 Document body height:', document.body.offsetHeight);
    console.log('🎨 Window inner height:', window.innerHeight);
    console.log('🎨 All elements with z-index > 1000:', 
      Array.from(document.querySelectorAll('*')).filter(el => 
        parseInt(window.getComputedStyle(el).zIndex) > 1000
      ).map(el => ({ element: el.tagName, class: el.className, zIndex: window.getComputedStyle(el).zIndex }))
    );
  `).catch(err => console.error('❌ DOM debug failed:', err));
  
  console.log('🔍 === LAYERING DEBUG END ===');
};

// Run debug after BrowserView is added
setTimeout(debugLayering, 2000);

// Export for manual testing
module.exports = { debugLayering };
