import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private performanceObserver?: PerformanceObserver;
  private intersectionObserver?: IntersectionObserver;
  private isLowEndDevice = false;

  constructor() {
    this.detectDeviceCapabilities();
    this.setupPerformanceMonitoring();
  }

  /**
   * Detects if the device has limited capabilities
   */
  private detectDeviceCapabilities(): void {
    // Check for low-end device indicators
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const memory = (performance as any).memory;
    
    this.isLowEndDevice = 
      // Slow connection
      (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) ||
      // Limited memory (less than 1GB)
      (memory && memory.jsHeapSizeLimit < 1073741824) ||
      // Old mobile browsers
      /Android [1-4]|iPhone OS [1-9]_|iPad.*OS [1-9]_/i.test(navigator.userAgent) ||
      // Low hardware concurrency
      navigator.hardwareConcurrency <= 2;
  }

  /**
   * Returns optimized configuration based on device capabilities
   */
  getOptimizedConfig() {
    return {
      isLowEndDevice: this.isLowEndDevice,
      animationDuration: this.isLowEndDevice ? 150 : 300,
      chartAnimationDuration: this.isLowEndDevice ? 500 : 1000,
      debounceDelay: this.isLowEndDevice ? 500 : 300,
      enableAnimations: !this.isLowEndDevice,
      reducedMotion: this.prefersReducedMotion(),
      maxChartDataPoints: this.isLowEndDevice ? 50 : 100,
      enableShadows: !this.isLowEndDevice,
      imageQuality: this.isLowEndDevice ? 'low' : 'high'
    };
  }

  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Debounce function for performance optimization
   */
  debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function for performance optimization
   */
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Lazy loading with Intersection Observer
   */
  observeElement(element: HTMLElement, callback: () => void, threshold = 0.1): () => void {
    if (!this.intersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const callbackFn = (entry.target as any)._lazyCallback;
              if (callbackFn) {
                callbackFn();
                this.intersectionObserver?.unobserve(entry.target);
              }
            }
          });
        },
        { threshold }
      );
    }

    (element as any)._lazyCallback = callback;
    this.intersectionObserver.observe(element);

    return () => {
      this.intersectionObserver?.unobserve(element);
      delete (element as any)._lazyCallback;
    };
  }

  /**
   * Memory-efficient data processing for large datasets
   */
  processDataInChunks<T, R>(
    data: T[], 
    processor: (chunk: T[]) => R[], 
    chunkSize = 100
  ): Promise<R[]> {
    return new Promise((resolve) => {
      const results: R[] = [];
      let index = 0;

      const processChunk = () => {
        const chunk = data.slice(index, index + chunkSize);
        if (chunk.length === 0) {
          resolve(results);
          return;
        }

        results.push(...processor(chunk));
        index += chunkSize;

        // Use requestIdleCallback if available, otherwise setTimeout
        if ('requestIdleCallback' in window) {
          (window as any).requestIdleCallback(processChunk);
        } else {
          setTimeout(processChunk, 0);
        }
      };

      processChunk();
    });
  }

  /**
   * Optimize images for mobile devices
   */
  getOptimizedImageUrl(baseUrl: string, width: number, quality = 80): string {
    const config = this.getOptimizedConfig();
    const optimizedQuality = config.imageQuality === 'low' ? Math.min(quality, 60) : quality;
    const optimizedWidth = config.isLowEndDevice ? Math.min(width, 800) : width;
    
    // This would typically integrate with an image optimization service
    return `${baseUrl}?w=${optimizedWidth}&q=${optimizedQuality}`;
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            // Log performance metrics for debugging
            if (entry.entryType === 'largest-contentful-paint') {
              console.log('LCP:', entry.startTime);
            } else if (entry.entryType === 'first-input') {
              console.log('FID:', (entry as any).processingStart - entry.startTime);
            } else if (entry.entryType === 'layout-shift') {
              console.log('CLS:', (entry as any).value);
            }
          });
        });

        // Observe Core Web Vitals
        this.performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        console.warn('PerformanceObserver not fully supported');
      }
    }
  }

  /**
   * Measure and log performance of a function
   */
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }

  /**
   * Get memory usage information
   */
  getMemoryInfo(): any {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  /**
   * Optimize CSS animations based on device capabilities
   */
  getAnimationCSS(): string {
    const config = this.getOptimizedConfig();
    
    if (config.reducedMotion) {
      return `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
    }
    
    if (config.isLowEndDevice) {
      return `
        * {
          animation-duration: ${config.animationDuration}ms !important;
          transition-duration: ${config.animationDuration}ms !important;
        }
        .shadow, .box-shadow {
          box-shadow: none !important;
        }
      `;
    }
    
    return '';
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources(): void {
    const criticalResources = [
      '/assets/icons/icon-192x192.png',
      '/manifest.json'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.png') ? 'image' : 'fetch';
      document.head.appendChild(link);
    });
  }

  /**
   * Clean up resources on component destroy
   */
  cleanup(): void {
    this.performanceObserver?.disconnect();
    this.intersectionObserver?.disconnect();
  }
}