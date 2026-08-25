
export function generateWorkspaceId(): string {
  const chars = '0123456789ABCDEF';
  let result = 'AGX-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateUniqueId(prefix: string = 'item'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${randomStr}`;
}

export const generateId = generateUniqueId;

/**
 * Validate URL string
 */
export function isValidUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;
  return pattern.test(trimmed);
}

/**
 * Format URL with https:// if missing
 */
export function normalizeUrl(urlStr: string): string {
  let trimmed = urlStr.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

/**
 * Extract clean domain name for display
 */
export function getDomain(urlStr: string): string {
  try {
    const normalized = normalizeUrl(urlStr);
    const matches = normalized.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
    return matches && matches[1] ? matches[1].replace(/^www\./i, '') : urlStr;
  } catch {
    return urlStr;
  }
}

/**
 * Date Formatting Helpers
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  } catch {
    return dateStr;
  }
}

export function formatTimePretty(timeStr?: string): string {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}

export function getTimeGreeting(name: string): string {
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) {
    greeting = 'Good Morning';
  } else if (hour < 17) {
    greeting = 'Good Afternoon';
  }
  return `${greeting}, ${name || 'Friend'} 👋`;
}
