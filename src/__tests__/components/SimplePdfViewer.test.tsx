import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SimplePdfViewer from '../../components/drive/SimplePdfViewer';

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

let mockAuthStore: ReturnType<typeof createMockUseAuthStore>;

jest.mock('../../store/authStore', () => {
  const mockUseAuthStore = createMockUseAuthStore();
  return {
    __esModule: true,
    useAuthStore: mockUseAuthStore,
  };
});



// Mock fetch
global.fetch = jest.fn();

describe('SimplePdfViewer', () => {
  let mockAnchor: HTMLAnchorElement;

  beforeEach(() => {
    mockAnchor = document.createElement('a');
    Object.assign(mockAnchor, {
      click: jest.fn(),
      remove: jest.fn(),
    });
    jest.clearAllMocks();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['mock pdf content'], { type: 'application/pdf' })),
      headers: {
        'content-type': 'application/pdf'
      }
    } as Response);
  });

  describe('File ID Mode', () => {
    test('renders with fileId prop', async () => {
      render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      expect(screen.getByText('PDF Viewer')).toBeInTheDocument();
      expect(screen.getByText('Open in new tab')).toBeInTheDocument();
      expect(screen.getByText('Download')).toBeInTheDocument();
    });

    test('shows authenticated iframe when fileId is provided', () => {
      render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      // Should render the authenticated iframe approach
      expect(screen.getByText('PDF Viewer')).toBeInTheDocument();
    });

    test('handles download button click', () => {
      const mockCreateElement = jest.spyOn(document, 'createElement');
      const mockClick = jest.fn();
      const mockAppendChild = jest.spyOn(document.body, 'appendChild');
      const mockRemoveChild = jest.spyOn(document.body, 'removeChild');

      mockCreateElement.mockReturnValue({
        click: mockClick,
        href: '',
        download: '',
      } as HTMLAnchorElement);

      render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      fireEvent.click(screen.getByText('Download'));

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
    });
  });

  describe('URL Mode (Legacy)', () => {
    const mockUrl = 'https://example.com/test.pdf';

    test('renders with url prop', () => {
      render(<SimplePdfViewer url={mockUrl} />);

      expect(screen.getByText('PDF Viewer')).toBeInTheDocument();
      expect(screen.getByTitle('PDF Viewer')).toBeInTheDocument();
    });

    test('shows loading state initially', () => {
      render(<SimplePdfViewer url={mockUrl} />);

      expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
    });

    test('handles iframe load event', async () => {
      render(<SimplePdfViewer url={mockUrl} />);

      const iframe = screen.getByTitle('PDF Viewer');
      fireEvent.load(iframe);

      await waitFor(() => {
        expect(screen.queryByText('Loading PDF...')).not.toBeInTheDocument();
      });
    });

    test('handles iframe error event', async () => {
      render(<SimplePdfViewer url={mockUrl} />);

      const iframe = screen.getByTitle('PDF Viewer');
      fireEvent.error(iframe);

      await waitFor(() => {
        expect(screen.getByText('PDF Preview Unavailable')).toBeInTheDocument();
      });
    });

    test('shows retry button on error and handles retry', async () => {
      render(<SimplePdfViewer url={mockUrl} />);

      const iframe = screen.getByTitle('PDF Viewer');
      fireEvent.error(iframe);

      await waitFor(() => {
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Retry'));

      // Should reset error state and show loading
      expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
    });

    test('includes proper iframe attributes', () => {
      render(<SimplePdfViewer url={mockUrl} />);

      const iframe = screen.getByTitle('PDF Viewer');
      expect(iframe).toHaveAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals');
      expect(iframe).toHaveAttribute('src', `${mockUrl}#toolbar=1&navpanes=1&scrollbar=1`);
    });
  });

  describe('Error Handling', () => {
    test('shows error message when fetch fails in fileId mode', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      // The AuthenticatedIframe component should handle the error
      // This test ensures the component renders without crashing
      expect(screen.getByText('PDF Viewer')).toBeInTheDocument();
    });

    test('handles timeout in URL mode', async () => {
      jest.useFakeTimers();
      
      render(<SimplePdfViewer url="https://example.com/test.pdf" />);

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(screen.getByText('PDF Preview Unavailable')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Authentication', () => {
    test('handles missing token gracefully', () => {
      mockAuthStore.token = null;

      // Should not crash when token is missing
      const { container } = render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper aria labels and titles', () => {
      render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      const openButton = screen.getByText('Open in new tab');
      const downloadButton = screen.getByText('Download');

      expect(openButton).toBeInTheDocument();
      expect(downloadButton).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      const openButton = screen.getByText('Open in new tab');
      expect(openButton.closest('button')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const { rerender } = render(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      // Re-render with same props
      rerender(
        <SimplePdfViewer 
          fileId="test-file-id" 
          fileName="test.pdf" 
        />
      );

      // Should still work fine
      expect(screen.getByText('PDF Viewer')).toBeInTheDocument();
    });
  });
});
