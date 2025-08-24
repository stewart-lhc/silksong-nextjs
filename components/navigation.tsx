'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { Twitter, Youtube, Facebook, Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  description?: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/", description: "Latest news and countdown" },
  { label: "Timeline", path: "/timeline", description: "Official statements timeline" },
  { label: "Checklist", path: "/checklist", description: "Player preparation guide" },
  { label: "Platforms", path: "/platforms", description: "Available platforms" },
  { label: "FAQ", path: "/faq", description: "Frequently asked questions" }
];

const socialLinks = [
  { Icon: Twitter, href: "https://twitter.com/teamcherry", label: "Twitter" },
  { Icon: Youtube, href: "https://youtube.com/c/TeamCherryGames", label: "YouTube" },
  { Icon: Facebook, href: "https://facebook.com/teamcherrygames", label: "Facebook" }
];

// Memoized NavLinks component to prevent unnecessary re-renders
function NavLinks({ mobile = false, onItemClick, currentPath }: { 
  mobile?: boolean; 
  onItemClick?: () => void; 
  currentPath: string;
}) {
  const isActive = useCallback((path: string) => currentPath === path, [currentPath]);
  
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          onClick={onItemClick}
          className={cn(
            "transition-colors duration-200 font-medium",
            mobile 
              ? "block px-4 py-3 text-base border-b border-border/50 hover:bg-accent/50"
              : "px-3 py-2 rounded-md text-sm hover:text-primary-glow",
            isActive(item.path)
              ? mobile
                ? "bg-primary/90 text-white border-primary/50"
                : "text-primary-glow bg-accent/30"
              : mobile
                ? "text-foreground"
                : "text-muted-foreground"
          )}
        >
          {mobile ? (
            <div>
              <div>{item.label}</div>
              {item.description && (
                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
              )}
            </div>
          ) : (
            item.label
          )}
        </Link>
      ))}
    </>
  );
}

// Memoized Social Links component
function SocialLinks() {
  return (
    <div className="flex items-center space-x-2 border-l border-border/50 pl-6">
      {socialLinks.map(({ Icon, href, label }) => (
        <Button 
          key={label}
          variant="ghost" 
          size="icon" 
          className="text-foreground hover:text-primary-glow"
          asChild
        >
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon className="h-5 w-5" />
          </a>
        </Button>
      ))}
    </div>
  );
}

// Memoized Mobile Social Links component
function MobileSocialLinks() {
  return (
    <div className="border-t border-border/50 pt-4">
      <div className="text-sm font-medium text-foreground mb-3">Follow Team Cherry</div>
      <div className="flex items-center space-x-3">
        {socialLinks.map(({ Icon, href, label }) => (
          <Button 
            key={label}
            variant="ghost" 
            size="icon" 
            className="text-foreground hover:text-primary-glow"
            asChild
          >
            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
              <Icon className="h-5 w-5" />
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Memoize current path to prevent NavLinks re-render
  const currentPath = useMemo(() => pathname, [pathname]);
  
  // Memoized close handler
  const handleClose = useCallback(() => setIsOpen(false), []);
  
  // Memoized toggle handler
  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/favicon.ico" alt="Hollow Knight Silksong" className="h-10 object-contain" />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <NavLinks currentPath={currentPath} />
            </div>
            
            {/* Social Links */}
            <SocialLinks />
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground" onClick={handleToggle}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[300px]">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-center pb-4 border-b border-border/50">
                    <Link href="/" onClick={handleClose}>
                      <img src="/favicon.ico" alt="Hollow Knight Silksong" className="h-8 object-contain" />
                    </Link>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className="flex-1 py-4">
                    <NavLinks mobile onItemClick={handleClose} currentPath={currentPath} />
                  </div>
                  
                  {/* Social Links */}
                  <MobileSocialLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}