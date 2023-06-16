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
  const [anchor, setAnchor] = useState<number>(0);

  console.log('posts', posts);

  const wikilinkRender = ({
    className,
    href,
    children,
    currentPostWikilink,
    ...props
  }: {
    className: string | undefined;
    href: string | undefined;
    currentPostWikilink: string;
    children: ReactNode;
  }) => {
    const isWikiLink = className?.includes('wikilink');
    return isWikiLink && href ? (
      <Wikilink onClick={viewPost(currentPostWikilink)} wikilink={href}>
        {children}
      </Wikilink>
    ) : (
      <a href={href} {...props} />
    );
  };

  const viewPost = (currentPostWikilink: string) => (toView: Post) => {
    console.log('current wikilink', currentPostWikilink);

    const currentPostIdx = posts.findIndex(
      p => p.wikilink === currentPostWikilink,
    );

    console.log('posts', posts);
    console.log('current idx', currentPostIdx);

    if (isViewed(toView)) {
      viewViewedPost(currentPostIdx, toView);
    } else {
      viewNewPost(currentPostIdx, toView);
    }
  };

  const isViewed = (toView: Post) =>
    posts.some(p => p.wikilink === toView.wikilink);

  const viewViewedPost = (from: number, toView: Post) => {
    const toViewIdx = posts.findIndex(p => p.wikilink === toView.wikilink);

    // view next or pre post, maybe self
    if (Math.abs(toViewIdx - from) <= 1) {
      // view next
      if (toViewIdx > from) {
        if (Math.abs(anchor - from) > 1) {
          setAnchor(pre => pre + 1);
        }
      } else if (toViewIdx < from) {
        // view pre
        if (anchor === from) {
          setAnchor(pre => pre - 1);
        }
      }
    } else {
      setAnchor(toViewIdx);
    }
  };

  const viewNewPost = (from: number, toView: Post) => {
    const adjustedPosts = posts.slice(0, from + 1);
    adjustedPosts.push(toView);
    setPosts(adjustedPosts);

    // adjust expended posts
    if (adjustedPosts.length - anchor > 3) {
      setAnchor(pre => pre + 1);
    }
  };

  const isExpended = (wikilink: string) => {
    let expendedPosts;
    if (anchor + 2 <= posts.length - 1) {
      expendedPosts = posts.slice(anchor, anchor + 3);
    } else if (anchor + 1 <= posts.length - 1) {
      expendedPosts = posts.slice(anchor, anchor + 2);
    } else {
      expendedPosts = [posts[anchor]];
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
                  return wikilinkRender({
                    className,
                    href,
                    children,
                    currentPostWikilink: wikilink,
                  });
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
