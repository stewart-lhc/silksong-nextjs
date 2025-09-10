'use client';

import { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Trophy, Hash } from 'lucide-react';
import { ChecklistCategory } from '@/types';

// 性能优化：缓存分类图标
const CATEGORY_EMOJI_CACHE = new Map<string, string>([
  ['bosses', '👹'],
  ['tools', '🔧'],
  ['crests', '⚜️'],
  ['abilities', '✨'],
  ['mask-shards', '🎭'],
  ['spool-fragments', '🧵'],
  ['items', '📦'],
  ['areas', '🗺️'],
  ['npcs', '👤'],
  ['quests', '📜']
]);

// 性能优化：缓存的分类进度组件
interface CategoryProgress {
  id: string;
  title: string;
  completedItems: number;
  totalItems: number;
  progress: number;
  isComplete?: boolean;
}

const CategoryProgressItem = memo(({ category }: { category: CategoryProgress }) => {
  const emoji = CATEGORY_EMOJI_CACHE.get(category.id) || '📋';
  
  return (
    <div
      className={`p-2 rounded-lg border text-left ${
        category.progress === 100 
          ? 'border-green-200 bg-green-50'
          : 'border-border bg-card'
      }`}
    >
      {/* Category Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="text-sm">
          {emoji}
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
              : category.progress >= 80 
                ? 'text-blue-600'
                : category.progress >= 50 
                  ? 'text-yellow-600'
                  : category.progress >= 25
                    ? 'text-orange-600'
                    : 'text-red-600'
          }`}>
            {category.progress}%
          </span>
        </div>
      </div>
    </div>
  );
});

CategoryProgressItem.displayName = 'CategoryProgressItem';

export interface ProgressSidebarProps {
  checklist: ChecklistCategory[];
  userName: string;
  onResetProgress: () => void;
  onShare: () => void;
  onPrint: () => void;
  onCategoryClick: (categoryId: string) => void;
  className?: string;
}

export const ProgressSidebar = memo(function ProgressSidebar({
  checklist,
  userName,
  onResetProgress: _onResetProgress,
  onShare: _onShare,
  onPrint: _onPrint,
  onCategoryClick: _onCategoryClick,
  className = ''
}: ProgressSidebarProps) {
  // 性能优化：预计算所有统计数据，一次遍历完成
  const progressData = useMemo(() => {
    let totalItems = 0;
    let totalCompleted = 0;
    
    const categories = checklist.map((category) => {
      const completedItems = category.items.filter(item => item.completed).length;
      const categoryTotalItems = category.items.length;
      const progress = categoryTotalItems > 0 ? Math.round((completedItems / categoryTotalItems) * 100) : 0;
      
      totalItems += categoryTotalItems;
      totalCompleted += completedItems;
      
      return {
        id: category.id,
        title: category.title,
        completedItems,
        totalItems: categoryTotalItems,
        progress,
        isComplete: progress === 100
      };
    });

    const overallProgress = totalCompleted; // 1 item = 1%, so completed items directly = progress percentage
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

  // 性能优化：缓存颜色计算函数
  const getProgressColor = useMemo(() => {
    return (progress: number) => {
      if (progress >= 116) return 'text-green-600';
      if (progress >= 93) return 'text-blue-600';  // 80% of 116
      if (progress >= 58) return 'text-yellow-600'; // 50% of 116
      if (progress >= 29) return 'text-orange-600'; // 25% of 116
      return 'text-red-600';
    };
  }, []);

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
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressData.overallProgress / 116)}`}
                  className={`${getProgressColor(progressData.overallProgress)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${getProgressColor(progressData.overallProgress)}`}>
                  {progressData.overallProgress}/116
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
          <ScrollArea className="h-96 px-3 pb-3">
            <div className="grid grid-cols-2 gap-2">
              {progressData.categories.map((category) => (
                <CategoryProgressItem
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
});

ProgressSidebar.displayName = 'ProgressSidebar';