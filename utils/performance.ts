// utils/performance.ts
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string): void {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (start !== undefined && end !== undefined) {
      const duration = end - start;
      console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
    }
  }
}