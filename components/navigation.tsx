'use client';

import { Facebook, Menu, Youtube } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher, LanguageSwitcherCompact } from '@/components/ui/language-switcher';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  path: string;
  descriptionKey: string;
}

const navItems: NavItem[] = [
  { key: 'nav.home', path: '/', descriptionKey: 'hero.description' },
  { key: 'nav.timeline', path: '/timeline', descriptionKey: 'timeline.description' },
  { key: 'nav.platforms', path: '/platforms', descriptionKey: 'platforms.description' },
  { key: 'nav.checklist', path: '/checklist', descriptionKey: 'checklist.description' },
  { key: 'nav.compare', path: '/compare-hollow-knight', descriptionKey: 'compare.description' },
  { key: 'nav.faq', path: '/faq', descriptionKey: 'faq.description' },
  { key: 'nav.tools', path: '/tools', descriptionKey: 'tools.description' },
];

// X (formerly Twitter) logo component
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 24 24' fill='currentColor' className={className}>
    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
  </svg>
);

const socialLinks = [
  { Icon: XIcon, href: 'https://x.com/teamcherry', label: 'X' },
  {
    Icon: Youtube,
    href: 'https://youtube.com/c/TeamCherryGames',
    label: 'YouTube',
  },
  {
    Icon: Facebook,
    href: 'https://facebook.com/teamcherrygames',
    label: 'Facebook',
  },
];

// Memoized NavLinks component to prevent unnecessary re-renders
function NavLinks({
  mobile = false,
  onItemClick,
  currentPath,
}: {
  mobile?: boolean; 
  onItemClick?: () => void; 
  currentPath: string;
}) {
  const { t } = useI18n();
  
  const isActive = useCallback(
    (path: string) => currentPath === path,
    [currentPath]
  );
  
  return (
    <>
      {navItems.map(item => (
        <Link
          key={item.path}
          href={item.path}
          onClick={onItemClick}
          className={cn(
            'font-medium transition-colors duration-200',
            mobile 
              ? 'block border-b border-border/50 px-4 py-3 text-base hover:bg-primary/10 hover:text-primary-600'
              : 'rounded-md px-3 py-2 text-sm hover:bg-primary/5 hover:text-primary-600',
            isActive(item.path)
              ? mobile
                ? 'border-primary/50 bg-primary-600 text-white'
                : 'bg-primary/10 font-semibold text-primary-600'
              : mobile
                ? 'text-primary-500 hover:text-primary-600'
                : 'text-primary-500 hover:text-primary-600'
          )}
        >
          {mobile ? (
            <div>
              <div>{t(item.key)}</div>
              <div className='mt-1 text-xs text-foreground/60'>
                {t(item.descriptionKey)}
              </div>
            </div>
          ) : (
            t(item.key)
          )}
        </Link>
      ))}
    </>
  );
}

// Memoized Social Links component
function SocialLinks() {
  return (
    <div className='flex items-center space-x-2 border-l border-border/50 pl-6'>
      {socialLinks.map(({ Icon, href, label }) => (
        <Button 
          key={label}
          variant='ghost'
          size='icon'
          className='text-foreground/70 transition-colors duration-200 hover:text-primary-600'
          asChild
        >
          <a
            href={href}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={label}
          >
            <Icon className='h-5 w-5' />
          </a>
        </Button>
      ))}
    </div>
  );
}

// Memoized Mobile Social Links component
function MobileSocialLinks() {
  const { t } = useI18n();
  
  return (
    <div className='border-t border-border/50 pt-4'>
      <div className='mb-3 text-sm font-medium text-primary-600'>
        {t('nav.followTeamCherry', 'Follow Team Cherry')}
      </div>
      <div className='flex items-center space-x-3'>
        {socialLinks.map(({ Icon, href, label }) => (
          <Button 
            key={label}
            variant='ghost'
            size='icon'
            className='text-foreground/70 transition-colors duration-200 hover:text-primary-600'
            asChild
          >
            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={label}
            >
              <Icon className='h-5 w-5' />
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
    <nav className='fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md'>
      <div className='container mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center'>
            <img
              src='/favicon.ico'
              alt='Hollow Knight Silksong'
              className='h-10 object-contain'
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className='hidden items-center space-x-6 md:flex'>
            <div className='flex items-center space-x-1'>
              <NavLinks currentPath={currentPath} />
            </div>
            
            {/* Language Switcher */}
            <LanguageSwitcherCompact />
            
            {/* Social Links */}
            <SocialLinks />
          </div>
          
          {/* Mobile Navigation */}
          <div className='md:hidden'>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-foreground/70 transition-colors duration-200 hover:text-primary-600'
                  onClick={handleToggle}
                >
                  <Menu className='h-6 w-6' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-[280px] sm:w-[300px]'>
                <div className='flex h-full flex-col'>
                  {/* Header */}
                  <div className='flex items-center justify-center border-b border-border/50 pb-4'>
                    <Link href='/' onClick={handleClose}>
                      <img
                        src='/favicon.ico'
                        alt='Hollow Knight Silksong'
                        className='h-8 object-contain'
                      />
                    </Link>
                  </div>
                  
                  {/* Navigation Links */}
                  <div className='flex-1 py-4'>
                    <NavLinks
                      mobile
                      onItemClick={handleClose}
                      currentPath={currentPath}
                    />
                  </div>
                  
                  {/* Language Switcher */}
                  <div className='border-t border-border/50 pt-4 pb-4'>
                    <LanguageSwitcher variant="outline" showText={true} />
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
