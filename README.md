# Ifan Alriansyah - Portfolio Website

A modern, professional portfolio website built with Next.js 14, TypeScript, and Tailwind CSS. Features include dark/light mode, multi-language support (English/Indonesian), smooth animations, and production-ready Docker deployment.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

## ✨ Features

- 🎨 **Modern Design** - Clean, professional aesthetic with unique visual elements
- 🌓 **Dark/Light Mode** - System-aware theme switching with smooth transitions
- 🌍 **Internationalization** - Full support for English and Indonesian
- 🎭 **Smooth Animations** - Framer Motion animations with AOS scroll effects
- 📱 **Fully Responsive** - Mobile-first design approach
- ⚡ **Performance Optimized** - Lazy loading, image optimization, code splitting
- 🔍 **SEO Optimized** - Meta tags, structured data, sitemap, robots.txt
- 🐳 **Docker Ready** - Production-ready containerization with multi-stage builds

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Opanpan/ifan-portfolio.git
cd ifan-portfolio

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

### Using Docker

```bash
# Build the image
docker build -t ifan-portfolio .

# Run the container
docker run -p 3000:3000 ifan-portfolio
```

### Using Docker Compose

```bash
# Development
docker-compose up portfolio

# Production with Nginx (requires SSL certificates)
docker-compose --profile production up -d
```

### SSL Certificates for Production

Place your SSL certificates in the `ssl/` directory:
- `ssl/fullchain.pem`
- `ssl/privkey.pem`

## 📁 Project Structure

```
ifan-portfolio/
├── public/                 # Static assets
│   ├── images/            # Images and icons
│   └── cv/                # CV/Resume PDF
├── src/
│   ├── components/        # React components
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Experience.tsx
│   │   ├── Projects.tsx
│   │   ├── Skills.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useTheme.tsx
│   │   └── useScrollProgress.ts
│   ├── lib/               # Utilities and data
│   │   ├── i18n.ts
│   │   ├── techStack.ts
│   │   └── projects.ts
│   ├── locales/           # Translation files
│   │   ├── en/
│   │   └── id/
│   ├── pages/             # Next.js pages
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx
│   ├── styles/
│   │   └── globals.css
│   └── types/             # TypeScript types
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript 5.4
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion, AOS

### Internationalization
- react-i18next
- i18next
- i18next-browser-languagedetector

### Infrastructure
- Docker with multi-stage builds
- Nginx reverse proxy
- SSL/TLS support

## 🎨 Customization

### Changing Colors

Edit the color palette in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    500: '#22c55e', // Main brand color
    // ...
  },
}
```

### Adding New Languages

1. Create a new locale file in `src/locales/{lang}/common.json`
2. Add the language to `src/lib/i18n.ts`
3. Update the language switcher in `Navigation.tsx`

### Adding Projects

Edit `src/lib/projects.ts` and add corresponding translations in locale files.

## 📝 Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Contact form endpoint
NEXT_PUBLIC_CONTACT_API=your-contact-api-endpoint
```

## 🔧 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Ifan Alriansyah**
- GitHub: [@Opanpan](https://github.com/Opanpan)
- LinkedIn: [/in/ifannnn](https://www.linkedin.com/in/ifannnn/)
- Email: fanalriansyah@gmail.com

---

Made with ❤️ and clean code
