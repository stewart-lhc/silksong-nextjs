'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, CheckCircle, Circle, Printer, RotateCcw, Share2, User } from 'lucide-react';
import checklistData from '@/data/checklist.json';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

export default function ChecklistPage() {
  const [checklist, setChecklist] = useState<ChecklistCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState<string>('');

  // Load checklist and user name from localStorage or use default data
  useEffect(() => {
    const savedChecklist = localStorage.getItem('silksong-checklist');
    const savedUserName = localStorage.getItem('silksong-checklist-username');
    
    if (savedChecklist) {
      try {
        setChecklist(JSON.parse(savedChecklist));
      } catch (error) {
        console.error('Error parsing saved checklist:', error);
        setChecklist(checklistData);
      }
    } else {
      setChecklist(checklistData);
    }

    if (savedUserName) {
      setUserName(savedUserName);
    }

    // Expand all categories by default
    setExpandedCategories(new Set(checklistData.map(cat => cat.id)));
  }, []);

  // Save checklist and username to localStorage whenever they change
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem('silksong-checklist', JSON.stringify(checklist));
    }
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('silksong-checklist-username', userName);
  }, [userName]);

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklist(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return category;
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategoryProgress = (category: ChecklistCategory): number => {
    const completedItems = category.items.filter(item => item.completed).length;
    return Math.round((completedItems / category.items.length) * 100);
  };

  const getOverallProgress = (): number => {
    const totalItems = checklist.reduce((sum, category) => sum + category.items.length, 0);
    const completedItems = checklist.reduce((sum, category) => 
      sum + category.items.filter(item => item.completed).length, 0
    );
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      setChecklist(checklistData);
      localStorage.removeItem('silksong-checklist');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const overallProgress = getOverallProgress();
    const shareText = `${userName ? `${userName}'s ` : ''}Silksong Readiness Progress: ${overallProgress}% complete! 🦋\n\nGet ready for Hollow Knight: Silksong with this comprehensive checklist.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Silksong Readiness Checklist',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare(shareText, shareUrl);
      }
    } else {
      fallbackShare(shareText, shareUrl);
    }
  };

  const fallbackShare = (text: string, url: string) => {
    const fullText = `${text}\n\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    });
  };

  const getCategoryIcon = (categoryId: string): string => {
    const icons: Record<string, string> = {
      account: '👤',
      lore: '📚',
      hardware: '⚙️',
      community: '👥'
    };
    return icons[categoryId] || '📋';
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold fantasy-text mb-4 text-foreground">
              Silksong Readiness Checklist
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Prepare yourself for the ultimate Hollow Knight: Silksong experience
            </p>
            
            {/* User Name Input */}
            <div className="max-w-sm mx-auto mb-6">
              <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-3 border">
                <User className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent border-none text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Overall Progress */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {userName ? `${userName}'s Progress` : 'Overall Progress'}
                </span>
                <span className="text-sm text-muted-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 print:hidden">
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePrint}
            className="w-12 h-12 bg-hornet-primary hover:bg-hornet-dark text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center group"
            title="Print Checklist"
          >
            <Printer className="w-5 h-5" />
            <span className="absolute right-14 bg-black/80 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Print Checklist
            </span>
          </button>
          <button
            onClick={handleShare}
            className="w-12 h-12 bg-hornet-secondary hover:bg-hornet-accent text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center group"
            title="Share Progress"
          >
            <Share2 className="w-5 h-5" />
            <span className="absolute right-14 bg-black/80 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Share Progress
            </span>
          </button>
          <button
            onClick={resetProgress}
            className="w-12 h-12 bg-hornet-dark hover:bg-hornet-primary text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center group"
            title="Reset Progress"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="absolute right-14 bg-black/80 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Reset Progress
            </span>
          </button>
        </div>
      </div>

      {/* Checklist Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {checklist.map((category) => {
            const progress = getCategoryProgress(category);
            const isExpanded = expandedCategories.has(category.id);
            const completedItems = category.items.filter(item => item.completed).length;

            return (
              <Card 
                key={category.id} 
                className="card-enhanced print:bg-white print:border-black print:shadow-none"
              >
                <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-hornet-dark/10 transition-colors print:hover:bg-transparent">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl print:text-lg">{getCategoryIcon(category.id)}</span>
                          <div>
                            <CardTitle className="text-xl text-foreground print:text-black">
                              {category.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground print:text-gray-700">
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge 
                              variant={progress === 100 ? "default" : "secondary"}
                              className="mb-2 print:border print:border-black"
                            >
                              {completedItems}/{category.items.length} completed
                            </Badge>
                            <div className="w-24">
                              <Progress value={progress} className="h-2" />
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-hornet-accent print:hidden" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-hornet-accent print:hidden" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div 
                            key={item.id}
                            className="flex items-center space-x-3 p-3 rounded-lg bg-hornet-dark/10 hover:bg-hornet-dark/20 transition-colors print:bg-transparent print:hover:bg-transparent print:border print:border-gray-300"
                          >
                            <Checkbox
                              id={item.id}
                              checked={item.completed}
                              onCheckedChange={() => toggleItem(category.id, item.id)}
                              className="print:scale-125"
                            />
                            <label 
                              htmlFor={item.id}
                              className={`flex-1 text-sm cursor-pointer transition-colors ${
                                item.completed 
                                  ? 'text-muted-foreground line-through print:text-gray-600' 
                                  : 'text-foreground print:text-black'
                              }`}
                            >
                              {item.text}
                            </label>
                            {item.completed ? (
                              <CheckCircle className="w-4 h-4 text-hornet-secondary print:text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-hornet-accent/50 print:text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}

          {/* Summary Card */}
          <Card className="card-enhanced print:bg-white print:border-black">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4 print:text-black">
                  {userName ? `${userName}'s Checklist Summary` : 'Checklist Summary'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {checklist.map((category) => {
                    const completedItems = category.items.filter(item => item.completed).length;
                    return (
                      <div key={category.id} className="text-center">
                        <div className="text-2xl mb-1">{getCategoryIcon(category.id)}</div>
                        <div className="text-sm text-muted-foreground print:text-gray-600">
                          {category.title}
                        </div>
                        <div className="text-lg font-bold text-foreground print:text-black">
                          {completedItems}/{category.items.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-sm print:text-gray-600">
                  Keep track of your preparation progress and ensure you're ready for Silksong's release!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-black { color: black !important; }
          .print\\:text-gray-600 { color: #6b7280 !important; }
          .print\\:text-gray-700 { color: #374151 !important; }
          .print\\:border-black { border-color: black !important; }
          .print\\:border-gray-300 { border-color: #d1d5db !important; }
          .print\\:text-green-600 { color: #059669 !important; }
          .print\\:text-gray-400 { color: #9ca3af !important; }
          .print\\:scale-125 { transform: scale(1.25) !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          .print\\:hover\\:bg-transparent:hover { background-color: transparent !important; }
          .print\\:border { border-width: 1px !important; }
          .print\\:text-lg { font-size: 1.125rem !important; }
          
          body { 
            background: white !important; 
            color: black !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }

        /* Mobile responsive adjustments for floating buttons */
        @media (max-width: 768px) {
          .fixed.right-6 {
            right: 1rem !important;
          }
          
          .fixed .group span {
            display: none !important;
          }
        }

        /* Ensure floating buttons don't interfere with content */
        @media (min-width: 1024px) {
          .container {
            padding-right: 6rem !important;
          }
        }
      `}</style>
    </div>
  );
}