'use client';

import { getNoteHeadingByPath } from '@/app/api';
import Footer from '@/components/footer';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { decodeNotePath, getRoutePathFromURIComponentSlug } from '@/lib/note';
import {
  BlockContent,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
} from 'mdast';
import { useParams } from 'next/navigation';
import { ComponentProps, useEffect, useState } from 'react';

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

function TocNode({
  heading,
  isSubBtn,
}: {
  heading: BlockContent | ListItem;
  isSubBtn?: boolean;
}) {
  let node;
  if (heading.type === 'paragraph') {
    const { text, url } = findText(heading);
    node = isSubBtn ? (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild>
          <a href={url} className="font-medium">
            {text}
          </a>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    ) : (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a href={url} className="font-medium">
            {text}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
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
      <SidebarMenuSub>
        {list.children.map((h, index) => (
          <TocNode key={`${h.type}-${index}`} heading={h} isSubBtn />
        ))}
      </SidebarMenuSub>
    );
  }

  return node;
}

export function SidebarRight({ ...props }: ComponentProps<typeof Sidebar>) {
  const [heading, setHeading] = useState<ListItem[]>([]);
  const { slug } = useParams<{ slug: string[] }>();
  const currentNotePath = slug ? getRoutePathFromURIComponentSlug(slug) : '';
  const decodedNotePath = decodeNotePath(currentNotePath);

  useEffect(() => {
    getNoteHeadingByPath(decodedNotePath).then(data => {
      setHeading(data);
    });
  }, [decodedNotePath]);

  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupLabel>Table of Contents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {heading.map((heading, index) => (
                <TocNode key={`${heading.type}-${index}`} heading={heading} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Footer />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
