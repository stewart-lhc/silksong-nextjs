'use client';

import Image from 'next/image';
import { Monitor, Gamepad2, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PlatformLogoProps {
  platformId: string;
  platformName: string;
  className?: string;
}

const platformLogoMap: Record<string, string> = {
  steam: '/assets/platforms/steam-logo.png',
  xbox: '/assets/platforms/xbox-logo.png',
  'xbox-one': '/assets/platforms/xbox-logo.png',
  windows: '/assets/platforms/xbox-logo.png',
  'nintendo-switch': '/assets/platforms/switch-logo.png',
  'nintendo-switch-2': '/assets/platforms/switch2-logo.png',
  'playstation-4': '/assets/platforms/ps4-logo.png',
  'playstation-5': '/assets/platforms/ps5-logo.png',
  gog: '/assets/platforms/gog-logo.png',
  'humble-bundle': '/assets/platforms/humble-logo.png',
};

// Fallback icon mapping
const fallbackIconMap: Record<string, React.ComponentType<any>> = {
  steam: Monitor,
  xbox: Gamepad2,
  'xbox-one': Gamepad2,
  windows: Monitor,
  'nintendo-switch': Smartphone,
  'nintendo-switch-2': Smartphone,
  'playstation-4': Gamepad2,
  'playstation-5': Gamepad2,
  gog: Monitor,
  'humble-bundle': Monitor,
  'mac-linux': Monitor,
};

export function PlatformLogo({ 
  platformId, 
  platformName, 
  className = "w-16 h-16"
}: PlatformLogoProps) {
  const [hasError, setHasError] = useState(false);
  const logoPath = platformLogoMap[platformId];
  
  // If no logo available or has error, use fallback icon
  if (!logoPath || hasError) {
    const FallbackIcon = fallbackIconMap[platformId] || Monitor;
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <FallbackIcon className="w-10 h-10 text-primary-glow" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm shadow-lg border border-white/20", className)}>
      <Image
        src={logoPath}
        alt={`${platformName} logo`}
        fill
        className="object-contain p-2 transition-transform hover:scale-110"
        sizes="(max-width: 768px) 64px, 80px"
        onError={() => setHasError(true)}
        priority={platformId === 'steam' || platformId === 'xbox'} // Priority loading for major platforms
      />
    </div>
  );
}