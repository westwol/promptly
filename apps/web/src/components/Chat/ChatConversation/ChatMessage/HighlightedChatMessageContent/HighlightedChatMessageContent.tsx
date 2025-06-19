import React from 'react';
import clsx from 'clsx';
import { omit } from 'lodash';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter, SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

import { Tooltip } from '@t3chat/components/ui';

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

const getExtension = (lang: string) => {
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
};

interface HighlightedChatMessageContentProps {
  content: string;
}

export const HighlightedChatMessageContent = ({ content }: HighlightedChatMessageContentProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ol: ({ children }) => (
          <ol className="ml-0 list-decimal first:mt-0 last:mb-0">{children}</ol>
        ),
        ul: ({ children }) => (
          <ul className="mt-[-20px] ml-0 list-disc marker:text-gray-400">{children}</ul>
        ),
        li: ({ children }) => (
          <li className="ml-5 text-gray-200">
            <div className="flex flex-col gap-2">{children}</div>
          </li>
        ),
        p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
        pre: ({ children }) => <div className="group">{children}</div>,
        table({ children }) {
          return (
            <table className="my-4 w-full border-collapse text-left text-sm">{children}</table>
          );
        },
        thead({ children }) {
          return <thead className="bg-primary">{children}</thead>;
        },
        tbody({ children }) {
          return <tbody>{children}</tbody>;
        },
        tr({ children }) {
          return <tr>{children}</tr>;
        },
        th({ children }) {
          return <th className="border-primary/50 border p-2 font-semibold">{children}</th>;
        },
        td({ children }) {
          return <td className="border-primary/50 border p-2">{children}</td>;
        },
        a: ({ node, href, children, ...props }) => {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const lang = match ? match[1].toLowerCase() : '';
          const codeString = String(children).replace(/\n$/, '');

          const handleDownload = () => {
            const blob = new Blob([codeString], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `code.${getExtension(lang)}`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast('File downloaded');
          };

          const handleCopy = () => {
            navigator.clipboard.writeText(codeString);
            toast('Copied to the clipboard');
          };

          const syntaxHighligherProps = omit(props, 'ref');

          return match ? (
            <div className="relative">
              <div className="bg-tertiary flex items-center justify-between rounded-t-lg px-4 py-2">
                <span className="text-xs tracking-wide text-gray-300 lowercase">{lang}</span>
                <div className="flex items-center gap-2">
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={handleCopy}
                        className="rounded p-1 transition-colors hover:bg-[#3a3350]"
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content sideOffset={5}>Copy</Tooltip.Content>
                  </Tooltip.Root>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={handleDownload}
                        className="rounded p-1 transition-colors hover:bg-[#3a3350]"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content sideOffset={5}>Download</Tooltip.Content>
                  </Tooltip.Root>
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
              className={clsx(className, 'bg-primary overflow-auto rounded-md px-1.5 py-1 text-sm')}
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
  );
};
