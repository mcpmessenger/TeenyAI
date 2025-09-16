# 🐛 WebView Layout Truncation Issue

## Issue Summary
The WebView component is displaying web content truncated at the top portion of the viewport, compressing websites into approximately the top 20% of the available screen space instead of utilizing the full browser window.

## Current Status
🔴 **UNRESOLVED** - Issue persists despite multiple attempted fixes

## Symptoms
- ✅ WebView loads and displays content
- ❌ Content is vertically truncated/compressed to top ~20% of viewport
- ❌ Websites appear "squeezed" into small area
- ❌ Full page content not visible without scrolling
- ❌ Layout does not utilize available screen real estate

## Technical Details

### Environment
- **Platform**: Windows 11 WSL2
- **Electron Version**: Latest
- **WebView Tag**: Enabled (`webviewTag: true`)
- **Development Mode**: Active (`npm run dev`)

### Current WebView Configuration
```tsx
<webview
  id="webview"
  src={currentUrl}
  className="webview"
  preload="./webview-preload.js"
  nodeintegration="false"
  websecurity="false"
  allowpopups="true"
  disablewebsecurity="true"
  useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  style={{
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none'
  }}
  partition="persist:webview"
  webpreferences="contextIsolation=true,enableRemoteModule=false,nodeIntegration=false,allowRunningInsecureContent=true,webviewTag=true"
/>
```

### CSS Layout Structure
```css
/* Navigation Bar */
.navigation-bar {
  min-height: 60px;
}

/* Main Content Container */
.main-content {
  flex: 1;
  height: calc(100vh - 60px);
  min-height: calc(100vh - 60px);
}

/* Browser View Container */
.browser-view-container {
  flex: 1;
  position: relative;
  height: 100%;
  min-height: calc(100vh - 60px);
}

/* WebView Element */
.webview {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
```

## Attempted Fixes

### ✅ Fix Attempt 1: User Agent & Security Settings
- **Action**: Updated user agent, disabled web security
- **Result**: Resolved Google "sorry" page blocking, but layout issue persists

### ✅ Fix Attempt 2: WebView Positioning
- **Action**: Changed from `position: relative` to `position: absolute`
- **Result**: No change in layout behavior

### ✅ Fix Attempt 3: Container Height Calculations
- **Action**: Updated CSS to use `calc(100vh - 60px)` for height calculations
- **Result**: No change in layout behavior

### ✅ Fix Attempt 4: Remove Conflicting Styles
- **Action**: Removed `min-height`, `contain`, and `isolation` properties
- **Result**: No change in layout behavior

### ✅ Fix Attempt 5: Clean Rebuild
- **Action**: `npm run clean && npm run build && npm run dev`
- **Result**: No change in layout behavior

## Root Cause Analysis

### Potential Causes
1. **Electron WebView Intrinsic Behavior**: WebView tag may have built-in viewport constraints
2. **CSS Flexbox Interaction**: Flex container calculations not propagating correctly to WebView
3. **WebView Content Scaling**: Internal WebView scaling affecting content rendering
4. **Z-Index/Layering Issues**: WebView content being clipped by parent containers
5. **Electron Version Bug**: Known issue with specific Electron version

### Investigation Needed
- [ ] Test with different Electron versions
- [ ] Compare with iframe implementation
- [ ] Test WebView without flex containers
- [ ] Investigate WebView internal scaling properties
- [ ] Check for conflicting global CSS styles

## Console Errors
```
Error occurred in handler for 'GUEST_VIEW_MANAGER_CALL': Error: ERR_ABORTED (-3) loading 'https://example.com/'
```

## Workarounds Considered
1. **Switch to iframe**: Replace WebView with standard iframe element
2. **BrowserView**: Use Electron's BrowserView API instead of WebView tag
3. **External Browser**: Open links in system default browser
4. **WebView zoom**: Adjust WebView zoom/scale properties

## Impact
- **Severity**: High - Core functionality severely impaired
- **User Experience**: Poor - Websites unusable in current state
- **Development**: Blocking - Prevents proper application testing

## Next Steps
1. Research Electron WebView known issues
2. Test iframe implementation as fallback
3. Investigate BrowserView alternative
4. Consider WebView zoom/scaling properties
5. Test on different platforms (non-WSL)

## File Locations
- **WebView Component**: `src/renderer/App.tsx:266-285`
- **CSS Styles**: `src/renderer/App.css:317-360`
- **Main Process**: `src/main/main.ts:195-205`

---

**Issue Created**: 2025-09-15
**Last Updated**: 2025-09-15
**Reporter**: Claude AI Assistant
**Assignee**: Development Team