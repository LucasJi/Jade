import wikilinkPlugin from '@utils/remark-wikilink';
import { ReactNode, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import { Post } from 'types';
import Wikilink from './wikilink';

function VerticalLrTitle({ title }: { title: string }) {
  return <div className="[writing-mode:vertical-lr]">{title}</div>;
}

function BambooSlip({ post }: { post: Post }) {
  const [posts, setPosts] = useState<Post[]>([post]);
  // always display the selected one and its next two posts(only if it has)
  const [anchor, setAnchor] = useState<string>();

  const wikilinkRender = ({
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
    return isWikiLink && href ? (
      <Wikilink onClick={() => handleClickShowPost(href)} wikilink={href}>
        {children}
      </Wikilink>
    ) : (
      <a href={href} {...props} />
    );
  };

  const handleClickShowPost =
    (currentPostWikilink: string) => (viewed: Post) => {
      const currentPostIdx = posts.findIndex(
        p => p.wikilink === currentPostWikilink,
      );

      if (currentPostIdx + 1 <= posts.length - 1) {
        const theNextPost = posts[currentPostIdx + 1];
        if (theNextPost.wikilink !== viewed.wikilink) {
          const adjustedPosts = posts.slice(0, currentPostIdx);
          adjustedPosts.push(viewed);
          setPosts(adjustedPosts);
        } else {
          // adjust expended posts
        }
      } else {
        // current post is the last one in posts
        // push the viewed post to the posts array directly
        posts.push(viewed);
        setPosts([...posts]);
      }
    };

  const isExpended = (wikilink: string) => {
    const anchorPostIdx = posts.findIndex(p => p.wikilink === anchor);

    let expendedPosts;
    if (anchorPostIdx + 2 <= posts.length - 1) {
      expendedPosts = posts.slice(anchorPostIdx, anchorPostIdx + 2);
    } else if (anchorPostIdx + 1 <= posts.length - 1) {
      expendedPosts = posts.slice(anchorPostIdx, anchorPostIdx + 1);
    } else {
      expendedPosts = [posts[anchorPostIdx]];
    }

    return expendedPosts.some(p => p.wikilink === wikilink);
  };

  return (
    <div className="flex flex-row h-full">
      {posts.map(({ title, content, wikilink, backlinks }) =>
        isExpended(wikilink) ? (
          <div className="w-1/4 break-words" key={wikilink}>
            <ReactMarkdown
              components={{
                // Must to do so to avoid the problem: https://github.com/facebook/react/issues/24519
                // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
                p: ({ node, ...props }) => <div {...props} />,
                a: props => {
                  const { className, href, children } = props;
                  return wikilinkRender({ className, href, children });
                },
                // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
                pre: ({ node, ...props }) => (
                  <pre className="overflow-x-auto" {...props} />
                ),
              }}
              rehypePlugins={[rehypeFormat, rehypeStringify]}
              remarkPlugins={[remarkGfm, wikilinkPlugin]}
            >
              {content}
            </ReactMarkdown>
            <div>
              <div className="bg-green-200 font-bold">Backlinks</div>
              {backlinks.length > 0 ? (
                backlinks.map(bl => (
                  <Wikilink
                    key={bl}
                    onClick={() => {
                      console.log('show backlink');
                    }}
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

export default BambooSlip;
