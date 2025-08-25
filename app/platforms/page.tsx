'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, CheckCircle, Monitor, Smartphone, Gamepad2, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { PlatformLogo } from '@/components/platform-logo';
import faqData from '@/data/platforms-faq.json';

// Note: Metadata is handled by the parent layout since this is a client component

interface Platform {
  id: string;
  name: string;
  status: "confirmed" | "rumored" | "unknown";
  releaseWindow?: string;
  description: string;
  officialUrl?: string;
  gamePassIncluded?: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
}

function FAQAccordionItem({ item, isOpen, onToggle }: { 
  item: FAQItem; 
  isOpen: boolean; 
  onToggle: () => void; 
}) {
  return (
    <div className="border border-border rounded-lg">
      <button
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.question}`}
      >
        <span className="font-medium">{item.question}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <div
        id={`faq-answer-${item.question}`}
        className={`px-4 pb-3 text-muted-foreground ${isOpen ? 'block' : 'hidden'}`}
      >
        {item.answer}
      </div>
    </div>
  );
}

const platforms: Platform[] = [
  {
    id: "steam",
    name: "Steam (PC)",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "The classic PC gaming platform where Hollow Knight first found its audience.",
    officialUrl: "https://store.steampowered.com/app/1030300",
    gamePassIncluded: false
  },
  {
    id: "xbox",
    name: "Xbox Series X|S",
    status: "confirmed", 
    releaseWindow: "Day One",
    description: "Next-gen Xbox consoles with Game Pass availability confirmed.",
    officialUrl: "https://www.xbox.com/en-us/games/store/hollow-knight-silksong/9n116v0599hb",
    gamePassIncluded: true
  },
  {
    id: "xbox-one",
    name: "Xbox One",
    status: "confirmed",
    releaseWindow: "Day One", 
    description: "Previous generation Xbox console support confirmed.",
    officialUrl: "https://www.xbox.com/en-us/games/store/hollow-knight-silksong/9n116v0599hb",
    gamePassIncluded: true
  },
  {
    id: "windows",
    name: "Windows Store",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "Microsoft's Windows Store with Game Pass for PC integration.",
    officialUrl: "https://www.xbox.com/en-us/games/store/hollow-knight-silksong/9n116v0599hb",
    gamePassIncluded: true
  },
  {
    id: "nintendo-switch",
    name: "Nintendo Switch",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "The beloved portable gaming platform where Hollow Knight found great success.",
    officialUrl: "https://www.nintendo.com/games/detail/hollow-knight-silksong-switch/",
    gamePassIncluded: false
  },
  {
    id: "nintendo-switch-2",
    name: "Nintendo Switch 2",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "Nintendo's next-generation console platform confirmed for Silksong.",
    officialUrl: "https://www.nintendo.com/games/detail/hollow-knight-silksong-switch/",
    gamePassIncluded: false
  },
  {
    id: "playstation-4",
    name: "PlayStation 4",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "Sony's PlayStation 4 console platform confirmed for purchase.",
    officialUrl: "https://store.playstation.com/en-us/concept/10005908",
    gamePassIncluded: false
  },
  {
    id: "playstation-5",
    name: "PlayStation 5",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "Sony's next-generation PlayStation 5 console platform confirmed.",
    officialUrl: "https://store.playstation.com/en-us/concept/10005908",
    gamePassIncluded: false
  },
  {
    id: "gog",
    name: "GoG",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "DRM-free gaming platform for PC gamers who prefer digital ownership.",
    officialUrl: "https://www.gog.com/game/hollow_knight_silksong",
    gamePassIncluded: false
  },
  {
    id: "humble-bundle",
    name: "Humble Bundle",
    status: "confirmed",
    releaseWindow: "Day One",
    description: "Digital game store supporting charity with every purchase.",
    officialUrl: "https://www.humblebundle.com/store/hollow-knight-silksong",
    gamePassIncluded: false
  },
  {
    id: "mac-linux",
    name: "Mac & Linux",
    status: "unknown",
    releaseWindow: "TBA",
    description: "No official word on Mac or Linux support, though the original game supported these platforms.",
    officialUrl: "https://store.steampowered.com/app/1030300"
  }
];

const getStatusInfo = (status: Platform["status"]) => {
  switch (status) {
    case "confirmed":
      return {
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: CheckCircle,
        label: "Confirmed"
      };
    case "rumored":
      return {
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", 
        icon: Clock,
        label: "Rumored"
      };
    case "unknown":
      return {
        color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        icon: Clock,
        label: "Unknown"
      };
  }
};

export default function PlatformsPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const confirmedPlatforms = platforms.filter(p => p.status === "confirmed");
  const rumoredPlatforms = platforms.filter(p => p.status === "rumored");
  const unknownPlatforms = platforms.filter(p => p.status === "unknown");
  
  const faqItems: FAQItem[] = faqData.faqData;

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Generate FAQ JSON-LD structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData)
        }}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card/50 backdrop-blur-sm border-b">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold fantasy-text mb-4 text-foreground">
                Platforms & Availability
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Stay up to date with official platform confirmations and availability information for Hollow Knight: Silksong.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">

      {/* Game Pass Highlight */}
      <Card className="max-w-2xl mx-auto mb-12 border-hornet-secondary/30 card-enhanced">
        <CardHeader className="text-center">
          <CardTitle className="text-hornet-secondary flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Xbox Game Pass Day One
          </CardTitle>
          <CardDescription>
            Silksong will be available on Xbox Game Pass from release day across all supported platforms
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Confirmed Platforms */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-hornet-secondary" />
          Confirmed Platforms
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {confirmedPlatforms.map(platform => {
            const statusInfo = getStatusInfo(platform.status);
            
            return (
              <Card key={platform.id} className="hover:shadow-lg transition-shadow card-enhanced">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <PlatformLogo 
                      platformId={platform.id}
                      platformName={platform.name}
                      className="w-20 h-20"
                    />
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {platform.name}
                    {platform.gamePassIncluded && (
                      <Badge className="bg-hornet-secondary/10 text-hornet-secondary border-hornet-secondary/20 text-xs">
                        Game Pass
                      </Badge>
                    )}
                  </CardTitle>
                  {platform.releaseWindow && (
                    <CardDescription className="text-hornet-secondary font-medium">
                      {platform.releaseWindow}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{platform.description}</p>
                  {platform.officialUrl && (
                    <Button variant="outline" size="sm" asChild className="btn-outline-fantasy">
                      <a href={platform.officialUrl} target="_blank" rel="noopener noreferrer">
                        Visit Platform
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Rumored Platforms */}
      {rumoredPlatforms.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-hornet-accent" />
            Rumored Platforms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rumoredPlatforms.map(platform => {
              const statusInfo = getStatusInfo(platform.status);
              
              return (
                <Card key={platform.id} className="hover:shadow-lg transition-shadow opacity-75 card-enhanced">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <PlatformLogo 
                        platformId={platform.id}
                        platformName={platform.name}
                        className="w-20 h-20 opacity-60"
                      />
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardTitle>{platform.name}</CardTitle>
                    {platform.releaseWindow && (
                      <CardDescription>{platform.releaseWindow}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{platform.description}</p>
                    {platform.officialUrl && (
                      <Button variant="outline" size="sm" asChild className="btn-outline-fantasy">
                        <a href={platform.officialUrl} target="_blank" rel="noopener noreferrer">
                          Visit Platform
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Unknown Platforms */}
      {unknownPlatforms.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-hornet-accent/50" />
            Platform Status Unknown
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unknownPlatforms.map(platform => {
              const statusInfo = getStatusInfo(platform.status);
              
              return (
                <Card key={platform.id} className="hover:shadow-lg transition-shadow opacity-60 card-enhanced">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <PlatformLogo 
                        platformId={platform.id}
                        platformName={platform.name}
                        className="w-20 h-20 opacity-40"
                      />
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardTitle>{platform.name}</CardTitle>
                    {platform.releaseWindow && (
                      <CardDescription>{platform.releaseWindow}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{platform.description}</p>
                    {platform.officialUrl && (
                      <Button variant="outline" size="sm" asChild className="btn-outline-fantasy">
                        <a href={platform.officialUrl} target="_blank" rel="noopener noreferrer">
                          Visit Platform
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <FAQAccordionItem
              key={index}
              item={item}
              isOpen={openFAQ === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </section>

      {/* Statistics */}
      <Card className="max-w-2xl mx-auto mb-8 card-enhanced">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-hornet-secondary mb-2">
              {confirmedPlatforms.length}
            </div>
            <div className="text-muted-foreground">Confirmed Platforms</div>
          </div>
        </CardContent>
      </Card>

      {/* Information Note */}
      <Card className="max-w-2xl mx-auto border-hornet-accent/30 card-enhanced">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-2 text-hornet-accent">Platform Updates</h3>
          <p className="text-muted-foreground">
            Platform availability information is based on official announcements from Team Cherry. 
            We'll update this page as new platform confirmations are announced. 
            Keep checking back for the latest updates!
          </p>
        </CardContent>
      </Card>
        </div>
      </div>
    </>
  );
}