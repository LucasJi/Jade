import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from '@utils';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import { WikiLink } from '@components';
import { getAllPosts, getPostBySlug } from '@utils/postUtil';

type PathParamsType = {
  params: {
    slug: string[];
    content: string;
  };
};

type PropsType = {
  slug: string[];
  content: string;
};

export default function Post({ slug, content }: PropsType) {
  console.log('slug:', slug);
  console.log('content:', content);

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
        {content}
      </ReactMarkdown>
    </div>
  );
}

export async function getStaticProps({ params }: PathParamsType) {
  const post = getPostBySlug(params.slug, ['slug', 'content']);

  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug']);

  return {
    paths: posts.map(post => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
