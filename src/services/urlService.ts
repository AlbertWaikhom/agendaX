import { UrlItem, UrlCategory } from '../types';
import { generateUniqueId, isValidUrl, normalizeUrl } from '../utils';

export const UrlService = {
  createUrl(params: {
    title: string;
    url: string;
    category?: UrlCategory;
    note?: string;
  }): { success: boolean; item?: UrlItem; error?: string } {
    if (!params.title || !params.title.trim()) {
      return { success: false, error: 'Title is required' };
    }

    if (!params.url || !isValidUrl(params.url)) {
      return { success: false, error: 'Please enter a valid URL (e.g. github.com or https://example.com)' };
    }

    const now = new Date().toISOString();
    const item: UrlItem = {
      id: generateUniqueId('url'),
      title: params.title.trim(),
      url: normalizeUrl(params.url),
      category: params.category || 'Work',
      note: params.note?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, item };
  },

  updateUrl(
    existing: UrlItem,
    params: {
      title: string;
      url: string;
      category?: UrlCategory;
      note?: string;
    }
  ): { success: boolean; item?: UrlItem; error?: string } {
    if (!params.title || !params.title.trim()) {
      return { success: false, error: 'Title is required' };
    }

    if (!params.url || !isValidUrl(params.url)) {
      return { success: false, error: 'Please enter a valid URL' };
    }

    const item: UrlItem = {
      ...existing,
      title: params.title.trim(),
      url: normalizeUrl(params.url),
      category: params.category || existing.category,
      note: params.note !== undefined ? params.note.trim() : existing.note,
      updatedAt: new Date().toISOString(),
    };

    return { success: true, item };
  },

  filterUrls(urls: UrlItem[], category: string = 'All', searchQuery: string = ''): UrlItem[] {
    let filtered = [...urls];

    if (category && category !== 'All') {
      filtered = filtered.filter(u => u.category.toLowerCase() === category.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        u =>
          u.title.toLowerCase().includes(q) ||
          u.url.toLowerCase().includes(q) ||
          (u.note && u.note.toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};
