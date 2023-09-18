'use client';
import { useEffect } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

// TODO delete if not used in future
export default function Markdown({ markdown = '' }: { markdown?: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          console.log('node', node);
          console.log('inline', inline);
          console.log('className', className);
          console.log('children', children);
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <Custom>{String(children).replace(/\n$/, '')}</Custom>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}

// TODO Delete
function Custom({ children }: { children: any }) {
  useEffect(() => {
    console.log("I'm a custom component!");
  }, []);
  return <div>{children}</div>;
}
