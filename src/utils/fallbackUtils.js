import { API_BASE } from './apiConfig';

export const fallbackUtils = {
  // Demo-mode banner disabled intentionally (was `return` + dead code; see git history to restore UI)
  showFallbackNotification() {},

  resetFallbackNotification() {},

  // Check if API is available
  async checkApiConnection() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  }
};

export default fallbackUtils;
