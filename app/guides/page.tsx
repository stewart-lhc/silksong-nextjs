import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Users, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Game Guides - Hollow Knight: Silksong',
  description: 'Comprehensive guides for Hollow Knight: Silksong. Learn gameplay mechanics, combat strategies, character abilities, and tips for mastering the kingdom of Pharloom.',
  keywords: ['Silksong guides', 'gameplay tips', 'combat strategies', 'Hornet abilities', 'Pharloom exploration', 'boss fights', 'metroidvania guide'],
  openGraph: {
    title: 'Silksong Game Guides - Master the Kingdom of Pharloom',
    description: 'Essential guides and strategies for Hollow Knight: Silksong gameplay.',
    type: 'website',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  }
};

interface GuideSection {
  id: string;
  title: string;
  description: string;
  category: "Beginner" | "Advanced" | "Combat" | "Exploration" | "Story";
  readTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  content: string;
  tags: string[];
}

const guideSections: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting Started with Hollow Knight: Silksong",
    description: "Essential tips for new players beginning their journey in Pharloom",
    category: "Beginner",
    readTime: 8,
    difficulty: "Easy",
    tags: ["Basics", "Tutorial", "First Steps"],
    content: `
      Welcome to the kingdom of Pharloom! Hollow Knight: Silksong introduces players to a completely new world with Hornet as the protagonist. This guide will help you understand the fundamental mechanics and get you started on your adventure.

      **Understanding Hornet's Abilities**
      Unlike the Knight from Hollow Knight, Hornet has a unique set of abilities centered around thread manipulation and agile combat. Her primary weapon is her needle, which she can use for both melee attacks and thread-based abilities. Mastering these abilities is crucial for progress through Pharloom.

      **Basic Movement and Navigation**
      Hornet's movement feels different from the Knight. She's more agile and has unique traversal options. Practice wall-climbing, thread-swinging, and her signature dash abilities early on. These movement skills are essential for both exploration and combat encounters.

      **Resource Management**
      In Silksong, managing your resources effectively is key to survival. Keep track of your thread supplies, health items, and special abilities. Unlike Hollow Knight's Soul system, Silksong introduces new mechanics for ability usage that require strategic thinking.

      **Early Game Priorities**
      Focus on exploring thoroughly to find upgrades and tools. Don't rush through areas - Silksong rewards careful exploration with hidden secrets, ability upgrades, and lore. Take time to learn enemy patterns and practice combat techniques in safe areas.

      **Save Points and Progression**
      Understanding the save system in Silksong is important for efficient progress. Learn where save points are located and plan your exploration routes accordingly. Death mechanics work differently than in Hollow Knight, so understanding the consequences of failure is crucial.
    `
  },
  {
    id: "combat-system",
    title: "Mastering Silksong's Combat System",
    description: "Advanced combat techniques, enemy patterns, and battle strategies",
    category: "Combat",
    readTime: 12,
    difficulty: "Medium",
    tags: ["Combat", "Fighting", "Strategies", "Enemies"],
    content: `
      Combat in Hollow Knight: Silksong requires precision, timing, and strategic thinking. Hornet's combat style is distinct from the Knight's, emphasizing speed and versatility over brute force.

      **Needle Combat Fundamentals**
      Hornet's needle serves as both her primary weapon and a tool for thread abilities. Master the basic attack patterns: quick strikes for fast enemies, charged attacks for armored foes, and aerial combos for elevated combat. The needle's reach is longer than the Knight's nail, allowing for safer engagement distances.

      **Thread Abilities in Combat**
      Thread-based abilities are central to Silksong's combat system. These abilities consume thread resources but provide powerful offensive and defensive options. Learn to manage your thread gauge effectively, knowing when to use abilities and when to conserve resources for critical moments.

      **Enemy Pattern Recognition**
      Pharloom's enemies have unique attack patterns and behaviors. Study each enemy type to understand their weaknesses and optimal engagement strategies. Some enemies are vulnerable to specific attack types or require particular approaches to defeat efficiently.

      **Defensive Techniques**
      Unlike Hollow Knight, Silksong places greater emphasis on active defense. Master dodging, parrying, and using environmental advantages. Hornet's agility allows for more dynamic defensive play, but requires precise timing and positioning.

      **Boss Battle Strategies**
      Boss fights in Silksong are challenging encounters that test all your combat skills. Each boss has distinct phases, attack patterns, and vulnerability windows. Patience and observation are key - learn the patterns before attempting aggressive strategies.

      **Combat Upgrades and Tools**
      Throughout Pharloom, you'll discover tools and upgrades that enhance your combat effectiveness. These range from needle modifications to new thread abilities. Experiment with different combinations to find strategies that suit your playstyle.
    `
  },
  {
    id: "exploration-guide",
    title: "Exploring the Kingdom of Pharloom",
    description: "Navigation tips, secret areas, and progression routes through Silksong's world",
    category: "Exploration",
    readTime: 15,
    difficulty: "Medium",
    tags: ["Exploration", "Secrets", "Navigation", "World Design"],
    content: `
      Pharloom is a vast and intricate kingdom filled with secrets, hidden paths, and areas that require specific abilities to access. Effective exploration is crucial for progression and discovering the game's many secrets.

      **Understanding Pharloom's Structure**
      The kingdom of Pharloom is designed as an interconnected world with multiple distinct regions. Each area has its own theme, enemy types, and environmental challenges. Understanding how these areas connect helps plan efficient exploration routes.

      **Progression Gates and Ability Requirements**
      Many areas in Pharloom are gated behind specific abilities or tools. Unlike Hollow Knight's more open structure, Silksong often requires specific thread abilities or tools to access new regions. Keep track of areas you couldn't fully explore and return when you have the necessary abilities.

      **Secret Areas and Hidden Content**
      Silksong is filled with secret areas containing valuable upgrades, lore, and collectibles. Look for environmental clues like unusual wall textures, hidden passages, and areas that seem incomplete. Hornet's thread abilities often reveal new paths and secret areas.

      **Environmental Storytelling**
      Pay attention to environmental details as you explore. Pharloom's history and lore are told through visual storytelling, background details, and subtle environmental cues. Taking time to observe your surroundings enhances understanding of the world and its inhabitants.

      **Mapping and Navigation**
      While exploring, create mental maps of areas and their connections. Note the locations of save points, shops, and areas requiring specific abilities. This knowledge becomes invaluable for efficient backtracking and route planning.

      **Resource Discovery**
      Thorough exploration rewards players with resources, upgrades, and tools. Search thoroughly in each area before moving on, as some resources are hidden in unexpected locations or require specific abilities to reach.
    `
  },
  {
    id: "character-progression",
    title: "Character Development and Abilities",
    description: "Understanding Hornet's growth, ability trees, and customization options",
    category: "Advanced",
    readTime: 10,
    difficulty: "Medium",
    tags: ["Character Growth", "Abilities", "Upgrades", "Customization"],
    content: `
      Character progression in Silksong involves multiple systems that allow players to customize Hornet's abilities and playstyle. Understanding these systems is crucial for effective character development.

      **Ability Acquisition and Mastery**
      Throughout your journey in Pharloom, Hornet gains new abilities that expand her combat and traversal options. Each ability has different uses in combat, exploration, and puzzle-solving. Mastering the timing and application of these abilities is essential for progression.

      **Thread System and Resource Management**
      The thread system is central to Hornet's abilities. Different actions consume thread resources, and managing this resource effectively determines your combat and exploration capabilities. Learn which abilities are worth the thread cost in different situations.

      **Equipment and Tool Integration**
      Silksong features various tools and equipment pieces that modify Hornet's capabilities. These items can change how abilities function, provide new combat options, or enhance exploration capabilities. Experiment with different combinations to find optimal setups.

      **Playstyle Customization**
      The game allows for different playstyle approaches through ability selection and equipment choices. Whether you prefer aggressive combat, defensive strategies, or exploration-focused builds, Silksong provides options to support various approaches.

      **Advanced Technique Development**
      As you progress, combining basic abilities creates advanced techniques. These combinations often reveal new approaches to combat encounters and exploration challenges. Practice ability combinations to discover powerful techniques.

      **Character Growth Philosophy**
      Unlike traditional RPG progression, Silksong's character development is more about expanding options than raw power increases. Focus on versatility and adaptability rather than simple damage or health increases.
    `
  },
  {
    id: "boss-strategies",
    title: "Boss Battle Guide and Strategies",
    description: "Detailed strategies for major boss encounters in Silksong",
    category: "Combat",
    readTime: 18,
    difficulty: "Hard",
    tags: ["Boss Fights", "Advanced Combat", "Strategies", "Endgame"],
    content: `
      Boss battles in Hollow Knight: Silksong are complex, multi-phase encounters that test your mastery of all game systems. Each boss requires specific strategies and thorough understanding of their mechanics.

      **General Boss Battle Principles**
      Before engaging any boss, ensure you're adequately prepared with necessary abilities, resources, and equipment. Study boss patterns through observation before attempting aggressive strategies. Most bosses have distinct phases with different behaviors and vulnerabilities.

      **Hunter Queen Carmelita Strategy**
      As one of the early major bosses, Hunter Queen Carmelita introduces players to Silksong's boss design philosophy. She features multiple attack patterns, environmental hazards, and phase transitions. Success requires mastering dodge timing, understanding vulnerability windows, and managing thread resources effectively.

      **Lace Combat Guide**
      Lace represents a unique challenge as a fellow thread-wielder. Her combat style mirrors some of Hornet's abilities, creating dynamic encounters where prediction and reaction are crucial. Understanding her thread-based attacks and countering them effectively is key to victory.

      **Steel Assassin Sharpe Tactics**
      This mechanical boss requires different approaches than organic enemies. Sharpe's attacks are precise and powerful, demanding exact timing and positioning. Learning to exploit mechanical vulnerabilities while avoiding devastating attacks is essential for success.

      **Environmental Boss Encounters**
      Some bosses incorporate environmental elements into their encounters. These fights require awareness of surroundings, using environmental advantages, and avoiding environmental hazards while maintaining offensive pressure.

      **Multi-Phase Boss Management**
      Many bosses feature multiple distinct phases with different mechanics and strategies. Learn to recognize phase transitions, adapt strategies accordingly, and manage resources across extended encounters. Some phases may require completely different approaches than others.

      **Advanced Boss Techniques**
      Experienced players can develop advanced techniques for boss encounters, including specific ability combinations, precise timing strategies, and optimal resource management. These techniques often significantly reduce encounter difficulty and time.
    `
  }
];

