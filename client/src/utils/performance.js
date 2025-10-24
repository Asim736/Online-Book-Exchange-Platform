// Performance monitoring utilities using Web Vitals API

export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;

  // LCP - Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        
        console.log('📊 LCP (Largest Contentful Paint):', Math.round(lcp), 'ms');
        
        if (lcp > 2500) {
          console.warn('⚠️ LCP needs improvement (target: < 2500ms)');
        } else {
          console.log('✅ LCP is good');
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.log('LCP measurement not supported');
    }

    // INP - Interaction to Next Paint (replaces FID)
    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const inp = entry.processingStart - entry.startTime;
          console.log('📊 INP (Interaction to Next Paint):', Math.round(inp), 'ms');
          
          if (inp > 200) {
            console.warn('⚠️ INP needs improvement (target: < 200ms)');
          } else {
            console.log('✅ INP is good');
          }
        }
      });
      inpObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.log('INP measurement not supported');
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log('📊 CLS (Cumulative Layout Shift):', clsValue.toFixed(3));
        
        if (clsValue > 0.1) {
          console.warn('⚠️ CLS needs improvement (target: < 0.1)');
        } else {
          console.log('✅ CLS is good');
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.log('CLS measurement not supported');
    }

    // FCP - First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('📊 FCP (First Contentful Paint):', Math.round(entry.startTime), 'ms');
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.log('FCP measurement not supported');
    }
  }

  // Navigation Timing
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        console.log('📊 Page Load Time:', Math.round(loadTime), 'ms');
        console.log('📊 DOM Ready:', Math.round(domReady), 'ms');
      }, 0);
    });
  }
};

// Track component mount time
export const trackComponentMount = (componentName) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const mountTime = endTime - startTime;
    console.log(`📊 ${componentName} mount time:`, Math.round(mountTime), 'ms');
  };
};
