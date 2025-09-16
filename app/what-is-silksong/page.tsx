import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight, Gamepad2, User, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WhatIsSilksongPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold fantasy-text mb-6 text-foreground">
              What is Hollow Knight: Silksong?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Everything you need to know about the highly anticipated sequel to Hollow Knight, 
              featuring Hornet as the protagonist in a brand new Metroidvania adventure.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1">
                Released September 4, 2025
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1">
                $19.99 USD
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 px-3 py-1">
                All Platforms
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Main Introduction */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  The Long-Awaited Sequel
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong className="text-foreground">Hollow Knight: Silksong</strong> is the highly anticipated sequel 
                    to Team Cherry&apos;s critically acclaimed Metroidvania masterpiece, Hollow Knight. Originally planned as 
                    DLC called &quot;Hornet,&quot; the project grew so ambitious that it became a full standalone game.
                  </p>
                  <p>
                    After seven years of development, Silksong was released on September 4, 2025, featuring Hornet — 
                    the princess-protector from the original game — as the main character exploring the mysterious 
                    kingdom of Pharloom.
                  </p>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/pressKit/Hornet_mid_shot.webp"
                  alt="Hornet, the protagonist of Hollow Knight: Silksong"
                  width={400}
                  height={600}
                  className="rounded-lg shadow-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Key Questions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Your Questions Answered
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Is it a Sequel or Prequel? */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Is Silksong a Sequel or Prequel?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  <strong className="text-foreground">Silksong is a sequel</strong>, not a prequel. 
                  The story takes place after the events of Hollow Knight, with Hornet traveling to 
                  the kingdom of Pharloom — a completely new setting separate from Hallownest.
                </p>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Timeline: Hollow Knight → Silksong → Future games
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Who is Hornet? */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  Who is Hornet?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Hornet is the princess-protector of Hallownest and daughter of Herrah the Beast. 
                  In the original game, she served as both ally and boss. Now she&apos;s the protagonist, 
                  wielding her needle and thread with deadly precision.
                </p>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    &quot;Shaw!&quot; — Hornet&apos;s iconic battle cry
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* New Kingdom */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Where Does It Take Place?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Silksong takes place in <strong className="text-foreground">Pharloom</strong>, 
                  a vast, silk-draped kingdom ruled by the Silk Song. This is an entirely new setting 
                  with its own lore, characters, and mysteries to uncover.
                </p>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    New areas, new enemies, new secrets to discover
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gameplay Changes */}
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-purple-500" />
                  How is Gameplay Different?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  While maintaining the core Metroidvania formula, Hornet plays differently from the Knight. 
                  She uses thread-based abilities, has a more aggressive movement style, and new tools 
                  that create unique gameplay mechanics.
                </p>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Faster, more aggressive, thread-based combat
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Do I Need to Play Hollow Knight First? */}
        <section className="mb-16">
          <Card className="max-w-4xl mx-auto card-enhanced border-hornet-secondary/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-hornet-secondary">
                Do I Need to Play Hollow Knight First?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">For New Players</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      Team Cherry designed Silksong to be accessible to newcomers. You can jump straight 
                      into Silksong and have a complete, satisfying experience without prior knowledge.
                    </p>
                    <p>
                      The game takes place in a new kingdom with new characters, making it perfect for 
                      first-time players to the series.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">For Maximum Enjoyment</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      Playing Hollow Knight first will enhance your understanding of Hornet&apos;s character, 
                      the world&apos;s lore, and references to the original game&apos;s events.
                    </p>
                    <p>
                      You&apos;ll appreciate character development and understand the deeper connections 
                      between the two games.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-hornet-secondary/10 rounded-lg border border-hornet-secondary/20">
                <p className="text-sm text-foreground text-center">
                  <strong>Our Recommendation:</strong> Both games are excellent entry points. 
                  Choose based on your preference — start with the original for the full story, 
                  or dive into Silksong for the latest adventure!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* What Makes Silksong Special */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            What Makes Silksong Special?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="card-enhanced text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🕷️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">New Protagonist</h3>
                <p className="text-muted-foreground">
                  Play as Hornet with her unique needle and thread abilities, 
                  offering a fresh perspective on Metroidvania gameplay.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-enhanced text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Larger Scale</h3>
                <p className="text-muted-foreground">
                  Team Cherry promises Silksong will be larger than Hollow Knight, 
                  with more areas, secrets, and content to explore.
                </p>
              </CardContent>
            </Card>
            
            <Card className="card-enhanced text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Refined Gameplay</h3>
                <p className="text-muted-foreground">
                  Built on seven years of development, featuring refined mechanics, 
                  improved accessibility, and polished experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-16">
          <Card className="max-w-3xl mx-auto card-enhanced">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Ready to Start Your Journey?</CardTitle>
              <CardDescription>
                Here&apos;s everything you need to know to get started with Silksong
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Release Info</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Released: September 4, 2025</li>
                      <li>• Price: $19.99 USD</li>
                      <li>• Available on Xbox Game Pass</li>
                      <li>• All major platforms supported</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">What to Expect</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• 30-60+ hours of content</li>
                      <li>• Challenging but fair difficulty</li>
                      <li>• Beautiful hand-drawn art</li>
                      <li>• Incredible soundtrack</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Link href="/platforms">
                    <Button className="btn-primary">
                      View Platforms & Pricing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/faq">
                    <Button variant="outline" className="btn-outline-fantasy">
                      Read FAQ
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Related Content */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Learn More About Silksong
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            <Link href="/news" className="group">
              <Card className="card-enhanced hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl mb-2">📰</div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Latest News
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Official updates and announcements
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/announcement" className="group">
              <Card className="card-enhanced hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Announcement History
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Development timeline since 2017
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/compare-hollow-knight" className="group">
              <Card className="card-enhanced hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl mb-2">⚔️</div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Compare Games
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Silksong vs Hollow Knight
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/developers" className="group">
              <Card className="card-enhanced hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    About Team Cherry
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Meet the developers
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto card-enhanced border-hornet-secondary/30">
            <CardContent className="pt-8">
              <h3 className="text-xl font-bold text-hornet-secondary mb-4">
                Ready to Experience Silksong?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join millions of players exploring the silk-draped kingdom of Pharloom. 
                Available now on all major platforms.
              </p>
              <Link href="/platforms">
                <Button size="lg" className="btn-primary">
                  Get Silksong Today
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}