import { BlockContent, Link, List, ListItem, Text } from 'mdast';
import clsx from 'clsx';
import { getPostToc } from '@/lib/server-utils';

function TocNode({ heading }: { heading: BlockContent | ListItem }) {
  let node;
  if (heading.type === 'paragraph') {
    const link = heading.children[0] as Link;
    const text = link.children[0] as Text;
    node = (
      <li>
        <a href={link.url}>{text.value}</a>
      </li>
    );
  } else if (heading.type === 'listItem') {
    const listItem = heading as ListItem;
    node = (
      <>
        {listItem.children.map((item, index) => (
          <TocNode
            key={`${item.type}-${index}`}
            heading={item as BlockContent}
          />
        ))}
      </>
    );
  } else {
    const list = heading as List;
    node = (
      <li>
        <ul className="ml-2">
          {list.children.map((h, index) => (
            <TocNode key={`${h.type}-${index}`} heading={h} />
          ))}
        </ul>
      </li>
    );
  }

  return node;
}

export default async function Toc({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const headings: ListItem[] = getPostToc(content);

  return (
    headings?.length > 0 && (
      <div className={clsx(className)}>
        <span className="font-bold">On this page</span>
        <ul className="font-thin text-sm">
          {headings.map((heading, index) => (
            <TocNode key={`${heading.type}-${index}`} heading={heading} />
          ))}
        </ul>
      </div>
    )
  );
}
