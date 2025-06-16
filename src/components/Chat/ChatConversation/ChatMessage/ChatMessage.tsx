import { Doc } from '@t3chat-convex/_generated/dataModel';
import { cn } from '@t3chat/lib/utils';
import clsx from 'clsx';
import { omit } from 'lodash';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const THEME_HIGHLIGHT_STYLES: SyntaxHighlighterProps['style'] = {
  ...vscDarkPlus,
};

const CONTAINER_STYLES = {
  margin: 0,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 12,
  borderBottomRightRadius: 12,
  background: '#232136',
  fontSize: 14,
  padding: '1.2em',
};

function getExtension(lang: string) {
  const map: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    html: 'html',
    css: 'css',
    json: 'json',
    bash: 'sh',
    shell: 'sh',
    go: 'go',
    rust: 'rs',
  };
  return map[lang] || lang;
}

export const ChatMessage = React.memo(({ content, role }: Doc<'messages'>) => {
  return (
    <div className={cn('my-1', role === 'user' && 'bg-primary ml-auto rounded-md p-3')}>
      <ReactMarkdown
        components={{
          ul: ({ children }) => <ul className="list-disc p-0 marker:text-gray-400">{children}</ul>,
          ol: ({ children }) => <ol className="list-disc p-0">{children}</ol>,
          li: ({ children }) => <li className="p-0 text-gray-200">{children}</li>,
          pre: ({ children }) => <div className="group">{children}</div>,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1].toLowerCase() : '';
            const codeString = String(children).replace(/\n$/, '');

            // Download handler
            const handleDownload = () => {
              const blob = new Blob([codeString], { type: 'text/plain' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `code.${getExtension(lang)}`;
              a.click();
              URL.revokeObjectURL(a.href);
            };

            // Copy handler
            const handleCopy = () => {
              navigator.clipboard.writeText(codeString);
            };

            const syntaxHighligherProps = omit(props, 'ref');

            return match ? (
              <div className="relative">
                <div className="bg-tertiary flex items-center justify-between rounded-t-lg px-4 py-2">
                  <span className="text-xs tracking-wide text-gray-300 lowercase">{lang}</span>
                  <div className="flex items-center gap-2">
                    {/* Download icon */}
                    <button
                      onClick={handleDownload}
                      className="rounded p-1 transition-colors hover:bg-[#3a3350]"
                      title="Download"
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3v12m0 0l-4-4m4 4l4-4m-9 7h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    {/* Copy icon */}
                    <button
                      onClick={handleCopy}
                      className="rounded p-1 transition-colors hover:bg-[#3a3350]"
                      title="Copy"
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <rect x="3" y="3" width="13" height="13" rx="2" />
                      </svg>
                    </button>
                    {/* Menu icon */}
                    <button
                      className="rounded p-1 transition-colors hover:bg-[#3a3350]"
                      title="More"
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        className="text-gray-300 transition-colors hover:text-white"
                      >
                        <circle cx="12" cy="6" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="18" r="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>
                <SyntaxHighlighter
                  /* @ts-expect-error adsosakod */
                  style={THEME_HIGHLIGHT_STYLES}
                  language={lang}
                  PreTag="div"
                  customStyle={CONTAINER_STYLES}
                  className={className}
                  {...syntaxHighligherProps}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className={clsx(
                  className,
                  'bg-primary overflow-auto rounded-md px-1.5 py-1 text-sm'
                )}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';
