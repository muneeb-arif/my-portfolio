class ToastService {
  constructor() {
    this.listeners = [];
    this.toasts = [];
    this.nextId = 1;
  }

  // Subscribe to toast updates
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notify() {
    this.listeners.forEach(callback => callback(this.toasts));
  }

  // Add a new toast
  show(message, type = 'info', duration = 5000) {
    const id = this.nextId++;
    const toast = {
      id,
      message,
      type,
      duration
    };

    this.toasts.push(toast);
    this.notify();

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);

    return id;
  }

  // Remove a toast by id
  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  // Convenience methods
  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }

  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }

  // Clear all toasts
  clear() {
    this.toasts = [];
    this.notify();
  }
}

// Create a singleton instance
const toastService = new ToastService();

export default toastService; 