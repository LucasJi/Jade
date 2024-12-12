'use client';
import { getFileTree } from '@/app/api';
import { SearchInput } from '@/components/search-input';
import { TreeViewNode } from '@/components/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@/components/ui/sidebar';
import { isAudio, isImg, isMd, isPdf, isVideo } from '@/lib/file';
import { decodeNotePath, getEncodedNotePathFromSlug } from '@/lib/note';
import {
  ChevronRight,
  File,
  FileAudio,
  FileDown,
  FileImage,
  FileText,
  FileVideo,
  Folder,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { ComponentProps, useEffect, useState } from 'react';

export function SidebarLeft({ ...props }: ComponentProps<typeof Sidebar>) {
  const [treeNodes, setTreeNodes] = useState<TreeViewNode[]>([]);
  useEffect(() => {
    getFileTree().then(data => {
      console.log('Tree Data:', data);
      setTreeNodes(data);
    });
  }, []);
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SearchInput />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {treeNodes.map((item, index) => (
                <Tree key={index} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function Tree({ item }: { item: TreeViewNode }) {
  const router = useRouter();
  const { slug } = useParams<{ slug: string[] }>();
  const currentNotePath = slug
    ? getEncodedNotePathFromSlug(slug.map(e => decodeURIComponent(e)))
    : '';
  const decodedNotePath = decodeNotePath(currentNotePath);
  const [_, ...folders] = decodedNotePath.split('/').reverse();
  if (!item.isDir) {
    let Icon;
    if (isMd(item.path)) {
      Icon = () => <FileDown />;
    } else if (isImg(item.path)) {
      Icon = () => <FileImage />;
    } else if (isAudio(item.path)) {
      Icon = () => <FileAudio />;
    } else if (isVideo(item.path)) {
      Icon = () => <FileVideo />;
    } else if (isPdf(item.path)) {
      Icon = () => <FileText />;
    } else {
      Icon = () => <File />;
    }

    return (
      <SidebarMenuButton
        isActive={item.path === currentNotePath}
        className="data-[active=true]:bg-transparent data-[active=true]:text-black"
        onClick={() => router.push(`/notes/${item.path || ''}`)}
      >
        <Icon />
        <span className="truncate" title={item.path}>
          {item.name}
        </span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={folders.includes(item.name)}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            <span className="truncate" title={item.path}>
              {item.name}
            </span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children.map((subItem, index) => (
              <Tree key={index} item={subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
