export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle?: string;
  releaseNotes?: string;
  downloadUrl: string;
  publishedAt?: string;
  isError?: boolean;
  errorMessage?: string;
}

export const CURRENT_APP_VERSION = '1.01';
const GITHUB_REPO_API = 'https://api.github.com/repos/AlbertWaikhom/agendaX/releases/latest';
const DEFAULT_DOWNLOAD_URL = 'https://github.com/AlbertWaikhom/agendaX/raw/main/agendaX-v1.01.apk';

/**
 * Compare two semver/version strings (e.g., "1.01" vs "1.02" or "v1.02")
 */
function isVersionNewer(current: string, remote: string): boolean {
  try {
    const cleanCurrent = current.replace(/^v/i, '').trim();
    const cleanRemote = remote.replace(/^v/i, '').trim();

    const currParts = cleanCurrent.split('.').map(n => parseInt(n, 10) || 0);
    const remParts = cleanRemote.split('.').map(n => parseInt(n, 10) || 0);

    const maxLen = Math.max(currParts.length, remParts.length);
    for (let i = 0; i < maxLen; i++) {
      const c = currParts[i] || 0;
      const r = remParts[i] || 0;
      if (r > c) return true;
      if (r < c) return false;
    }
    return false;
  } catch {
    return false;
  }
}

export const UpdateService = {

  async checkForUpdates(): Promise<UpdateCheckResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(GITHUB_REPO_API, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AgendaX-App',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}`);
      }

      const data = await response.json();
      const tagName: string = data.tag_name || data.name || '';
      const cleanRemoteVer = tagName.replace(/^v/i, '').trim() || CURRENT_APP_VERSION;

      const hasUpdate = isVersionNewer(CURRENT_APP_VERSION, cleanRemoteVer);

      let apkDownloadUrl = DEFAULT_DOWNLOAD_URL;
      if (data.assets && Array.isArray(data.assets)) {
        const apkAsset = data.assets.find((a: any) =>
          a.name && a.name.toLowerCase().endsWith('.apk')
        );
        if (apkAsset && apkAsset.browser_download_url) {
          apkDownloadUrl = apkAsset.browser_download_url;
        }
      }

      if (!apkDownloadUrl || apkDownloadUrl === DEFAULT_DOWNLOAD_URL) {
        apkDownloadUrl = `https://github.com/AlbertWaikhom/agendaX/raw/main/agendaX-v${cleanRemoteVer}.apk`;
      }

      return {
        hasUpdate,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: cleanRemoteVer,
        releaseTitle: data.name || `AgendaX v${cleanRemoteVer}`,
        releaseNotes: data.body || 'New features, performance enhancements, and bug fixes.',
        downloadUrl: apkDownloadUrl,
        publishedAt: data.published_at,
        isError: false,
      };
    } catch (error: any) {
      console.log('[UpdateService] Update check bypassed (Offline or network error):', error?.message);
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION,
        latestVersion: CURRENT_APP_VERSION,
        downloadUrl: DEFAULT_DOWNLOAD_URL,
        isError: true,
        errorMessage: error?.message || 'Offline - could not check GitHub releases',
      };
    }
  },
};
