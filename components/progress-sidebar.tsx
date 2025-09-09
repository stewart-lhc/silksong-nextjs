'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, Trophy, Target, Zap, User, RotateCcw, Share2, Printer, Hash } from 'lucide-react';
import { ChecklistCategory } from '@/types';

export interface ProgressSidebarProps {
  checklist: ChecklistCategory[];
  userName: string;
  onResetProgress: () => void;
  onShare: () => void;
  onPrint: () => void;
  onCategoryClick: (categoryId: string) => void;
  className?: string;
}

const getCategoryEmoji = (categoryId: string): string => {
  const emojiMap: Record<string, string> = {
    bosses: '👹',
    tools: '🔧',
    crests: '⚜️',
    abilities: '✨',
    'mask-shards': '🎭',
    'spool-fragments': '🧵',
    items: '📦',
    areas: '🗺️',
    npcs: '👤',
    quests: '📜'
  };
  return emojiMap[categoryId] || '📋';
};


export function ProgressSidebar({
  checklist,
  userName,
  onResetProgress,
  onShare,
  onPrint,
  onCategoryClick,
  className = ''
}: ProgressSidebarProps) {
  const progressData = useMemo(() => {
    const categories = checklist.map((category) => {
      const completedItems = category.items.filter(item => item.completed).length;
      const totalItems = category.items.length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      return {
        id: category.id,
        title: category.title,
        completedItems,
        totalItems,
        progress,
        isComplete: progress === 100
      };
    });

    const totalItems = categories.reduce((sum, cat) => sum + cat.totalItems, 0);
    const totalCompleted = categories.reduce((sum, cat) => sum + cat.completedItems, 0);
    const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
    const completedCategories = categories.filter(cat => cat.isComplete).length;

    return {
      categories,
      totalItems,
      totalCompleted,
      overallProgress,
      completedCategories,
      totalCategories: categories.length
    };
  }, [checklist]);

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 25) return 'text-orange-600';
    return 'text-red-600';
  };


  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Overall Progress Card */}
      <Card className="mb-6 bg-gradient-to-br from-hornet-primary/5 to-hornet-secondary/5 border-hornet-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-hornet-primary" />
            {userName ? `${userName}'s Progress` : 'Overall Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Progress Circle Visual */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressData.overallProgress / 100)}`}
                  className={`${getProgressColor(progressData.overallProgress)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${getProgressColor(progressData.overallProgress)}`}>
                  {progressData.overallProgress}%
                </span>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              {progressData.totalCompleted} of {progressData.totalItems} items completed
            </div>
            <div className="text-sm text-muted-foreground">
              {progressData.completedCategories} of {progressData.totalCategories} categories complete
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {progressData.completedCategories}
              </div>
              <div className="text-xs text-muted-foreground">Categories Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {progressData.totalCategories - progressData.completedCategories}
              </div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Hash className="w-4 h-4 text-hornet-accent" />
            Category Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 px-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {progressData.categories.map((category) => {
                return (
                  <div
                    key={category.id}
                    className={`p-2 rounded-lg border text-left ${
                      category.progress === 100 
                        ? 'border-green-200 bg-green-50'
                        : 'border-border bg-card'
                    }`}
                  >
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-sm">
                        {getCategoryEmoji(category.id)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-xs text-foreground truncate">
                          {category.title}
                        </div>
                      </div>
                      {category.isComplete && (
                        <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-muted/50 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            category.progress === 100 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-r from-hornet-primary to-hornet-secondary'
                          }`}
                          style={{ width: `${category.progress}%` }}
                        />
                      </div>
                      
                      {/* Progress Stats */}
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          {category.completedItems}/{category.totalItems}
                        </span>
                        <span className={`font-bold ${
                          category.progress === 100 
                            ? 'text-green-600' 
                            : getProgressColor(category.progress)
                        }`}>
                          {category.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>


    </div>
  );
}