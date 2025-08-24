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
  source: string;
}

const getStatusBadge = (status: ComparisonItem['status']) => {
  const statusConfig = {
    confirmed: {
      label: 'Confirmed',
      className: 'bg-green-600 text-white hover:bg-green-700',
      style: { backgroundColor: '#16a34a' }
    },
    hinted: {
      label: 'Hinted',
      className: 'bg-yellow-600 text-white hover:bg-yellow-700',
      style: { backgroundColor: '#f59e0b' }
    },
    tba: {
      label: 'TBA',
      className: 'bg-gray-600 text-white hover:bg-gray-700',
      style: { backgroundColor: '#6b7280' }
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Hollow Knight vs Silksong
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Comprehensive comparison between the beloved original and its highly anticipated sequel. 
          Track confirmed features, development hints, and community expectations.
        </p>
      </div>

      {/* Status Legend */}
      <Card className="mb-8">
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Side-by-side analysis of gameplay mechanics, story elements, and technical features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>
                Comparison of key features between Hollow Knight and Silksong based on available information
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Dimension</TableHead>
                  <TableHead>Hollow Knight</TableHead>
                  <TableHead>Silksong</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[200px]">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item: ComparisonItem, index: number) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.dimension}</TableCell>
                    <TableCell>{item.hollowKnight}</TableCell>
                    <TableCell>{item.silksong}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.source}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Unconfirmed Expectations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Unconfirmed Community Expectations</CardTitle>
          <CardDescription>
            Features and improvements hoped for by the community but not yet confirmed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unconfirmedExpectations.map((expectation: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-dashed"
              >
                <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                <span className="text-sm">{expectation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Stay Updated on Silksong Development</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/timeline">View Development Timeline</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/platforms">Check Platform Availability</Link>
          </Button>
          <Button variant="outline" asChild>
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