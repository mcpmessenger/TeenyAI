# 🐛 Known Issues & Solutions

This document tracks known issues with TeenyAI and their solutions. Please check here before reporting bugs.

## 🔑 API Configuration Issues

### Issue: API Key Validation Fails Despite Valid Key
**Status:** 🔴 Known Issue  
**Last Updated:** September 15, 2025  
**Affects:** OpenAI, Claude, Gemini API keys

#### Symptoms
- Troubleshooting panel shows "API key validation failed" error
- Valid API key (starts with `sk-` or `sk-proj-`) is rejected
- Error occurs even with fresh keys from provider platform
- AI Assistant shows setup message instead of working

#### Root Causes
1. **Environment Variable Persistence**: API keys set in PowerShell don't persist across Electron restarts
2. **Key Format Issues**: Extra whitespace or characters when copying keys
3. **Service Initialization Timing**: AI service initializes before environment variables are loaded
4. **Provider Detection Logic**: System may not properly detect which provider to use

#### Solutions

##### ✅ **Solution 1: Use .env File (Recommended)**
```bash
# Create .env file in project root
echo "OPENAI_API_KEY=your_actual_key_here" > .env
```

##### ✅ **Solution 2: Set Environment Variable Properly**
```powershell
# PowerShell (temporary)
$env:OPENAI_API_KEY="your_key_here"
npm run dev

# PowerShell (permanent for session)
[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "your_key_here", "User")
```

##### ✅ **Solution 3: Restart Application After Setting Key**
1. Set the API key
2. Close all Electron processes: `taskkill /F /IM electron.exe`
3. Restart: `npm run dev`

##### ✅ **Solution 4: Verify Key Format**
- Remove any extra spaces or characters
- Ensure key starts with `sk-` or `sk-proj-`
- Copy directly from OpenAI platform (don't type manually)

#### Workaround
If validation still fails, the AI service will work despite the error message. Check the console for actual functionality.

---

## 🌐 WebView Loading Issues

### Issue: ERR_ABORTED Errors When Loading Websites
**Status:** 🟡 Partial Fix  
**Last Updated:** September 15, 2025  
**Affects:** Some websites, especially Google services

#### Symptoms
```
Error occurred in handler for 'GUEST_VIEW_MANAGER_CALL': Error: ERR_ABORTED (-3) loading 'https://www.google.com/'
```

#### Root Causes
1. **WebView Security Policies**: Some sites block WebView access
2. **Missing User Agent**: WebView may not have proper user agent string
3. **CORS Issues**: Cross-origin requests blocked
4. **SSL/TLS Issues**: Certificate validation problems

#### Solutions

##### ✅ **Solution 1: Add User Agent**
```javascript
// In main process WebView configuration
webview.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
```

##### ✅ **Solution 2: Enable Web Security (Development)**
```javascript
// For development only - disable web security
webview.webPreferences = {
  webSecurity: false,
  allowRunningInsecureContent: true
};
```

##### ✅ **Solution 3: Use External Browser for Problematic Sites**
- Right-click on problematic links
- Select "Open in External Browser"
- This bypasses WebView limitations

#### Workaround
Most sites work fine. For problematic sites, use the external browser option.

---

## 🎭 Playwright Integration Issues

### Issue: Playwright Browsers Not Installed
**Status:** ✅ Fixed  
**Last Updated:** September 15, 2025  
**Affects:** Fresh installations

#### Symptoms
```
browserType.launch: Executable doesn't exist at C:\Users\...\chromium_headless_shell.exe
```

#### Solution
```bash
npx playwright install
```

---

## 🖱️ UI/UX Issues

### Issue: AI Assistant Hard to Drag
**Status:** ✅ Fixed  
**Last Updated:** September 15, 2025  
**Affects:** User experience

#### Symptoms
- AI Assistant starts in bottom-right corner
- Dragging stops if cursor moves off the header
- No visual feedback during drag

#### Solution
- ✅ Moved starting position to top-left corner
- ✅ Added drag handle with visual feedback
- ✅ Improved drag detection across entire header
- ✅ Added smooth animations and visual polish

---

## 🔧 Development Issues

### Issue: Vite CJS Deprecation Warning
**Status:** 🟡 Cosmetic  
**Last Updated:** September 15, 2025  
**Affects:** Development console

#### Symptoms
```
The CJS build of Vite's Node API is deprecated
```

#### Solution
This is a cosmetic warning. The application works fine. To suppress:
```bash
# Update Vite to latest version
npm update vite
```

---

## 🚀 Performance Issues

### Issue: GPU Process Crashes
**Status:** 🟡 Known Issue  
**Last Updated:** September 15, 2025  
**Affects:** Some Windows systems

#### Symptoms
```
[ERROR:gpu_process_host.cc(991)] GPU process exited unexpectedly: exit_code=-1073740791
```

#### Root Causes
1. **Graphics Driver Issues**: Outdated or incompatible drivers
2. **Hardware Acceleration**: Electron's GPU acceleration conflicts
3. **Windows Version**: Some Windows builds have compatibility issues

#### Solutions

##### ✅ **Solution 1: Disable Hardware Acceleration**
```javascript
// In main process
app.commandLine.appendSwitch('--disable-gpu');
app.commandLine.appendSwitch('--disable-gpu-sandbox');
```

##### ✅ **Solution 2: Update Graphics Drivers**
- Update NVIDIA/AMD/Intel graphics drivers
- Restart the application

##### ✅ **Solution 3: Use Software Rendering**
```javascript
// Force software rendering
app.commandLine.appendSwitch('--disable-gpu-compositing');
```

#### Workaround
The application continues to work despite these errors. They're mostly cosmetic.

---

## 📝 Reporting New Issues

When reporting a new issue, please include:

1. **Operating System**: Windows 10/11, macOS, Linux
2. **Node.js Version**: `node --version`
3. **Electron Version**: Check package.json
4. **Steps to Reproduce**: Detailed steps
5. **Expected Behavior**: What should happen
6. **Actual Behavior**: What actually happens
7. **Console Output**: Any error messages
8. **Screenshots**: If applicable

## 🔄 Issue Status Legend

- 🔴 **Critical**: Breaks core functionality
- 🟡 **Minor**: Cosmetic or non-critical
- ✅ **Fixed**: Resolved in current version
- 🚧 **In Progress**: Being worked on
- 📋 **Planned**: Scheduled for future release

## 📞 Getting Help

1. **Check this document first**
2. **Search existing issues** in the repository
3. **Check console output** for error messages
4. **Try the solutions** listed above
5. **Create a new issue** with detailed information

---

*Last updated: September 15, 2025*
*For the most up-to-date information, check the latest version of this file.*
