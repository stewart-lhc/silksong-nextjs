'use client';

import { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Grid, List, User, FileText, Share2, Printer, RotateCcw
} from 'lucide-react';

import { ChecklistProvider, useChecklist } from '@/components/checklist-provider';
import { CategorySidebar } from '@/components/category-sidebar';
import { ProgressSidebar } from '@/components/progress-sidebar';
import { ItemCard } from '@/components/item-card';
import { PrintStyles } from '@/components/print-styles';


function ChecklistPageContent() {
  const {
    checklist,
    userName,
    filters,
    filteredItems,
    viewMode,
    activeCategory,
    toggleItem,
    setUserName,
    setFilters,
    setViewMode,
    setActiveCategory,
    resetProgress,
    overallProgress,
    uniqueLocations,
    uniqueTypes,
    uniqueSources
  } = useChecklist();

  const mainContentRef = useRef<HTMLDivElement>(null);
  

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleShare = useCallback(async () => {
    const shareText = `${userName ? `${userName}'s ` : ''}Hollow Knight: Silksong Progress: ${overallProgress}% complete! 🦋\n\nTrack your journey through Pharloom with this comprehensive checklist.`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hollow Knight: Silksong Checklist',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.warn('Error sharing:', error);
        fallbackShare(shareText, shareUrl);
      }
    } else {
      fallbackShare(shareText, shareUrl);
    }
  }, [userName, overallProgress]);

  const fallbackShare = (text: string, url: string) => {
    const fullText = `${text}\n\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    });
  };

  const scrollToTop = useCallback(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId === activeCategory ? null : categoryId);
    scrollToTop();
  }, [activeCategory, setActiveCategory, scrollToTop]);

  return (
    <div className="bg-background relative overflow-x-hidden">

      {/* Three-Panel Layout */}
      <div className="relative min-h-screen">
        {/* Left Panel - Categories & Search */}
        <div className="xl:block hidden fixed left-0 top-20 w-[320px] h-screen z-40 bg-background/95 backdrop-blur-sm border-r border-border shadow-sm transform-gpu">
          <CategorySidebar
            checklist={checklist}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            onScrollToTop={scrollToTop}
            filters={filters}
            onFiltersChange={setFilters}
            uniqueLocations={uniqueLocations}
            uniqueTypes={uniqueTypes}
            uniqueSources={uniqueSources}
            filteredItemsCount={filteredItems.length}
            className="h-full"
          />
        </div>
        
        {/* Main Content Panel */}
        <div className="xl:ml-[320px] xl:mr-[320px] min-h-screen transform-gpu">
          <div className="px-4 py-6">
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-bold fantasy-text text-foreground">
                      Hollow Knight: Silksong Checklist
                    </h1>
                  </div>
                </div>
                
                <div className="hidden xl:flex items-center gap-3">
                  {/* User Name Input */}
                  <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-2 border max-w-48">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      type="text"
                      placeholder="Your name..."
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-transparent border-none text-sm text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none h-auto py-1"
                    />
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex items-center bg-muted rounded-lg p-1">
                    <Button
                      variant={viewMode === 'compact' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('compact')}
                      className="h-8 px-3 transition-all duration-200"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('detailed')}
                      className="h-8 px-3 transition-all duration-200"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          
            {/* Items Display */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-hornet-accent" />
                    {activeCategory 
                      ? `${checklist.find(c => c.id === activeCategory)?.title || 'Category'}`
                      : 'All'
                    }
                    <Badge variant="outline">
                      {filteredItems.length}
                    </Badge>
                  </CardTitle>
                  
                  {/* Mobile: Compact view toggle */}
                  <div className="xl:hidden flex items-center gap-2">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                      <Button
                        variant={viewMode === 'compact' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('compact')}
                        className="h-8 px-3 transition-all duration-200"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('detailed')}
                        className="h-8 px-3 transition-all duration-200"
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pt-0 overflow-hidden">
                <div className="h-full" ref={mainContentRef}>
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No items found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Try adjusting your search terms or filters
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setFilters({ searchTerm: '', category: '', location: '', type: '', mandatory: '', completed: '', source: '' })}
                      >
                        Clear all filters
                      </Button>
                    </div>
                  ) : (
                    <div className="h-full pr-4">
                      {viewMode === 'detailed' ? (
                        <div className="h-full overflow-auto checklist-scroll-area">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-3">
                            {filteredItems.map((item) => (
                              <div key={`${item.categoryId}-${item.id}`} className="h-fit">
                                <ItemCard
                                  item={item}
                                  categoryId={item.categoryId}
                                  onToggle={toggleItem}
                                  viewMode={viewMode}
                                  searchTerm={filters.searchTerm}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full overflow-auto space-y-3 checklist-scroll-area">
                          {filteredItems.map((item) => (
                            <div key={`${item.categoryId}-${item.id}`}>
                              <ItemCard
                                item={item}
                                categoryId={item.categoryId}
                                onToggle={toggleItem}
                                viewMode={viewMode}
                                searchTerm={filters.searchTerm}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Right Panel - Progress & Actions */}
        <div className="xl:block hidden fixed right-0 top-20 w-[320px] h-screen z-40 bg-background/95 backdrop-blur-sm border-l border-border shadow-sm transform-gpu">
          <div className="h-full overflow-hidden">
            <ProgressSidebar
              checklist={checklist}
              userName={userName}
              onResetProgress={resetProgress}
              onShare={handleShare}
              onPrint={handlePrint}
              onCategoryClick={handleCategoryClick}
              className="h-full p-4"
            />
          </div>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-3">
        <Button
          onClick={handleShare}
          size="sm"
          className="w-12 h-12 rounded-full p-0 shadow-md bg-blue-600/40 hover:bg-blue-600/70 backdrop-blur-md text-white border-0 transition-all duration-200"
          title="Share Progress"
        >
          <Share2 className="w-5 h-5 opacity-90" />
        </Button>
        
        <Button
          onClick={handlePrint}
          size="sm"
          className="w-12 h-12 rounded-full p-0 shadow-md bg-purple-600/40 hover:bg-purple-600/70 backdrop-blur-md text-white border-0 transition-all duration-200"
          title="Print Checklist"
        >
          <Printer className="w-5 h-5 opacity-90" />
        </Button>
        
        <Button
          onClick={resetProgress}
          size="sm"
          className="w-12 h-12 rounded-full p-0 shadow-md bg-red-600/40 hover:bg-red-600/70 backdrop-blur-md text-white border-0 transition-all duration-200"
          title="Reset Progress"
        >
          <RotateCcw className="w-5 h-5 opacity-90" />
        </Button>
      </div>

      {/* Mobile: Bottom panels */}
      <div className="xl:hidden bg-background">
        <div className="container mx-auto px-4 pb-6 space-y-6">
          {/* Mobile Category Navigation */}
          <CategorySidebar
            checklist={checklist}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            onScrollToTop={scrollToTop}
            filters={filters}
            onFiltersChange={setFilters}
            uniqueLocations={uniqueLocations}
            uniqueTypes={uniqueTypes}
            uniqueSources={uniqueSources}
            filteredItemsCount={filteredItems.length}
            className="w-full"
          />
          
          {/* Mobile Progress Panel */}
          <ProgressSidebar
            checklist={checklist}
            userName={userName}
            onResetProgress={resetProgress}
            onShare={handleShare}
            onPrint={handlePrint}
            onCategoryClick={handleCategoryClick}
            className="w-full"
          />
        </div>
      </div>

      {/* Print Styles */}
      <PrintStyles />
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <ChecklistProvider>
      <ChecklistPageContent />
    </ChecklistProvider>
  );
}