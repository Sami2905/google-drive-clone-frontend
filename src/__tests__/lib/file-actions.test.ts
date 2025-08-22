import { getFileUrl, getSignedUrl, previewFile, downloadFile } from '../../lib/file-actions';

// Auth store mock helper
function createMockUseAuthStore() {
  const state = {
    token: 'mock-token',
    user: { id: 'u1', email: 'test@example.com' },
    isTokenValid: jest.fn(() => true),
    refreshToken: jest.fn(() => Promise.resolve(true)),
    logout: jest.fn(),
  };
  const fn: jest.MockedFunction<() => typeof state> = jest.fn(() => state);
  fn.getState = jest.fn(() => state);
  return fn;
}

jest.mock('../../store/authStore', () => {
  const mockUseAuthStore = createMockUseAuthStore();
  return {
    __esModule: true,
    useAuthStore: mockUseAuthStore,
  };
});



// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn()
  }
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window methods
Object.defineProperty(window, 'open', {
  writable: true,
  value: jest.fn()
});

describe('file-actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api';
  });

  describe('getFileUrl', () => {
    test('generates correct URL for inline disposition', () => {
      const url = getFileUrl('test-file-id', 'inline');
      expect(url).toBe('http://localhost:5000/api/files/test-file-id/serve?inline=true');
    });

    test('generates correct URL for attachment disposition', () => {
      const url = getFileUrl('test-file-id', 'attachment');
      expect(url).toBe('http://localhost:5000/api/files/test-file-id/download');
    });

    test('throws error when no token available', () => {
      const mockUseAuthStore = createMockUseAuthStore();
      mockUseAuthStore.getState.mockReturnValue({
        token: null,
        user: null,
        isTokenValid: jest.fn(() => false),
        refreshToken: jest.fn(() => Promise.resolve(false)),
        logout: jest.fn()
      });

      expect(() => getFileUrl('test-file-id')).toThrow('No authentication token found');
    });

    test('uses default API URL when env var not set', () => {
      delete process.env.NEXT_PUBLIC_API_URL;
      const url = getFileUrl('test-file-id', 'inline');
      expect(url).toBe('http://localhost:5000/api/files/test-file-id/serve?inline=true');
    });
  });

  describe('getSignedUrl', () => {
    beforeEach(() => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://signed-url.example.com' }
        }),
        text: () => Promise.resolve('Success')
      } as Response);
    });

    test('fetches signed URL successfully', async () => {
      const url = await getSignedUrl('test-file-id', 'inline');
      
      expect(url).toBe('https://signed-url.example.com');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/files/test-file-id/signed?disposition=inline',
        {
          headers: {
            Authorization: 'Bearer mock-token',
            'Content-Type': 'application/json'
          }
        }
      );
    });

    test('refreshes token when expired', async () => {
      const mockRefreshToken = jest.fn(() => Promise.resolve(true));
      const mockUseAuthStore = createMockUseAuthStore();
      mockUseAuthStore.getState.mockReturnValue({
        token: 'mock-token',
        user: { id: 'user-1', email: 'test@example.com' },
        isTokenValid: jest.fn(() => false), // Token is expired
        refreshToken: mockRefreshToken,
        logout: jest.fn()
      });

      await getSignedUrl('test-file-id', 'inline');

      expect(mockRefreshToken).toHaveBeenCalled();
    });

    test('handles 401 error with token refresh', async () => {
      const mockRefreshToken = jest.fn(() => Promise.resolve(true));
      const mockLogout = jest.fn();
      
      const mockUseAuthStore = createMockUseAuthStore();
      mockUseAuthStore.getState.mockReturnValue({
        token: 'mock-token',
        user: { id: 'user-1', email: 'test@example.com' },
        isTokenValid: jest.fn(() => true),
        refreshToken: mockRefreshToken,
        logout: mockLogout
      });

      // First call returns 401, second call succeeds
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          text: () => Promise.resolve('Unauthorized')
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            success: true,
            data: { url: 'https://signed-url.example.com' }
          })
        } as Response);

      const url = await getSignedUrl('test-file-id', 'inline');

      expect(mockRefreshToken).toHaveBeenCalled();
      expect(url).toBe('https://signed-url.example.com');
    });

    test('logs out user when token refresh fails', async () => {
      const mockLogout = jest.fn();
      const mockUseAuthStore = createMockUseAuthStore();
      mockUseAuthStore.getState.mockReturnValue({
        token: 'mock-token',
        user: { id: 'user-1', email: 'test@example.com' },
        isTokenValid: jest.fn(() => false),
        refreshToken: jest.fn(() => Promise.resolve(false)), // Refresh fails
        logout: mockLogout
      });

      await expect(getSignedUrl('test-file-id', 'inline')).rejects.toThrow();
      expect(mockLogout).toHaveBeenCalled();
    });

    test('handles network errors', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      await expect(getSignedUrl('test-file-id', 'inline')).rejects.toThrow('Network error');
    });

    test('handles non-200 responses', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      } as Response);

      await expect(getSignedUrl('test-file-id', 'inline')).rejects.toThrow();
    });
  });

  describe('previewFile', () => {
    test('opens file in new window on success', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://signed-url.example.com' }
        })
      } as Response);

      await previewFile('test-file-id');

      expect(window.open).toHaveBeenCalledWith(
        'https://signed-url.example.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    test('falls back to direct download URL on error', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      await previewFile('test-file-id');

      expect(window.open).toHaveBeenCalledWith(
        'http://localhost:5000/api/files/test-file-id/download',
        '_blank',
        'noopener,noreferrer'
      );
    });
  });

  describe('downloadFile', () => {
    let mockAnchor: HTMLAnchorElement;

    beforeEach(() => {
      mockAnchor = {
        href: '',
        download: '',
        rel: '',
        click: jest.fn(),
        remove: jest.fn()
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      jest.spyOn(document.body, 'appendChild').mockImplementation();
      jest.spyOn(document.body, 'removeChild').mockImplementation();
    });

    test('downloads file using signed URL', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://signed-url.example.com' }
        })
      } as Response);

      await downloadFile('test-file-id', 'test.pdf');

      expect(mockAnchor.href).toBe('https://signed-url.example.com');
      expect(mockAnchor.download).toBe('test.pdf');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.remove).toHaveBeenCalled();
    });

    test('falls back to direct download on error', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      await downloadFile('test-file-id', 'test.pdf');

      expect(mockAnchor.href).toBe('http://localhost:5000/api/files/test-file-id/download');
      expect(mockAnchor.download).toBe('test.pdf');
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    test('handles missing filename', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: { url: 'https://signed-url.example.com' }
        })
      } as Response);

      await downloadFile('test-file-id');

      expect(mockAnchor.download).toBe('');
    });
  });

  describe('Error boundaries', () => {
    test('handles malformed response data', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ invalid: 'response' }) // Missing data.url
      } as Response);

      const url = await getSignedUrl('test-file-id', 'inline');
      expect(url).toBeUndefined(); // Should handle gracefully
    });

    test('handles empty response', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({})
      } as Response);

      const url = await getSignedUrl('test-file-id', 'inline');
      expect(url).toBeUndefined();
    });
  });
});
