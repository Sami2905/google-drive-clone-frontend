'use client';
import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';

interface CodeViewerProps {
  url: string;
  fileName: string;
  mimeType: string;
}

export default function CodeViewer({ url, fileName, mimeType }: CodeViewerProps) {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { theme } = useTheme();

  // Determine language from file extension or mime type
  const getLanguage = () => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeToLang: Record<string, string> = {
      'text/html': 'html',
      'text/css': 'css',
      'text/javascript': 'javascript',
      'text/typescript': 'typescript',
      'text/x-python': 'python',
      'text/x-java': 'java',
      'text/x-c': 'c',
      'text/x-c++': 'cpp',
      'text/x-csharp': 'csharp',
      'text/x-ruby': 'ruby',
      'text/x-go': 'go',
      'text/x-rust': 'rust',
      'text/x-swift': 'swift',
      'text/x-kotlin': 'kotlin',
      'text/x-scala': 'scala',
      'text/markdown': 'markdown',
      'text/x-yaml': 'yaml',
      'text/x-toml': 'toml',
      'application/json': 'json',
      'application/xml': 'xml',
    };

    // Try to get language from extension first
    const extToLang: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'toml': 'toml',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
      'dockerfile': 'dockerfile',
      'gitignore': 'gitignore',
    };

    if (ext && extToLang[ext]) {
      return extToLang[ext];
    }

    // Fallback to mime type
    return mimeToLang[mimeType] || 'text';
  };

  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load file content');
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  if (loading) {
    return (
      <div className="grid h-[70vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid h-[70vh] place-items-center">
        <div className="text-center">
          <p className="mb-4 text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-md border-b bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{fileName}</span>
          <span className="text-xs text-slate-500">({getLanguage()})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(content);
            }}
          >
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open(url, '_blank', 'noopener,noreferrer');
            }}
          >
            Open
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[70vh]">
        <SyntaxHighlighter
          language={getLanguage()}
          style={theme === 'dark' ? oneDark : undefined}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '0.9em',
          }}
        >
          {content}
        </SyntaxHighlighter>
      </ScrollArea>
    </div>
  );
}
