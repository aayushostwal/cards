import { CreditCard, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white">CardSmart</span>
          </Link>

          {/* Built by */}
          <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <span>Built by</span>
            <span className="text-white font-medium">Aayush Ostwal</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://www.linkedin.com/in/aayush-ostwal/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-1.5 sm:p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--background-tertiary))] transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
            <a
              href="https://github.com/aayushostwal/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-1.5 sm:p-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--background-tertiary))] transition-colors"
            >
              <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[hsl(var(--border))]">
          <p className="text-center text-[10px] sm:text-xs text-[hsl(var(--muted-foreground))]">
            © 2024 CardSmart. Financial tools and advice are for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
