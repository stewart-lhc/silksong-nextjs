import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import comparisonData from '@/data/comparison.json';

export const metadata: Metadata = {
  title: 'Hollow Knight vs Silksong Comparison | Complete Feature Analysis',
  description: 'Detailed comparison between Hollow Knight and Silksong features, gameplay mechanics, and confirmed differences. Track development progress and expectations.',
  keywords: ['hollow knight vs silksong', 'silksong comparison', 'hollow knight differences', 'silksong features'],
  openGraph: {
    title: 'Hollow Knight vs Silksong - Complete Comparison Guide',
    description: 'Comprehensive analysis of differences between Hollow Knight and Silksong',
    type: 'article',
  },
};

interface ComparisonItem {
  dimension: string;
  hollowKnight: string;
  silksong: string;
  status: 'confirmed' | 'hinted' | 'tba';
  source: {
    label: string;
    url: string;
  };
}

interface UnconfirmedExpectation {
  expectation: string;
  rationale: string;
}

const getStatusBadge = (status: ComparisonItem['status']) => {
  const statusConfig = {
    confirmed: {
      label: 'Confirmed',
      className: 'bg-hornet-secondary text-white hover:bg-hornet-secondary/80',
      style: { backgroundColor: 'var(--hornet-secondary)' }
    },
    hinted: {
      label: 'Hinted',
      className: 'bg-hornet-accent text-white hover:bg-hornet-accent/80',
      style: { backgroundColor: 'var(--hornet-accent)' }
    },
    tba: {
      label: 'TBA',
      className: 'bg-hornet-dark text-white hover:bg-hornet-dark/80',
      style: { backgroundColor: 'var(--hornet-dark)' }
    }
  };

  const config = statusConfig[status];
  return (
    <Badge 
      className={config.className}
      style={config.style}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </Badge>
  );
};

export default function CompareHollowKnightPage() {
  const { comparisonData: data, unconfirmedExpectations } = comparisonData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl moss-texture min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 fantasy-text">
          Hollow Knight vs <span className="text-primary">Silksong</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-3">
          Comprehensive comparison between the beloved original and its highly anticipated sequel. 
          Track confirmed features, development hints, and community expectations.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-primary opacity-80 animate-pulse"></div>
          <span className="text-primary font-medium">Silksong highlighted as the featured upcoming release</span>
        </div>
      </div>

      {/* Status Legend */}
      <Card className="mb-8 card-enhanced">
        <CardHeader>
          <CardTitle className="text-lg">Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {getStatusBadge('confirmed')}
              <span className="text-sm">Officially confirmed by Team Cherry</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge('hinted')}
              <span className="text-sm">Hinted at in interviews or trailers</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge('tba')}
              <span className="text-sm">To be announced or community speculation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="mb-8 card-enhanced relative">
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg opacity-60"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, hsl(351 77% 52%) 50%, transparent 100%)' }}
        />
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <CardTitle>Feature Comparison</CardTitle>
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                backgroundColor: 'hsl(351 77% 52% / 0.1)', 
                color: 'hsl(351 77% 60%)', 
                border: '1px solid hsl(351 77% 52% / 0.3)' 
              }}
            >
              Silksong Featured
            </Badge>
          </div>
          <CardDescription>
            Side-by-side analysis of gameplay mechanics, story elements, and technical features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>
                Comparison of key features between Hollow Knight and Silksong based on available information.
                The Silksong column is highlighted to emphasize it as the featured upcoming release.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Dimension</TableHead>
                  <TableHead>Hollow Knight</TableHead>
                  <TableHead 
                    className="font-semibold relative pl-4"
                    style={{
                      background: 'linear-gradient(135deg, hsl(351 77% 52% / 0.08) 0%, hsl(351 77% 52% / 0.12) 100%)',
                      color: 'hsl(351 77% 60%)',
                      borderLeft: '3px solid hsl(351 77% 52%)'
                    }}
                    aria-label="Silksong features - highlighted as the featured upcoming game"
                  >
                    <span className="relative">
                      Silksong
                      <div 
                        className="absolute -left-[15px] top-1/2 w-1.5 h-1.5 rounded-full"
                        style={{
                          background: 'hsl(351 77% 52%)',
                          transform: 'translateY(-50%)',
                          boxShadow: '0 0 8px hsl(351 77% 52% / 0.4)'
                        }}
                      />
                    </span>
                  </TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[200px]">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index: number) => (
                  <TableRow key={index} className="hover:bg-muted/50 group silksong-table-row">
                    <TableCell className="font-medium">{item.dimension}</TableCell>
                    <TableCell>{item.hollowKnight}</TableCell>
                    <TableCell 
                      className="font-medium pl-3 relative transition-all duration-200 silksong-cell"
                      style={{
                        background: 'linear-gradient(135deg, hsl(351 77% 52% / 0.03) 0%, hsl(351 77% 52% / 0.06) 100%)',
                        borderLeft: '2px solid hsl(351 77% 52% / 0.3)'
                      }}
                    >
                      <div className="relative">
                        {item.silksong}
                        <div 
                          className="absolute right-0 top-0 bottom-0 w-px opacity-60"
                          style={{
                            background: 'linear-gradient(to bottom, transparent 0%, hsl(351 77% 52% / 0.2) 50%, transparent 100%)'
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status as ComparisonItem['status'])}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <a 
                        href={item.source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-hornet-accent hover:text-hornet-light underline underline-offset-2"
                      >
                        {item.source.label}
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Unconfirmed Expectations */}
      <Card className="mb-8 card-enhanced">
        <CardHeader>
          <CardTitle>Community Expectations & Potential Features</CardTitle>
          <CardDescription>
            Features and improvements hoped for by the community but not yet confirmed by Team Cherry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unconfirmedExpectations.map((item: UnconfirmedExpectation, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gradient-to-br from-hornet-dark/5 to-hornet-accent/5 border border-hornet-accent/20 hover:border-hornet-accent/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-hornet-accent flex-shrink-0 mt-2" />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium text-sm text-foreground">{item.expectation}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.rationale}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold mb-4 text-hornet-light">Stay Updated on Silksong Development</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild className="btn-fantasy">
            <Link href="/timeline">View Development Timeline</Link>
          </Button>
          <Button variant="outline" asChild className="btn-outline-fantasy">
            <Link href="/platforms">Check Platform Availability</Link>
          </Button>
          <Button variant="outline" asChild className="btn-outline-fantasy">
            <Link href="/checklist">Progress Checklist</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Information updated regularly based on official announcements and community findings
        </p>
      </div>
    </div>
  );
}