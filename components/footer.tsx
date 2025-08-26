export function Footer() {
  return (
    <footer className="py-12 bg-gradient-to-br from-background via-card to-secondary/50 border-t border-primary/20 relative overflow-hidden">
      {/* Subtle silk pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="web-pattern" />
      </div>
      
      {/* Decorative silk threads */}
      <div className="silk-thread animate-silk-sway left-[20%] opacity-20 h-24" />
      <div className="silk-thread silk-thread-gold animate-silk-sway right-[20%] opacity-15 h-24" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground/90 hover:text-primary/70 transition-colors duration-300">
            HollowKnightSilkSong.org © Copyright 2025
          </p>
          <p className="text-xs text-muted-foreground/70">
            Fan-made website • Not officially affiliated with Team Cherry
          </p>
          <p className="text-xs text-muted-foreground/60">
            Contact: <a href="mailto:listewart751@gmail.com" className="hover:text-primary/70 transition-colors duration-300 underline">listewart751@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}