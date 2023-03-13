import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from 'utils';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import fs from 'fs';
import { join } from 'path';
import remarkGfm from 'remark-gfm';
import { WikiLink } from '@components';

type Params = {
  params: {
    slug: string;
  };
};

type Props = {
  slug: string;
  file: string;
};

const postDir = join(process.cwd(), 'posts');

export const getStaticPaths = async () => {
  const slugs = fs
    .readdirSync(postDir)
    .map(postName => postName.replace(/\.md$/, ''));

  console.log('slugs:', slugs);

  return {
    paths: slugs.map(slug => {
      return {
        params: {
          slug,
        },
      };
    }),
    fallback: false,
  };
};

export const getStaticProps = async ({ params }: Params) => {
  return {
    props: {
      slug: params.slug,
    },
  };
};

export default function Post({ slug, file }: Props) {
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
          // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
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
