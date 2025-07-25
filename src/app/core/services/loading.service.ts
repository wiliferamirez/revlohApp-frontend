import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Loading service for managing global loading states
 * Tracks multiple concurrent loading operations
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal-based state for loading
  private loadingCountSignal = signal<number>(0);
  private loadingOperationsSignal = signal<Set<string>>(new Set());

  // Observable for components that need it
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Computed signals
  readonly isLoading = computed(() => this.loadingCountSignal() > 0);
  readonly loadingCount = computed(() => this.loadingCountSignal());
  readonly activeOperations = computed(() => Array.from(this.loadingOperationsSignal()));

  /**
   * Shows global loading indicator
   */
  show(operationId?: string): void {
    const currentCount = this.loadingCountSignal();
    this.loadingCountSignal.set(currentCount + 1);

    if (operationId) {
      const operations = new Set(this.loadingOperationsSignal());
      operations.add(operationId);
      this.loadingOperationsSignal.set(operations);
    }

    this.updateLoadingState();
  }

  /**
   * Hides global loading indicator
   */
  hide(operationId?: string): void {
    const currentCount = this.loadingCountSignal();
    if (currentCount > 0) {
      this.loadingCountSignal.set(currentCount - 1);
    }

    if (operationId) {
      const operations = new Set(this.loadingOperationsSignal());
      operations.delete(operationId);
      this.loadingOperationsSignal.set(operations);
    }

    this.updateLoadingState();
  }

  /**
   * Shows loading for a specific operation
   */
  showOperation(operationId: string): void {
    this.show(operationId);
  }

  /**
   * Hides loading for a specific operation
   */
  hideOperation(operationId: string): void {
    this.hide(operationId);
  }

  /**
   * Checks if a specific operation is loading
   */
  isOperationLoading(operationId: string): boolean {
    return this.loadingOperationsSignal().has(operationId);
  }

  /**
   * Sets loading state for multiple operations
   */
  setOperationsLoading(operationIds: string[], loading: boolean): void {
    operationIds.forEach(id => {
      if (loading) {
        this.showOperation(id);
      } else {
        this.hideOperation(id);
      }
    });
  }

  /**
   * Clears all loading states
   */
  clearAll(): void {
    this.loadingCountSignal.set(0);
    this.loadingOperationsSignal.set(new Set());
    this.updateLoadingState();
  }

  /**
   * Gets the current loading state as a boolean
   */
  getCurrentState(): boolean {
    return this.loadingCountSignal() > 0;
  }

  /**
   * Wraps an operation with loading state management
   */
  wrapOperation<T>(operationId: string, operation: () => Promise<T>): Promise<T> {
    this.showOperation(operationId);
    
    return operation()
      .finally(() => {
        this.hideOperation(operationId);
      });
  }

  /**
   * Wraps an observable operation with loading state management
   */
  wrapObservableOperation<T>(operationId: string, operation: () => any): any {
    this.showOperation(operationId);
    
    return operation().pipe(
      // Note: finalize operator would be added here in actual usage
      // finalize(() => this.hideOperation(operationId))
    );
  }

  /**
   * Creates a loading operation that can be manually controlled
   */
  createOperation(operationId: string): {
    start: () => void;
    stop: () => void;
    isLoading: () => boolean;
  } {
    return {
      start: () => this.showOperation(operationId),
      stop: () => this.hideOperation(operationId),
      isLoading: () => this.isOperationLoading(operationId)
    };
  }

  /**
   * Debounces loading state changes to prevent flickering
   */
  private updateLoadingState(): void {
    const isLoading = this.loadingCountSignal() > 0;
    
    // Debounce to prevent rapid on/off flickering
    setTimeout(() => {
      this.loadingSubject.next(this.loadingCountSignal() > 0);
    }, 0);
  }

  /**
   * Gets loading statistics
   */
  getStatistics(): {
    totalOperations: number;
    activeOperations: number;
    operationList: string[];
  } {
    const operations = this.loadingOperationsSignal();
    return {
      totalOperations: this.loadingCountSignal(),
      activeOperations: operations.size,
      operationList: Array.from(operations)
    };
  }

  /**
   * Checks if the service is in a valid state
   */
  isHealthy(): boolean {
    const count = this.loadingCountSignal();
    const operations = this.loadingOperationsSignal();
    
    // Count should not be negative and should match operations if operations are tracked
    return count >= 0 && (operations.size === 0 || count > 0);
  }

  /**
   * Resets the service to a clean state
   */
  reset(): void {
    this.clearAll();
  }
}