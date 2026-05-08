# AI Email Generator - Frontend

A modern, beautifully designed AI-powered email generator frontend built with Next.js, featuring an intuitive interface for generating professional emails with various tones.

## 🎨 UI/UX Overview

The application features a clean, modern interface with:
- **Glass-panel design** with backdrop blur effects
- **Warm color palette** with accent colors (`#bc5c34` for primary, `#7a2f15` for deep accent)
- **Smooth animations** and transitions
- **Responsive design** that works on all screen sizes
- **Interactive components** with proper hover states and cursor feedback

## 🛠️ Tech Stack

### Core Framework
- **Next.js 15.5.6** - React framework with App Router
- **React 19.0.0** - UI library
- **TypeScript 5** - Type-safe JavaScript

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS** - CSS transformation tool

### Development Tools
- **ESLint 9** - Code linting and quality
- **Windsurf AI Assistant** - AI-powered development assistant used for code generation, debugging, and UI improvements

### Validation
- **Zod 3.25.28** - Schema validation library

## ✨ Features

### Email Generation
- **Prompt Input**: Large textarea with character counter
- **Tone Selection**: Four tone options (Professional, Friendly, Formal, Casual)
- **Example Prompts**: Quick-start prompts for common use cases
- **Real-time Generation**: AI-powered email generation with loading states
- **Error Handling**: User-friendly error messages with toast notifications

### Generated Email Section
- **Subject Display**: Clearly formatted email subject
- **Body Display**: Formatted email body with proper whitespace
- **Copy Functionality**: 
  - Copy full email (subject + body)
  - Copy body only
  - Fallback for non-secure contexts (HTTP)
- **Clear Button**: Clear the generated email with toast notification
- **Metadata Display**: Shows tone, generation date, and AI model used

### History Management
- **Recent History**: Displays previously generated emails
- **Search Functionality**: Filter history by prompt, subject, or tone
- **Pagination**: 3 items per page with navigation controls
- **Clear History**: Confirmation dialog before clearing all history
- **Quick Load**: Click any history item to reload prompt and result

### UI Components
- **Confirmation Modal**: Reusable modal component for confirmations
- **Toast Notifications**: Success, error, and info messages
- **Loading States**: Skeleton loaders during async operations
- **Responsive Layout**: Adapts to mobile, tablet, and desktop

## 📁 Project Structure

```
ai_mail_generator_client/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and CSS variables
│   │   ├── layout.tsx           # Root layout with header/footer
│   │   └── page.tsx             # Main page component
│   ├── components/
│   │   ├── confirmation-modal.tsx  # Reusable confirmation dialog
│   │   ├── email-generator.tsx     # Main email generator component
│   │   ├── footer.tsx               # Footer component
│   │   └── header.tsx               # Header component
│   └── lib/
│       └── api.ts                 # API URL configuration
├── public/                       # Static assets
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment variables template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20+ installed
- npm or yarn package manager
- Backend API running (see backend README)

### Installation

1. **Navigate to the client directory:**
   ```bash
   cd ai_mail_generator_client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env.local
   
   # Or manually create .env.local with:
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Configure environment variables:**
   
   Edit `.env.local` and set:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```
   
   Replace `http://localhost:8000` with your backend API URL.

### Running the Application

**Development mode:**
```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000)

**Production build:**
```bash
npm run build
npm start
```

**Linting:**
```bash
npm run lint
```

## 🎨 Design System

### Color Palette
```css
--background: #f7f0e5        /* Warm beige background */
--foreground: #1f2937        /* Dark gray text */
--surface: rgba(255, 255, 255, 0.78)    /* Semi-transparent white */
--surface-strong: rgba(255, 255, 255, 0.92)  /* Stronger surface */
--muted: #5f6b7a             /* Muted text */
--border: rgba(31, 41, 55, 0.12)       /* Border color */
--accent: #bc5c34            /* Primary accent (warm orange) */
--accent-deep: #7a2f15       /* Deep accent */
```

### Typography
- **Font Family**: Manrope (sans-serif)
- **Display Font**: Cormorant (for headings)
- **Font Sizes**: Responsive scaling from mobile to desktop

### Components

#### Glass Panel
Background with blur effect for overlays and modals:
```css
.glass-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 24px 60px rgba(122, 47, 21, 0.08);
  backdrop-filter: blur(18px);
}
```

#### Paper Panel
Stronger background for content areas:
```css
.paper-panel {
  background: var(--surface-strong);
  border: 1px solid rgba(122, 47, 21, 0.1);
  box-shadow: 0 18px 50px rgba(52, 42, 33, 0.08);
}
```

## 🔧 API Integration

The frontend communicates with the backend through the following endpoints:

### GET `/api/v1/emails/history`
Fetches the 10 most recent generated emails.

### POST `/api/v1/emails/generate`
Generates a new email based on prompt and tone.

**Request Body:**
```json
{
  "prompt": "Write a follow-up email after an interview",
  "tone": "Professional"
}
```

### DELETE `/api/v1/emails/history`
Clears all saved email history (requires confirmation).

## 🌐 Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Clipboard API requires HTTPS or localhost
- Fallback for clipboard in HTTP contexts using `document.execCommand`

## 🐛 Troubleshooting

### Clipboard not working in production
- Ensure your site is served over HTTPS
- If using HTTP, the fallback mechanism will automatically activate
- Check browser console for permission errors

### API connection errors
- Verify `NEXT_PUBLIC_API_BASE_URL` is correctly set
- Ensure backend is running and accessible
- Check CORS configuration on backend

### Styling issues
- Clear Next.js cache: `rm -rf .next`
- Restart development server
- Verify Tailwind CSS is properly configured

## 📝 Development Notes

### AI Assistant Usage
This project was developed with assistance from **Windsurf AI**, which helped with:
- Component architecture and structure
- UI/UX improvements and design patterns
- Code refactoring and optimization
- Bug fixing and error handling
- TypeScript type safety

### Key Implementation Details
- **Client-side rendering** using `"use client"` directive
- **State management** with React hooks (useState, useEffect, useMemo)
- **Form handling** with controlled components
- **Error boundaries** for graceful error handling
- **Responsive design** using Tailwind CSS breakpoints

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
Build the application and deploy the `.next` folder:
```bash
npm run build
```

## 📄 License

This project is part of the Humanly Email AI Generator assignment.

## 🤝 Contributing

This is an assignment project. For improvements or issues, please contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Windsurf AI**