export default function GuidesPage() {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beginner': return BookOpen;
      case 'Combat': return Target;
      case 'Exploration': return Users;
      case 'Advanced': return Zap;
      case 'Story': return Users;
      default: return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Beginner': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Combat': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Exploration': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Advanced': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Story': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold fantasy-text mb-6 text-foreground">
              Silksong Game Guides
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Master the kingdom of Pharloom with our comprehensive guides covering combat, exploration, 
              character progression, and advanced strategies for Hollow Knight: Silksong.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                Updated for Release Version
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1">
                Beginner to Advanced
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-3 py-1">
                Comprehensive Coverage
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">{guideSections.length}</div>
              <div className="text-sm text-muted-foreground">Guide Sections</div>
            </CardContent>
          </Card>
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">60+</div>
              <div className="text-sm text-muted-foreground">Minutes Reading</div>
            </CardContent>
          </Card>
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">All Levels</div>
              <div className="text-sm text-muted-foreground">Difficulty Range</div>
            </CardContent>
          </Card>
          <Card className="text-center card-enhanced">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-hornet-secondary">Updated</div>
              <div className="text-sm text-muted-foreground">September 2025</div>
            </CardContent>
          </Card>
        </div>

        {/* Guide Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Beginner', 'Combat', 'Exploration', 'Advanced', 'Story'].map((category) => {
              const count = guideSections.filter(guide => guide.category === category).length;
              const Icon = getCategoryIcon(category);
              
              return (
                <Card key={category} className="card-enhanced hover:border-primary/50 transition-all duration-300">
                  <CardContent className="pt-6 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold text-foreground mb-2">{category}</h3>
                    <p className="text-sm text-muted-foreground">{count} guides available</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Guides */}
        <div className="max-w-4xl mx-auto space-y-8">
          {guideSections.map((guide) => {
            const Icon = getCategoryIcon(guide.category);
            
            return (
              <Card key={guide.id} className="card-enhanced">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 shrink-0 mt-1">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-foreground mb-2">
                          {guide.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mb-3">
                          {guide.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getCategoryColor(guide.category)}>
                            {guide.category}
                          </Badge>
                          <Badge className={getDifficultyColor(guide.difficulty)}>
                            {guide.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{guide.readTime} min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {guide.content.split('\n\n').slice(0, 2).map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph.replace(/\*\*(.*?)\*\*/g, '$1').trim()}
                      </p>
                    ))}
                  </div>
                  
                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground font-medium">Tags:</span>
                    {guide.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Resources */}
        <Card className="max-w-2xl mx-auto mt-12 card-enhanced">
          <CardHeader>
            <CardTitle className="text-center">Need More Help?</CardTitle>
            <CardDescription className="text-center">
              Check out these additional resources for Hollow Knight: Silksong.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                href="/faq"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center border-hornet-primary/30 bg-hornet-primary/5"
              >
                <div className="font-medium text-foreground">FAQ Section</div>
                <div className="text-sm text-muted-foreground">Common questions answered</div>
              </Link>
              <Link 
                href="/what-is-silksong"
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-center"
              >
                <div className="font-medium text-foreground">What is Silksong?</div>
                <div className="text-sm text-muted-foreground">Complete beginner&apos;s guide</div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="text-center mt-8 text-sm text-muted-foreground max-w-2xl mx-auto">
          These guides are based on the released version of Hollow Knight: Silksong and community gameplay analysis. 
          Strategies may evolve as the community discovers new techniques and approaches.
        </div>
      </div>
    </div>
  );
}