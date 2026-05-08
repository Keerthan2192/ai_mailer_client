export default function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-[var(--border)] mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Thank you message */}
          <div className="text-center">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Thank you for this Interview task
            </p>
            <p className="text-sm text-[var(--muted)] mt-2">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>

          {/* Decorative line */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent rounded-full"></div>

          {/* Additional info */}
          <div className="flex items-center space-x-4 text-sm text-[var(--muted)]">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>Ready for review</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
