import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import { Wikilink } from '@components';
import { getPostBySlug, getPostSlugs } from '@utils/postUtil';
import { Post } from '@utils/typeUtil';
import { wikilinkPlugin } from '@utils';
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
  const [posts, setPosts] = useState<Post[]>([post]);
  const [expendedPosts, setExpendedPosts] = useState<string[]>([post.wikilink]);

  const overwriteWikiLink = ({
    className,
    href,
    ...props
  }: {
    className: string | undefined;
    href: string | undefined;
  }) => {
    const isWikiLink = className?.includes('wikilink');
    return isWikiLink ? (
      <Wikilink href={href} onClick={handleClickViewPost} />
    ) : (
      <a href={href} {...props} />
    );
  };

  const isPostExists = (post: Post) =>
    posts.some(p => _.isEqual(p.slug, post.slug));

  const handleClickViewPost = (viewedPost: Post) => {
    addPost(viewedPost);
    adjustExpendedPosts(viewedPost);
  };

  const addPost = (post: Post) => {
    if (isPostExists(post)) {
      return;
    }
    posts.push(post);
    setPosts([...posts]);
  };

  const adjustExpendedPosts = (post: Post) => {
    if (isExpended(post.wikilink)) {
      return;
    }

    // the number of posts shown is up to 3
    if (expendedPosts.length < 3) {
      setExpendedPosts([...expendedPosts, post.wikilink]);
    } else {
      setExpendedPosts([expendedPosts[1], expendedPosts[2], post.wikilink]);
    }
  };

  const isExpended = (wikilink: string) => {
    return expendedPosts.some(p => _.isEqual(p, wikilink));
  };

  useEffect(() => {
    console.log('posts:', posts);
  }, [posts]);

  return (
    <div className="flex flex-row">
      {posts.map(({ wikilink, content, title }) =>
        isExpended(wikilink) ? (
          <ReactMarkdown
            className="w-1/4"
            components={{
              // Must to do so to avoid the problem: https://github.com/facebook/react/issues/24519
              // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
              p: ({ node, ...props }) => <div {...props} />,
              a: ({ className, href }) =>
                overwriteWikiLink({ className, href }),
            }}
            key={wikilink}
            rehypePlugins={[rehypeFormat, rehypeStringify]}
            remarkPlugins={[remarkGfm, wikilinkPlugin]}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <div className="[writing-mode:vertical-lr]" key={wikilink}>
            {title}
          </div>
        ),
      )}
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
