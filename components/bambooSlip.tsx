import classNames from 'classnames';
import { useState } from 'react';
import { Post } from 'types';
import Wikilink from './wikilink';
import VerticalLrTitle from './verticalLrTitle';
import { SlipMarkdown } from './slipMarkdown';

export default function BambooSlip({ post }: { post: Post }) {
  const [posts, setPosts] = useState<Post[]>([post]);
  // always display the selected one and its next two posts(only if it has)
  const [anchor, setAnchor] = useState<number>(0);

  const viewPost = (currentPostWikilink: string) => (toView: Post) => {
    const currentPostIdx = posts.findIndex(
      p => p.wikilink === currentPostWikilink,
    );

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

  const getExpendedPosts = () => {
    let expendedPosts: Post[] = [];
    if (anchor + 2 <= posts.length - 1) {
      expendedPosts = posts.slice(anchor, anchor + 3);
    } else if (anchor + 1 <= posts.length - 1) {
      expendedPosts = posts.slice(anchor, anchor + 2);
    } else {
      expendedPosts = [posts[anchor]];
    }
    return expendedPosts;
  };

  const isExpended = (wikilink: string) => {
    const expendedPosts = getExpendedPosts();
    return expendedPosts.some(p => p.wikilink === wikilink);
  };

  const handleClickTitle = (wikilink: string) => {
    const idx = posts.findIndex(p => p.wikilink === wikilink);
    if (idx === posts.length - 1) {
      setAnchor(idx - 2);
    } else {
      setAnchor(idx);
    }
  };

  const calcWidth = (isTitle: boolean) => {
    // unit: rem
    const titleWidth = 4;
    const postCount = posts.length;
    const expendedPostCount = getExpendedPosts().length;
    const titleCount = postCount - expendedPostCount;

    if (isTitle) {
      return `${titleWidth}rem`;
    }

    return `calc(100% - (${titleWidth}rem) * ${titleCount} / ${postCount})`;
  };

  return (
    <div className="flex flex-row w-full h-full">
      {posts.map(({ title, content, wikilink, backlinks }, idx) => {
        const isNotTitle = isExpended(wikilink);
        return (
          <div
            className={classNames({
              'border-l': idx !== 0,
            })}
            key={wikilink}
            style={{
              width: calcWidth(!isNotTitle),
            }}
          >
            {isNotTitle ? (
              <div
                className={classNames(
                  'break-words',
                  'flex',
                  'flex-col',
                  'px-4',
                  'overflow-y-auto',
                  'h-full',
                  'pt-4',
                )}
                key={`content-${wikilink}`}
              >
                <SlipMarkdown
                  content={content}
                  onClickViewPost={viewPost(wikilink)}
                />
                <div>
                  <div className="bg-green-200 font-bold">Backlinks</div>
                  {backlinks.length > 0 ? (
                    backlinks.map(bl => (
                      <Wikilink
                        key={bl}
                        onClick={viewPost(wikilink)}
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
              <VerticalLrTitle
                className="h-full, w-[inherit]"
                key={`title-${wikilink}`}
                onClick={() => handleClickTitle(wikilink)}
                title={title}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
