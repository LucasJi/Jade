import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from 'utils';
import { GetStaticProps } from 'next/types';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import fs from 'fs';
import { join } from 'path';
import remarkGfm from 'remark-gfm';
import { omit } from 'lodash';
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react';

interface TestProps {
  file?: string;
}

function WikiLink(props: any) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const omittedProps = omit(props, ['className']);
  return (
    <Popover
      closeOnBlur={false}
      isLazy
      isOpen={isOpen}
      onClose={onClose}
      onOpen={onOpen}
      placement="auto"
      returnFocusOnClose={false}
    >
      <PopoverTrigger>
        <a
          className="underline decoration-pink-300"
          {...omittedProps}
          onMouseEnter={() => {
            console.log('onMouseEnter');
            onOpen();
          }}
          onMouseLeave={() => {
            console.log('onMouseLeave');
            onClose();
          }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>Popover Content</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default function Test({ file = '' }: TestProps) {
  const overwriteWikiLink = ({
    className,
    ...props
  }: {
    className: string | undefined;
  }) => {
    console.log(className);
    const isWikiLink = className?.includes('wiki-link');
    console.log('className contains wiki-link:', isWikiLink);
    return isWikiLink ? <WikiLink {...props} /> : <a {...props} />;
  };

  return (
    <div>
      <ReactMarkdown
        components={{
          // Must to do so to avoid the problem: https://github.com/facebook/react/issues/24519
          p: ({ node, ...props }) => <div {...props} />,
          a: ({ className, ...props }) =>
            overwriteWikiLink({ className, ...props }),
        }}
        rehypePlugins={[rehypeFormat, rehypeStringify]}
        remarkPlugins={[remarkGfm, wikiLinkPlugin]}
      >
        {file}
      </ReactMarkdown>
    </div>
  );
}

export const getStaticProps: GetStaticProps = () => {
  const postsDirectory = join(process.cwd(), 'posts');
  console.log('post directory:', postsDirectory);

  const demo = join(postsDirectory, 'wiki-link.md');

  const fileContents = fs.readFileSync(demo, 'utf-8');

  return {
    props: {
      file: fileContents,
    },
  };
};
