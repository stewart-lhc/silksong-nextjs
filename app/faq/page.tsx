import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Calendar, Gamepad2, Download, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ - Hollow Knight: Silksong',
  description: 'Frequently asked questions about Hollow Knight: Silksong including release date, platforms, gameplay, and story information from official sources.',
  keywords: ['Hollow Knight', 'Silksong', 'FAQ', 'questions', 'release date', 'gameplay', 'Team Cherry'],
  openGraph: {
    title: 'Silksong FAQ - Your Questions Answered',
    description: 'Find answers to the most common questions about Hollow Knight: Silksong, compiled from official sources.',
    type: 'website',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  }
};

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "release" | "gameplay" | "platforms" | "story" | "technical";
  lastUpdated?: string;
}

const faqItems: FAQItem[] = [
  {
    id: "1",
    question: "When will Hollow Knight: Silksong be released?",
    answer: "Hollow Knight: Silksong will be released on September 4, 2025. This date was officially confirmed by Team Cherry after years of development. The game was originally planned as DLC but expanded into a full sequel, and the team has been focused on delivering a polished experience.",
    category: "release",
    lastUpdated: "2025-08-22"
  },
  {
    id: "2",
    question: "Will Silksong be free for Hollow Knight owners?",
    answer: "No, Silksong is a full standalone sequel and will be sold separately. However, it will be available on Xbox Game Pass from day one. The game was originally planned as DLC called 'Hornet' but grew into a complete game.",
    category: "release",
    lastUpdated: "2023-06-12"
  },
  {
    id: "3", 
    question: "What platforms will Silksong be available on?",
    answer: "Silksong is officially confirmed for PC (Steam, Windows Store), Xbox One, and Xbox Series X|S with Game Pass support. Nintendo Switch support is highly expected but not officially re-confirmed since the original announcement. PlayStation and other platforms have not been announced.",
    category: "platforms",
    lastUpdated: "2023-06-12"
  },
  {
    id: "4",
    question: "Do I need to play Hollow Knight first?",
    answer: "While Silksong is a sequel, Team Cherry has designed it to be accessible to new players. However, playing Hollow Knight first will enhance your understanding of the world, lore, and characters, especially Hornet's role in the story.",
    category: "story",
    lastUpdated: "2023-01-10"
  },
  {
    id: "5",
    question: "Will the gameplay be similar to Hollow Knight?",
    answer: "Yes, Silksong retains the core Metroidvania gameplay with precise platforming and combat. However, playing as Hornet introduces new mechanics like thread-based abilities, a different movement style, and new tools that differentiate the experience from the original.",
    category: "gameplay",
    lastUpdated: "2023-01-10"
  },
  {
    id: "6",
    question: "How long will Silksong be?",
    answer: "Team Cherry has stated that Silksong will be larger than Hollow Knight. The original game offered 30-60+ hours of content depending on completion level, so players can expect a substantial experience with Silksong.",
    category: "gameplay",
    lastUpdated: "2022-06-15"
  },
  {
    id: "7",
    question: "Will there be DLC for Silksong?",
    answer: "Team Cherry hasn't announced any DLC plans for Silksong. Their focus is entirely on completing the base game first. Any future content decisions will likely be made after the game's release.",
    category: "release",
    lastUpdated: "2023-01-10"
  },
  {
    id: "8",
    question: "Can I pre-order Silksong?",
    answer: "Pre-orders are not yet available for Silksong. Team Cherry will announce pre-order availability closer to the release date. Be wary of any sites claiming to offer pre-orders, as these may not be legitimate.",
    category: "release",
    lastUpdated: "2024-01-15"
  },
  {
    id: "9",
    question: "What are the system requirements?",
    answer: "Official system requirements have not been announced yet. Given that it's built on a similar engine to Hollow Knight, requirements should be modest. Team Cherry will release official specifications closer to launch.",
    category: "technical",
    lastUpdated: "2023-12-01"
  },
  {
    id: "10",
    question: "Will there be multiplayer or co-op?",
    answer: "Silksong is designed as a single-player experience, similar to Hollow Knight. Team Cherry has not announced any multiplayer features, focusing instead on delivering a polished solo adventure.",
    category: "gameplay",
    lastUpdated: "2023-01-10"
  }
];

const categoryInfo = {
  release: { icon: Calendar, label: "Release", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  gameplay: { icon: Gamepad2, label: "Gameplay", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  platforms: { icon: Download, label: "Platforms", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  story: { icon: Users, label: "Story", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  technical: { icon: HelpCircle, label: "Technical", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" }
};

export default function FAQPage() {
  const groupedFAQs = Object.entries(categoryInfo).map(([category, info]) => ({
    category: category as keyof typeof categoryInfo,
    info,
    items: faqItems.filter(item => item.category === category)
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold fantasy-text mb-4 text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to the most common questions about Hollow Knight: Silksong, 
              compiled from official sources and Team Cherry communications.
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Last updated: August 21, 2025
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="text-center card-enhanced">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-hornet-secondary">{faqItems.length}</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </CardContent>
        </Card>
        <Card className="text-center card-enhanced">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-hornet-secondary">5</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
        <Card className="text-center card-enhanced">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-hornet-secondary">2025</div>
            <div className="text-sm text-muted-foreground">Last Updated</div>
          </CardContent>
        </Card>
        <Card className="text-center card-enhanced">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-hornet-secondary">Sept 4</div>
            <div className="text-sm text-muted-foreground">Release Date</div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Categories */}
      <div className="max-w-4xl mx-auto space-y-8">
        {groupedFAQs.map(({ category, info, items }) => {
          if (items.length === 0) return null;
          
          const Icon = info.icon;
          
          return (
            <Card key={category} className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  {info.label}
                  <Badge className={info.color}>
                    {items.length} questions
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {category === 'release' && 'Questions about release dates, pricing, and availability'}
                  {category === 'gameplay' && 'Questions about game mechanics, length, and features'}
                  {category === 'platforms' && 'Questions about supported platforms and compatibility'}
                  {category === 'story' && 'Questions about the story, characters, and connections to Hollow Knight'}
                  {category === 'technical' && 'Questions about system requirements and technical details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {items.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <p className="text-muted-foreground leading-relaxed">
                            {item.answer}
                          </p>
                          {item.lastUpdated && (
                            <div className="text-xs text-muted-foreground">
                              Last updated: {new Date(item.lastUpdated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Resources */}
      <Card className="max-w-2xl mx-auto mt-12 card-enhanced">
        <CardHeader>
          <CardTitle className="text-center">Still Have Questions?</CardTitle>
          <CardDescription className="text-center">
            Can&apos;t find what you&apos;re looking for? Check these official sources for the latest information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href="https://teamcherry.com.au/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <div className="font-medium text-foreground">Team Cherry Website</div>
              <div className="text-sm text-muted-foreground">Official developer blog and updates</div>
            </a>
            <a 
              href="https://x.com/teamcherry" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
            >
              <div className="font-medium text-foreground">X</div>
              <div className="text-sm text-muted-foreground">Latest news and announcements</div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-center mt-8 text-sm text-muted-foreground max-w-2xl mx-auto">
        Information on this page is compiled from official Team Cherry communications and may change. 
        For the most up-to-date information, always check Team Cherry&apos;s official channels.
      </div>
      </div>
    </div>
  );
}