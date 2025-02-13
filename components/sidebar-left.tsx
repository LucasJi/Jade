'use client';
import { getTreeView } from '@/app/api';
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { isAudio, isImg, isMd, isPdf, isVideo } from '@/lib/file';
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
import { useRouter } from 'next/navigation';
import {
  ComponentProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const TreeViewContext = createContext<{
  noteRoutePath: string;
  folders: Set<string>;
  openFolders: (opened: string[]) => void;
  closeFolder: (closed: string) => void;
}>({
  noteRoutePath: '',
  folders: new Set(),
  openFolders: () => {},
  closeFolder: () => {},
});

export function SidebarLeft({ ...props }: ComponentProps<typeof Sidebar>) {
  const [treeNodes, setTreeNodes] = useState<TreeViewNode[]>([]);
  const { routePath, vaultPath } = useSidebar();
  const [folders, setFolders] = useState<Set<string>>(new Set());

  const openFolders = useCallback((opened: string[]) => {
    setFolders(pre => {
      opened.forEach(f => pre.add(f));
      return new Set(pre);
    });
  }, []);

  const closeFolder = useCallback((closed: string) => {
    setFolders(pre => {
      pre.delete(closed);
      return new Set(pre);
    });
  }, []);

  useEffect(() => {
    getTreeView().then(data => {
      setTreeNodes(data);
    });
  }, []);

  useEffect(() => {
    const [_, ...folders] = vaultPath.split('/').reverse();
    openFolders(folders);
    console.log(vaultPath);
  }, [vaultPath, openFolders]);

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <TreeViewContext.Provider
                value={{
                  noteRoutePath: routePath,
                  folders,
                  openFolders,
                  closeFolder,
                }}
              >
                {treeNodes.map((item, index) => (
                  <Tree key={index} item={item} />
                ))}
              </TreeViewContext.Provider>
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
  const { folders, noteRoutePath, openFolders, closeFolder } =
    useContext(TreeViewContext);
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
        isActive={item.path === noteRoutePath}
        className="data-[active=true]:text-black"
        onClick={() => router.push(`/notes/${item.path || ''}`)}
      >
        <Icon />
        <span className="truncate" title={item.name}>
          {item.name}
        </span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        open={folders.has(item.name)}
        onOpenChange={open => {
          if (open) {
            openFolders([item.name]);
          } else {
            closeFolder(item.name);
          }
        }}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            <span className="truncate" title={item.name}>
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
