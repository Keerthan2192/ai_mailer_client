import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[var(--border)] shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Next.js Logo on the left */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--accent)] rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              <Image
                src="/next.svg"
                alt="Next.js Logo"
                width={45}
                height={45}
                className="relative dark:invert group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>

          {/* MailMuse AI in the center */}
          <div className="flex-1 flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
              <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-[var(--foreground)] to-[var(--accent)] bg-clip-text text-transparent">
                MailMuse AI
              </h1>
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></div>
            </div>
          </div>

         
        </div>
      </div>
    </header>
  );
}
