import { Slug } from '@types';
import { getCachedSlugs, getPostBySlug } from '@utils/postUtil';
import classNames from 'classnames';
import Markdown from '@components/Markdown';
import Wikilink from '@components/Wikilink';

export default async function Post({ params }: { params: { slug: Slug } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return <div>POST NOT FOUND</div>;
  }

  const { wikilink, content, backlinks } = post;

  return (
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
      <Markdown markdown={content} />
      <div>
        <div className="bg-green-200 font-bold">Backlinks</div>
        {backlinks.length > 0 ? (
          backlinks.map(bl => (
            <Wikilink key={bl} wikilink={bl}>
              {bl}
            </Wikilink>
          ))
        ) : (
          <div className="bg-yellow-600">No Backlinks</div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return await getCachedSlugs();
}
