import { useEffect } from 'react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export default function Markdown() {
  const markdown = `Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`;
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
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

function Custom({ children }: { children: any }) {
  useEffect(() => {
    console.log("I'm a custom component!");
  }, []);
  return <div>{children}</div>;
}
