import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import { Wikilink } from '@components';
import { getCachedPostBySlug, getCachedSlugs } from '@utils/postUtil';
import { wikilinkPlugin } from '@utils/remark-wikilink';
import { ReactNode, useEffect, useState } from 'react';
import _ from 'lodash';
import { Post, Slug } from 'types';

type PathParamsType = {
  params: {
    slug: Slug;
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
    children,
    ...props
  }: {
    className: string | undefined;
    href: string | undefined;
    children: ReactNode;
  }) => {
    const isWikiLink = className?.includes('wikilink');
    return isWikiLink ? (
      <Wikilink onClick={handleClickViewPost} wikilink={href}>
        {children}
      </Wikilink>
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
    console.log('slug refresh:', posts);
  }, [posts]);

  return (
    <div className="flex flex-row h-full">
      {posts.map(({ wikilink, content, title, backWikilinks }) =>
        isExpended(wikilink) ? (
          <div className="w-1/4" key={wikilink}>
            <ReactMarkdown
              components={{
                // Must to do so to avoid the problem: https://github.com/facebook/react/issues/24519
                // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
                p: ({ node, ...props }) => <div {...props} />,
                a: props => {
                  const { className, href, children } = props;
                  return overwriteWikiLink({ className, href, children });
                },
              }}
              rehypePlugins={[rehypeFormat, rehypeStringify]}
              remarkPlugins={[remarkGfm, wikilinkPlugin]}
            >
              {content}
            </ReactMarkdown>
            <div>
              <div className="bg-green-200 font-bold">Backlinks</div>
              {backWikilinks.length > 0 ? (
                backWikilinks.map(bl => (
                  <Wikilink
                    key={bl}
                    onClick={handleClickViewPost}
                    wikilink={bl}
                  >
                    {bl}
                  </Wikilink>
                ))
              ) : (
                <div className="bg-yellow-600">No Backlinks</div>
              )}
            </div>
          </div>
        ) : (
          <VerticalLrTitle key={wikilink} title={title} />
        ),
      )}
    </div>
  );
}

function VerticalLrTitle({ title }: { title: string }) {
  return <div className="[writing-mode:vertical-lr]">{title}</div>;
}

export async function getStaticProps({ params }: PathParamsType) {
  const slug: Slug = params.slug;

  const post = await getCachedPostBySlug(slug);

  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  const slugs = await getCachedSlugs();

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
