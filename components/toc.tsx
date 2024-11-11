import { getNoteHeadings } from '@/lib/note';
import clsx from 'clsx';
import {
  BlockContent,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  Root,
} from 'mdast';

const findText = (heading: Paragraph): { text: string; url: string } => {
  let text = '';
  let url = '';

  const find = (children: PhrasingContent[]) => {
    for (const child of children) {
      if (child.type === 'link') {
        url = child.url;
      }

      if (child.type === 'text') {
        text = child.value;
      }

      if ('children' in child) {
        find(child.children);
      }
    }
  };

  find(heading.children);

  return { text, url };
};

function TocNode({ heading }: { heading: BlockContent | ListItem }) {
  let node;
  if (heading.type === 'paragraph') {
    const { text, url } = findText(heading);
    node = (
      <li>
        <a className="text-base text-[#5c5c5c]" href={url}>
          {text}
        </a>
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

export default function Toc({
  mdast,
  className,
}: {
  mdast: Root;
  className?: string;
}) {
  const headings = getNoteHeadings(mdast);
  return (
    headings?.length > 0 && (
      <div className={clsx(className)}>
        <span className="font-bold">On this page</span>
        <ul>
          {headings.map((heading, index) => (
            <TocNode key={`${heading.type}-${index}`} heading={heading} />
          ))}
        </ul>
      </div>
    )
  );
}
