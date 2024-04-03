import classNames from 'classnames';
import { BlockContent, Link, List, ListItem, Text } from 'mdast';

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
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const headings: ListItem[] = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/${id}/toc`,
    {
      method: 'GET',
      cache: 'no-cache',
    },
  ).then(resp => resp.json());

  return (
    <div className={classNames(className)}>
      <span className="font-bold">Table of Content</span>
      <ul>
        {headings.map((heading, index) => (
          <TocNode key={`${heading.type}-${index}`} heading={heading} />
        ))}
      </ul>
    </div>
  );
}
