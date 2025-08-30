'use client';

import { useRef, useState, useCallback, useMemo, useEffect } from 'react';

interface GestureState {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  velocity: number;
  lastMoveTime: number;
  lastX: number;
}

interface GestureConfig {
  /** Minimum horizontal distance in pixels to trigger swipe */
  swipeThreshold: number;
  /** Maximum time in ms for a tap gesture */
  tapMaxDuration: number;
  /** Maximum distance in pixels for a tap gesture */
  tapMaxDistance: number;
  /** Minimum velocity for momentum scrolling */
  momentumThreshold: number;
  /** Physics damping factor (0-1, higher = more damping) */
  damping: number;
  /** Magnetic snap strength (0-1, higher = stronger snap) */
  snapStrength: number;
}

const DEFAULT_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  tapMaxDuration: 200,
  tapMaxDistance: 10,
  momentumThreshold: 0.5,
  damping: 0.85,
  snapStrength: 0.3,
};

export interface UseGestureCarouselReturn {
  /** Gesture handlers for the container element */
  gestureHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
  };
  /** Current transform offset for smooth animation */
  transform: number;
  /** Whether a swipe gesture is currently active */
  isGesturing: boolean;
  /** Whether the carousel is animating */
  isAnimating: boolean;
}

interface UseGestureCarouselOptions {
  /** Total number of items in the carousel */
  itemCount: number;
  /** Current active index */
  currentIndex: number;
  /** Callback when navigation should occur */
  onNavigate: (direction: 'next' | 'prev') => void;
  /** Custom gesture configuration */
  config?: Partial<GestureConfig>;
  /** Whether to enable gesture handling (for mobile detection) */
  enabled?: boolean;
}

/**
 * Professional gesture handling hook for mobile video carousels
 * Provides intelligent tap vs swipe detection with physics-based interactions
 */
export function useGestureCarousel({
  itemCount,
  currentIndex,
  onNavigate,
  config: userConfig = {},
  enabled = true,
}: UseGestureCarouselOptions): UseGestureCarouselReturn {
  const config = useMemo(() => ({ ...DEFAULT_CONFIG, ...userConfig }), [userConfig]);
  
  const gestureState = useRef<GestureState>({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    velocity: 0,
    lastMoveTime: 0,
    lastX: 0,
  });

  const animationFrame = useRef<number | undefined>(undefined);
  const [transform, setTransform] = useState(0);
  const [isGesturing, setIsGesturing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const preventNextClick = useRef(false);

  // Physics-based animation with damping
  const animateToPosition = useCallback((targetPosition: number, duration = 300) => {
    setIsAnimating(true);
    const startPosition = transform;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing with physics-like damping
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentPosition = startPosition + (targetPosition - startPosition) * easeProgress;
      
      setTransform(currentPosition);
      
      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setTransform(targetPosition);
      }
    };

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    animationFrame.current = requestAnimationFrame(animate);
  }, [transform]);

  // Gesture analysis for tap vs swipe detection
  const analyzeGesture = useCallback((state: GestureState) => {
    const deltaX = state.currentX - state.startX;
    const deltaY = state.currentY - state.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - state.startTime;
    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

    return {
      deltaX,
      deltaY,
      distance,
      duration,
      isHorizontal,
      isTap: distance < config.tapMaxDistance && duration < config.tapMaxDuration,
      isSwipe: distance > config.swipeThreshold && isHorizontal,
      velocity: state.velocity,
    };
  }, [config]);

  // Handle gesture start (touch/mouse)
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!enabled) return;

    const now = Date.now();
    gestureState.current = {
      isActive: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      startTime: now,
      velocity: 0,
      lastMoveTime: now,
      lastX: clientX,
    };

    setIsGesturing(true);
    preventNextClick.current = false;

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
  }, [enabled]);

  // Handle gesture move with velocity calculation
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!enabled || !gestureState.current.isActive) return;

    const now = Date.now();
    const state = gestureState.current;
    
    // Update position
    state.currentX = clientX;
    state.currentY = clientY;
    
    // Calculate velocity for momentum
    const timeDelta = now - state.lastMoveTime;
    if (timeDelta > 0) {
      const distance = clientX - state.lastX;
      state.velocity = distance / timeDelta;
      state.lastMoveTime = now;
      state.lastX = clientX;
    }

    const analysis = analyzeGesture(state);
    
    // Apply real-time transform during swipe
    if (analysis.isHorizontal && Math.abs(analysis.deltaX) > 20) {
      const damping = config.damping;
      const dampedDelta = analysis.deltaX * damping;
      setTransform(dampedDelta);
      
      // Prevent default to avoid scrolling
      preventNextClick.current = true;
    }
  }, [enabled, analyzeGesture, config.damping]);

  // Handle gesture end with momentum and snap
  const handleEnd = useCallback(() => {
    if (!enabled || !gestureState.current.isActive) return;

    const state = gestureState.current;
    const analysis = analyzeGesture(state);
    
    state.isActive = false;
    setIsGesturing(false);

    // Handle tap - allow video interaction
    if (analysis.isTap) {
      animateToPosition(0, 150);
      return;
    }

    // Handle swipe with momentum
    if (analysis.isSwipe || Math.abs(analysis.velocity) > config.momentumThreshold) {
      const shouldNavigate = 
        Math.abs(analysis.deltaX) > config.swipeThreshold ||
        Math.abs(analysis.velocity) > config.momentumThreshold;

      if (shouldNavigate) {
        const direction = analysis.deltaX < 0 ? 'next' : 'prev';
        
        // Prevent navigation beyond bounds
        if (
          (direction === 'next' && currentIndex < itemCount - 1) ||
          (direction === 'prev' && currentIndex > 0)
        ) {
          onNavigate(direction);
        }
      }
    }

    // Smooth return to neutral position
    animateToPosition(0, 200);
  }, [enabled, analyzeGesture, config.swipeThreshold, config.momentumThreshold, currentIndex, itemCount, onNavigate, animateToPosition]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      handleStart(touch.clientX, touch.clientY);
    }
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      handleMove(touch.clientX, touch.clientY);
      
      // Prevent scrolling during horizontal swipe
      if (gestureState.current.isActive) {
        const analysis = analyzeGesture(gestureState.current);
        if (analysis.isHorizontal && Math.abs(analysis.deltaX) > 15) {
          e.preventDefault();
        }
      }
    }
  }, [handleMove, analyzeGesture]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (gestureState.current.isActive) {
      handleMove(e.clientX, e.clientY);
    }
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseLeave = useCallback(() => {
    if (gestureState.current.isActive) {
      handleEnd();
    }
  }, [handleEnd]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  // Click prevention for better UX
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: Event) => {
      if (preventNextClick.current) {
        e.preventDefault();
        e.stopPropagation();
        preventNextClick.current = false;
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [enabled]);

  return {
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
    transform,
    isGesturing,
    isAnimating,
  };
}