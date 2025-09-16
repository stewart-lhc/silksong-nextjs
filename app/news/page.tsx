'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Clock, Tag, Newspaper } from 'lucide-react';
import { useState } from 'react';

interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  content: string;
  category: 'Official' | 'Launch' | 'Update' | 'Community';
  source: string;
  author: string;
  lastUpdated?: string;
  tags: string[];
}

const newsItems: NewsItem[] = [
  {
    id: "1",
    date: "2025-09-04",
    title: "Hollow Knight: Silksong Officially Releases After 7 Years",
    summary: "Team Cherry's highly anticipated sequel is now available on all major platforms after seven years of development.",
    content: "Hollow Knight: Silksong has officially launched on September 4, 2025, marking the end of one of gaming's longest-awaited sequels. The game is available on PC (Steam, Windows Store), Xbox One, Xbox Series X|S (including Game Pass), Nintendo Switch, PlayStation 4, and PlayStation 5. Priced at $19.99 USD across all platforms, the game launches with day-one availability on Xbox Game Pass Ultimate and PC Game Pass.",
    category: "Launch",
    source: "https://teamcherry.com.au/",
    author: "Team Cherry",
    lastUpdated: "2025-09-04",
    tags: ["Release", "Launch", "All Platforms"]
  },
  {
    id: "2", 
    date: "2025-08-30",
    title: "Team Cherry Confirms September 4 Release Date",
    summary: "Official announcement reveals the exact launch date after years of speculation.",
    content: "In their 'Special Announcement,' Team Cherry confirmed that Hollow Knight: Silksong will release on September 4, 2025, at 7AM PT / 10AM ET / 4PM CEST / 11PM JST. The announcement addressed the long development period, with co-founders Ari Gibson and William Pellen explaining their development approach to Bloomberg, emphasizing that the game was never stuck in development hell but simply took time due to their small team size.",
    category: "Official",
    source: "https://teamcherry.com.au/",
    author: "Team Cherry", 
    lastUpdated: "2025-08-30",
    tags: ["Release Date", "Official Announcement"]
  },
  {
    id: "3",
    date: "2025-08-25",
    title: "Silksong Post-Launch: Localization Updates Coming Soon",
    summary: "Team Cherry addresses initial localization issues and commits to improvements.",
    content: "Following the game's launch, Team Cherry has acknowledged feedback about localization quality, particularly for Simplified Chinese translations. In a statement, the team committed to releasing localization improvements in the coming weeks, demonstrating their ongoing support for the international player base. This reflects their dedication to ensuring all players can fully enjoy the Silksong experience regardless of language.",
    category: "Update",
    source: "https://teamcherry.com.au/",
    author: "Team Cherry",
    lastUpdated: "2025-08-25", 
    tags: ["Post-Launch", "Localization", "Updates"]
  },
  {
    id: "4",
    date: "2025-04-15",
    title: "Silksong Featured in Nintendo Direct with 2025 Confirmation",
    summary: "Nintendo Direct presentation confirms 2025 release window for Silksong.",
    content: "Hollow Knight: Silksong appeared in a Nintendo Direct presentation, officially confirming a 2025 release window. The appearance marked one of the first official updates about the game's progress in recent months, generating significant excitement in the gaming community. The Direct showcased brief new gameplay footage and reinforced Team Cherry's commitment to launching the game within 2025.",
    category: "Official",
    source: "https://nintendo.com/",
    author: "Nintendo Direct",
    lastUpdated: "2025-04-15",
    tags: ["Nintendo Direct", "2025 Release", "Gameplay"]
  },
  {
    id: "5", 
    date: "2025-01-10",
    title: "Team Cherry Responds to Development Rumors",
    summary: "Matthew Griffin confirms active development amid online speculation.",
    content: "Team Cherry's Matthew Griffin officially addressed online rumors about the game's development status, confirming that Hollow Knight: Silksong was 'still in active development, progressing, and still planned for release.' This statement came in response to growing speculation and rumors circulating in gaming communities about potential development issues or delays.",
    category: "Official",
    source: "https://teamcherry.com.au/",
    author: "Matthew Griffin (Team Cherry)",
    lastUpdated: "2025-01-10",
    tags: ["Development Update", "Team Cherry Statement"]
  }
];

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
};

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};


const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Official':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Launch':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Update':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'Community':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', 'Official', 'Launch', 'Update', 'Community'];
  
  // Generate NewsArticle structured data for latest news items
  const newsStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Silksong News",
    "description": "Latest news and updates for Hollow Knight: Silksong",
    "publisher": {
      "@type": "Organization",
      "name": "Silk Song Archive",
      "url": "https://silksong-archive.com"
    },
    "mainEntity": newsItems.slice(0, 3).map(item => ({
      "@type": "NewsArticle",
      "headline": item.title,
      "description": item.summary,
      "author": {
        "@type": "Person",
        "name": item.author
      },
      "datePublished": item.date,
      "dateModified": item.lastUpdated || item.date,
      "publisher": {
        "@type": "Organization", 
        "name": "Team Cherry",
        "url": "https://teamcherry.com.au"
      }
    }))
  };
  
  const filteredNews = selectedCategory === 'All' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);
    
  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(newsStructuredData)
        }}
      />
      
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold fantasy-text mb-4 text-foreground">
              Silksong News
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Latest updates, official announcements, and development news for Hollow Knight: Silksong. 
              Stay informed with verified information from Team Cherry and official sources.
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Last updated: September 10, 2025
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">{newsItems.length}</div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </CardContent>
          </Card>
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">Released</div>
              <div className="text-sm text-muted-foreground">Game Status</div>
            </CardContent>
          </Card>
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">$19.99</div>
              <div className="text-sm text-muted-foreground">Current Price</div>
            </CardContent>
          </Card>
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">All Platforms</div>
              <div className="text-sm text-muted-foreground">Availability</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* News Articles */}
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredNews.map((item) => (
            <Card key={item.id} className="card-enhanced hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0 mt-1">
                      <Newspaper className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground mb-2 line-clamp-2">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-base mb-3">
                        {item.summary}
                      </CardDescription>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{getRelativeTime(item.date)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          By {item.author}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {item.content}
                </p>
                
                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Source Link */}
                <button
                  onClick={() => openExternalLink(item.source)}
                  className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors group/link"
                >
                  <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  <span className="underline">Read Original Source</span>
                </button>
                
                {item.lastUpdated && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Last updated: {formatDate(item.lastUpdated)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <Card className="max-w-2xl mx-auto mt-12 card-enhanced">
          <CardHeader>
            <CardTitle className="text-center">Stay Updated</CardTitle>
            <CardDescription className="text-center">
              Follow official channels for the latest Silksong news and announcements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <button 
                onClick={() => openExternalLink('https://teamcherry.com.au/')}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
              >
                <div className="font-medium text-foreground">Team Cherry Website</div>
                <div className="text-sm text-muted-foreground">Official developer blog</div>
              </button>
              <button 
                onClick={() => openExternalLink('https://x.com/teamcherry')}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
              >
                <div className="font-medium text-foreground">@TeamCherry</div>
                <div className="text-sm text-muted-foreground">Official Twitter updates</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center mt-8 text-sm text-muted-foreground max-w-2xl mx-auto">
          All news articles are compiled from official Team Cherry communications and verified gaming news sources. 
          For breaking news, follow Team Cherry&apos;s official channels.
        </div>
      </div>
    </div>
    </>
  );
}