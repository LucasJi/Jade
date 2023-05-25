import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { remarkDemo } from '@utils';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import { WikiLink } from '@components';
import { getPostBySlug, getPostSlugs } from '@utils/postUtil';
import { Post } from '@utils/typeUtil';
import { useEffect, useState } from 'react';
import _ from 'lodash';

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
  const overwriteWikiLink = ({
    className,
    href,
    ...props
  }: {
    className: string | undefined;
    href: string | undefined;
  }) => {
    const isWikiLink = className?.includes('wiki-link');
    return isWikiLink ? (
      <WikiLink href={href} onClick={appendPost} />
    ) : (
      <a href={href} {...props} />
    );
  };

  const [posts, setPosts] = useState<Post[]>([post]);

  const isPostExists = (post: Post) =>
    posts.some(p => _.isEqual(p.slug, post.slug));

  const appendPost = (appended: Post) => {
    if (isPostExists(appended)) {
      return;
    }
    posts.push(appended);
    setPosts([...posts]);
  };

  useEffect(() => {
    console.log('posts:', posts);
  }, [posts]);

  return (
    <div className="flex flex-row">
      {posts.map(post => {
        return (
          <div key={post.wikilink}>
            <div className="[writing-mode:vertical-lr]">Post Title</div>
            <ReactMarkdown
              className="w-1/3"
              components={{
                // Must to do so to avoid the problem: https://github.com/facebook/react/issues/24519
                // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
                p: ({ node, ...props }) => <div {...props} />,
                a: ({ className, href }) =>
                  overwriteWikiLink({ className, href }),
              }}
              rehypePlugins={[rehypeFormat, rehypeStringify]}
              remarkPlugins={[remarkGfm, remarkDemo]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        );
      })}
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
