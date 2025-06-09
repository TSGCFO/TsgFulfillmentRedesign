# TSG Fulfillment Redesign

A modern, high-performance web application for TSG Fulfillment Services, built with React, TypeScript, and Vite.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, TailwindCSS
- **SEO Optimized**: Comprehensive SEO implementation with meta tags, structured data, and sitemap
- **Performance Focused**: Optimized images, lazy loading, and CDN integration
- **Responsive Design**: Mobile-first approach with beautiful UI/UX
- **Type-Safe**: Full TypeScript support with strict type checking
- **Testing**: Comprehensive test suite with Vitest and Playwright

## 📁 Project Structure

```
TsgFulfillmentRedesign/
├── client/              # Frontend React application
│   ├── src/            # Source code
│   │   ├── components/ # React components
│   │   ├── pages/     # Page components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utility libraries
│   │   └── assets/    # Static assets
│   └── public/        # Public assets
├── server/             # Backend server (if applicable)
├── docs/              # 📚 Organized documentation
├── e2e/               # End-to-end tests
└── scripts/           # Utility scripts
```

## 📚 Documentation

All project documentation is organized in the [`docs/`](./docs/) directory. See the [Documentation Index](./docs/README.md) for a complete guide to:

- 🚀 [Deployment & Infrastructure](./docs/deployment/)
- 🔍 [SEO Documentation](./docs/seo/)
- 🖼️ [Image Management](./docs/images/)
- 🤖 [Claude/MCP Integration](./docs/claude-mcp/)
- 🧪 [Testing](./docs/testing/)
- 📊 [Analytics](./docs/analytics/)

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production)
- Supabase account (for image storage)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/TsgFulfillmentRedesign.git
cd TsgFulfillmentRedesign

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## 🚀 Deployment

For detailed deployment instructions, see:
- [Render Deployment Guide](./docs/deployment/RENDER_DEPLOYMENT.md)
- [Deployment Checklist](./docs/deployment/DEPLOYMENT_CHECKLIST.md)

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

See [Test Guide](./docs/testing/TESTS.md) for comprehensive testing documentation.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# Session
SESSION_SECRET=...

# Environment
NODE_ENV=development
```

### Image Management

Images are managed through Supabase Storage. See:
- [Image Management Guide](./docs/images/IMAGE_MANAGEMENT_GUIDE.md)
- [Upload Instructions](./docs/images/UPLOAD_INSTRUCTIONS.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software for TSG Fulfillment Services.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Deployed on [Render](https://render.com/)
- Images hosted on [Supabase](https://supabase.com/)

---

For more information, see the [complete documentation](./docs/README.md).