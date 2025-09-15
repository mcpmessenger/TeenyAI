# TeenyAI - AI-Powered Lightweight Browser

A modern, AI-enhanced browser built with Electron, React, and TypeScript. TeenyAI combines the power of web browsing with intelligent AI assistance, predictive hover previews, and seamless user experience.

## ✨ Features

- 🌐 **Real Web Browsing** - Full-featured browser using Electron's BrowserView
- 🤖 **AI Chat Assistant** - Get intelligent help while browsing
- 🔄 **Fresh Crawl Analysis** - AI-powered page analysis and insights
- 👆 **Predictive Hover Previews** - Smart content previews on hover
- 🌙 **Dark/Light Mode** - Beautiful, modern UI with theme switching
- ⚡ **Lightweight & Fast** - Built for speed and efficiency
- 🔧 **Developer Tools** - Built-in console and debugging tools
- 🚀 **Production Ready** - Can be packaged as a standalone desktop app

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TeenyAI.git
   cd TeenyAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   OPENAI_API_KEY=your_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📦 Available Scripts

### Development
- `npm run dev` - Start development server (Vite + Electron)
- `npm run dev:vite` - Start Vite development server only
- `npm run dev:electron` - Start Electron only

### Building & Packaging
- `npm run build` - Build for production
- `npm run package:win` - Create Windows portable executable
- `npm run package:mac` - Create macOS zip package
- `npm run package:linux` - Create Linux AppImage
- `npm run package:all` - Build for all platforms

### Utilities
- `npm run clean` - Clean all build artifacts
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
TeenyAI/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts
│   └── renderer/       # React renderer process
│       ├── components/ # React components
│       ├── store/      # State management
│       └── styles/     # CSS styles
├── public/             # Static assets
├── dist/               # Build output
└── packages/           # Packaged applications
```

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Desktop**: Electron
- **State Management**: Zustand
- **Styling**: CSS Variables, Modern CSS
- **AI Integration**: OpenAI API
- **Web Crawling**: Playwright

## 🎨 UI/UX Features

- **Clean Minimal Design** - Emoji-focused navigation
- **Responsive Layout** - Works on all screen sizes
- **Smooth Animations** - Subtle hover effects and transitions
- **Accessibility** - Keyboard navigation and screen reader support
- **Theme System** - CSS variables for easy customization

## 🔧 Development

### Adding New Features

1. Create components in `src/renderer/components/`
2. Add state management in `src/renderer/store/`
3. Style with CSS variables in `src/renderer/App.css`
4. Update types in `src/renderer/types/`

### Building for Production

```bash
# Build the application
npm run build

# Create installers for specific platforms
npm run package:win    # Windows portable executable
npm run package:mac    # macOS zip package
npm run package:linux  # Linux AppImage
npm run package:all    # All platforms
```

### 📦 Distribution & Sharing

TeenyAI can be packaged as standalone installers for easy sharing:

**Windows**: Creates a portable `TeenyAI.exe` that runs without installation
**macOS**: Creates a `.zip` package for easy distribution
**Linux**: Creates an `.AppImage` for universal compatibility

**Output Location**: All installers are generated in the `release/` folder

**Sharing with Team**: 
1. Run `npm run package:win` (or your target platform)
2. Zip the `release/win-unpacked/` folder
3. Upload to Google Drive, Dropbox, or GitHub Releases
4. Share the download link with your team

For detailed deployment instructions, see [INSTALLER_DEPLOYMENT_GUIDE.md](INSTALLER_DEPLOYMENT_GUIDE.md)

## 🎉 Recent Updates

### ✅ Production Installer System Complete
TeenyAI now has a complete build and distribution system! You can create standalone installers for easy sharing with your team.

**New Build System:**
- ✅ **Windows Portable**: Creates `TeenyAI.exe` that runs without installation
- ✅ **macOS Packages**: Generates `.zip` files for macOS distribution
- ✅ **Linux AppImages**: Universal Linux compatibility
- ✅ **One-Command Builds**: Simple `npm run package:win` commands
- ✅ **Team Sharing Ready**: Upload to cloud storage and share links

**Build Commands:**
```bash
npm run package:win    # Windows portable executable
npm run package:mac    # macOS zip package  
npm run package:linux  # Linux AppImage
npm run package:all    # All platforms at once
```

### ✅ Critical Layering Issue Resolved - WebView Solution
The persistent BrowserView layering issue that was blocking AI features has been completely solved! We implemented a production-ready WebView tag approach that provides proper layering control.

**Root Cause Analysis:**
- BrowserView always renders on a higher layer than main window content
- CSS z-index ineffective against BrowserView (GPU process layer)
- Multiple timing and positioning fixes failed due to architectural limitation

**WebView Solution Implemented:**
- ✅ **WebView Tag**: Replaced BrowserView with WebView tag for proper DOM layering
- ✅ **CSS z-index Control**: Navigation bar now properly layered above web content
- ✅ **Production Security**: Multi-layer security with sandboxing and CSP
- ✅ **AI Features Operational**: Navigation bar visible, AI chat panel functional
- ✅ **Enterprise Ready**: Production-grade implementation with security hardening

### 🚀 Current Status
- **✅ Layering Fixed**: Navigation bar always visible above web content
- **✅ AI Assistant Working**: Page analysis and intelligent guidance functional
- **✅ Real Web Browsing**: Google, GitHub, and all websites load perfectly
- **✅ Production Ready**: Enterprise security and performance optimizations
- **✅ Clean Architecture**: WebView renders within DOM for proper control
- **✅ Distribution Ready**: Standalone installers for all platforms

### 🔧 API Configuration
The AI features are now ready for real page analysis! Configure your OpenAI API key:

1. **Set Environment Variable**:
   ```bash
   # In your .env file
   OPENAI_API_KEY=your_actual_api_key_here
   ```

2. **Test AI Features**:
   - Click the robot icon to open AI Assistant
   - Click "Analyze this page" for real page analysis
   - Ask questions about the current webpage
   - Get step-by-step guidance for any website

## 🐛 Known Issues

- GPU process warnings on Windows (cosmetic only, doesn't affect functionality)
- Some very restrictive websites may still have loading issues (rare)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Powered by [React](https://reactjs.org/)
- Styled with modern CSS
- AI capabilities via [OpenAI](https://openai.com/)

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/TeenyAI/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/TeenyAI/discussions)
- 📧 **Contact**: [Your Email](mailto:your.email@example.com)

---

**Made with ❤️ by [Your Name]**