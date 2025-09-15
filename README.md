# TeenyAI - AI-Powered Lightweight Browser

A modern, AI-enhanced browser built with Electron, React, and TypeScript. TeenyAI combines the power of web browsing with intelligent AI assistance, predictive hover previews, and seamless user experience.

## ✨ Features

- 🤖 **AI Chat Assistant** - Get intelligent help while browsing
- 🔄 **Fresh Crawl Analysis** - AI-powered page analysis and insights
- 👆 **Predictive Hover Previews** - Smart content previews on hover
- 🌙 **Dark/Light Mode** - Beautiful, modern UI with theme switching
- ⚡ **Lightweight & Fast** - Built for speed and efficiency
- 🔧 **Developer Tools** - Built-in console and debugging tools

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

- `npm run dev` - Start development server (Vite + Electron)
- `npm run dev:vite` - Start Vite development server only
- `npm run dev:electron` - Start Electron only
- `npm run build` - Build for production
- `npm run package` - Package the app for distribution
- `npm run package:win` - Package for Windows
- `npm run package:mac` - Package for macOS

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
npm run build
npm run package
```

## 🐛 Known Issues

- Google.com loading issue in iframe (see [Bug Bounty](./BUG_BOUNTY.md))
- Some websites may not load due to X-Frame-Options headers
- GPU process warnings on Windows (cosmetic only)

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