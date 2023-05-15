import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from '@utils';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import { WikiLink } from '@components';
import { getPostBySlug, getPostSlugs, Post } from '@utils/postUtil';

type PathParamsType = {
  params: {
    slug: string[];
    content: string;
  };
};

type PropsType = {
  post: Post;
};

export default function PostPage({ post }: PropsType) {
  const { content } = post;
  const overwriteWikiLink = ({
    className,
    ...props
  }: {
    className: string | undefined;
  }) => {
    const isWikiLink = className?.includes('wiki-link');
    return isWikiLink ? <WikiLink {...props} /> : <a {...props} />;
  };

  return (
    <div>
      <div className="">
        markdown title part This part can be hidden when there is only one
        markdown in the page.
      </div>
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
        {content}
      </ReactMarkdown>
    </div>
  );
}

export async function getStaticProps({ params }: PathParamsType) {
  const post = getPostBySlug(params.slug);

  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  const slugs = getPostSlugs();

  console.log('slugs:', slugs);

  const staticPaths = {
    paths: slugs.map(slug => {
      return {
        params: {
          slug,
        },
      };
    }),
    fallback: false,
  };

  return staticPaths;
}
