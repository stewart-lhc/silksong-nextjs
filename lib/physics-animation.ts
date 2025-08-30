/**
 * High-performance physics-based animation utilities
 * Optimized for smooth 60fps mobile interactions
 */

export interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
}

export interface AnimationState {
  position: number;
  velocity: number;
  target: number;
}

// Predefined spring configurations for different use cases
export const SPRING_PRESETS = {
  gentle: { tension: 120, friction: 14, mass: 1 },
  responsive: { tension: 180, friction: 12, mass: 1 },
  bouncy: { tension: 200, friction: 8, mass: 1 },
  stiff: { tension: 300, friction: 15, mass: 1 },
} as const;

/**
 * Calculate spring physics for smooth animations
 */
export function calculateSpring(
  state: AnimationState,
  config: SpringConfig,
  deltaTime: number
): AnimationState {
  const { position, velocity, target } = state;
  const { tension, friction, mass } = config;

  // Spring force calculation
  const springForce = -tension * (position - target);
  const dampingForce = -friction * velocity;
  const force = springForce + dampingForce;
  
  // Integration using velocity Verlet method for stability
  const acceleration = force / mass;
  const newVelocity = velocity + acceleration * deltaTime;
  const newPosition = position + newVelocity * deltaTime;

  return {
    position: newPosition,
    velocity: newVelocity,
    target,
  };
}

/**
 * Check if spring animation has settled
 */
export function isSpringSettled(
  state: AnimationState,
  threshold = 0.5,
  velocityThreshold = 0.5
): boolean {
  const positionDiff = Math.abs(state.position - state.target);
  const velocityMagnitude = Math.abs(state.velocity);
  
  return positionDiff < threshold && velocityMagnitude < velocityThreshold;
}

/**
 * Smooth easing functions for CSS transitions
 */
export const EASING_FUNCTIONS = {
  // Material Design inspired easing
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  
  // Natural motion
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  
  // Performance optimized
  linear: 'linear',
  ease: 'ease',
} as const;

/**
 * Hardware acceleration utilities
 */
export function getOptimizedTransform(x: number, y = 0): string {
  return `translate3d(${x}px, ${y}px, 0)`;
}

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;

  public measureFrame(): number {
    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
    
    return this.fps;
  }

  public getFPS(): number {
    return this.fps;
  }

  public isPerformanceGood(): boolean {
    return this.fps >= 55; // Allow some tolerance for 60fps
  }
}

/**
 * Optimized animation scheduler using requestAnimationFrame
 */
export class AnimationScheduler {
  private callbacks = new Set<(deltaTime: number) => boolean>();
  private isRunning = false;
  private lastTime = 0;
  private rafId: number | null = null;

  private tick = (currentTime: number) => {
    const deltaTime = this.lastTime ? currentTime - this.lastTime : 16.67; // Default to ~60fps
    this.lastTime = currentTime;

    // Execute all callbacks
    for (const callback of this.callbacks) {
      const shouldContinue = callback(deltaTime);
      if (!shouldContinue) {
        this.callbacks.delete(callback);
      }
    }

    // Continue animation if there are active callbacks
    if (this.callbacks.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.isRunning = false;
      this.lastTime = 0;
    }
  };

  public add(callback: (deltaTime: number) => boolean): () => void {
    this.callbacks.add(callback);
    
    if (!this.isRunning) {
      this.isRunning = true;
      this.rafId = requestAnimationFrame(this.tick);
    }

    // Return cleanup function
    return () => this.callbacks.delete(callback);
  }

  public clear(): void {
    this.callbacks.clear();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
    this.lastTime = 0;
  }
}

// Global scheduler instance for optimal performance
export const globalAnimationScheduler = new AnimationScheduler();

/**
 * Utility for smooth value interpolation with momentum
 */
export function createMomentumValue(initialValue = 0, friction = 0.85) {
  let currentValue = initialValue;
  let velocity = 0;
  let target = initialValue;

  return {
    set(newTarget: number, immediate = false) {
      target = newTarget;
      if (immediate) {
        currentValue = newTarget;
        velocity = 0;
      }
    },

    update(deltaTime: number): number {
      const deltaMs = deltaTime / 1000; // Convert to seconds
      const force = (target - currentValue) * 10; // Spring-like force
      velocity = velocity * friction + force * deltaMs;
      currentValue += velocity * deltaMs;
      
      return currentValue;
    },

    get value(): number {
      return currentValue;
    },

    get settled(): boolean {
      return Math.abs(target - currentValue) < 0.1 && Math.abs(velocity) < 0.1;
    },
  };
}

/**
 * Debounced animation trigger for performance
 */
export function createDebouncedAnimation(
  callback: () => void,
  delay = 16
): () => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback();
      timeoutId = null;
    }, delay);
  };
}