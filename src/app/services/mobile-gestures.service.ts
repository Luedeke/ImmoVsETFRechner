import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  element: HTMLElement;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distance: number;
  duration: number;
}

export interface PinchEvent {
  scale: number;
  element: HTMLElement;
  centerX: number;
  centerY: number;
}

@Injectable({
  providedIn: 'root'
})
export class MobileGesturesService {
  private swipeSubject = new Subject<SwipeEvent>();
  private pinchSubject = new Subject<PinchEvent>();
  
  readonly swipe$ = this.swipeSubject.asObservable();
  readonly pinch$ = this.pinchSubject.asObservable();
  
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private initialDistance = 0;
  private currentScale = 1;

  addSwipeListener(element: HTMLElement): () => void {
    const touchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
      }
    };

    const touchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        
        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = touchEndTime - this.touchStartTime;
        
        // Minimum distance and maximum duration for swipe
        if (distance > 50 && duration < 500) {
          let direction: 'left' | 'right' | 'up' | 'down';
          
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
          } else {
            direction = deltaY > 0 ? 'down' : 'up';
          }
          
          this.swipeSubject.next({
            direction,
            element,
            startX: this.touchStartX,
            startY: this.touchStartY,
            endX: touchEndX,
            endY: touchEndY,
            distance,
            duration
          });
        }
      }
    };

    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchend', touchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchend', touchEnd);
    };
  }

  addPinchListener(element: HTMLElement): () => void {
    const touchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        this.initialDistance = this.getDistance(touch1, touch2);
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = this.getDistance(touch1, touch2);
        
        if (this.initialDistance > 0) {
          const scale = currentDistance / this.initialDistance;
          this.currentScale = Math.max(0.5, Math.min(3, scale)); // Limit scale between 0.5x and 3x
          
          const centerX = (touch1.clientX + touch2.clientX) / 2;
          const centerY = (touch1.clientY + touch2.clientY) / 2;
          
          this.pinchSubject.next({
            scale: this.currentScale,
            element,
            centerX,
            centerY
          });
        }
      }
    };

    const touchEnd = () => {
      this.initialDistance = 0;
      this.currentScale = 1;
    };

    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchmove', touchMove, { passive: false });
    element.addEventListener('touchend', touchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', touchEnd);
    };
  }

  addPullToRefreshListener(element: HTMLElement, callback: () => void): () => void {
    let startY = 0;
    let isPulling = false;
    let pullDistance = 0;
    const maxPullDistance = 100;
    const refreshThreshold = 60;

    const touchStart = (e: TouchEvent) => {
      if (element.scrollTop === 0 && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const touchMove = (e: TouchEvent) => {
      if (isPulling && e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        pullDistance = Math.min(maxPullDistance, Math.max(0, currentY - startY));
        
        if (pullDistance > 0) {
          e.preventDefault();
          // Visual feedback could be added here
          element.style.transform = `translateY(${pullDistance * 0.5}px)`;
          element.style.transition = 'none';
        }
      }
    };

    const touchEnd = () => {
      if (isPulling) {
        element.style.transform = '';
        element.style.transition = 'transform 0.3s ease';
        
        if (pullDistance >= refreshThreshold) {
          callback();
        }
        
        isPulling = false;
        pullDistance = 0;
        
        setTimeout(() => {
          element.style.transition = '';
        }, 300);
      }
    };

    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchmove', touchMove, { passive: false });
    element.addEventListener('touchend', touchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchmove', touchMove);
      element.removeEventListener('touchend', touchEnd);
    };
  }

  addLongPressListener(element: HTMLElement, callback: (event: TouchEvent) => void, duration = 500): () => void {
    let touchTimeout: number;

    const touchStart = (e: TouchEvent) => {
      touchTimeout = window.setTimeout(() => {
        callback(e);
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, duration);
    };

    const touchEnd = () => {
      clearTimeout(touchTimeout);
    };

    const touchMove = () => {
      clearTimeout(touchTimeout);
    };

    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchend', touchEnd, { passive: true });
    element.addEventListener('touchmove', touchMove, { passive: true });

    return () => {
      clearTimeout(touchTimeout);
      element.removeEventListener('touchstart', touchStart);
      element.removeEventListener('touchend', touchEnd);
      element.removeEventListener('touchmove', touchMove);
    };
  }

  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Utility method to detect mobile device
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }

  // Utility method to detect device orientation
  getOrientation(): 'portrait' | 'landscape' {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  // Utility method to add orientation change listener
  addOrientationChangeListener(callback: (orientation: 'portrait' | 'landscape') => void): () => void {
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        callback(this.getOrientation());
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }
}