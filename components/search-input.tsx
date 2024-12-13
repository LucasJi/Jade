'use client';

import { search } from '@/app/api';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar';
import { cn } from '@/components/utils';
import { Nodes } from 'hast';
import { toText } from 'hast-util-to-text';
import { Search, X } from 'lucide-react';
import { ComponentProps, useState } from 'react';

interface SearchResult {
  id: string;
  value: Nodes;
}

export function SearchInput({ ...props }: ComponentProps<typeof SidebarGroup>) {
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchContent, setSearchContent] = useState('');
  return (
    <SidebarGroup className="py-0" {...props}>
      <SidebarGroupContent className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Search..."
          className="px-8"
          value={searchContent}
          onChange={e => setSearchContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && searchContent) {
              setSearching(true);
              setSearchDialogOpen(true);
              search(searchContent).then(data => {
                setSearchResult(data.documents);
                setSearching(false);
              });
            }
          }}
        />
        {searchContent && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-2 top-1/2 size-4 -translate-y-1/2 cursor-pointer select-none',
            )}
            onClick={() => {
              console.log('clear search searchContent');
              setSearchContent('');
            }}
          >
            <X />
          </Button>
        )}
        <Button
          className="absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none"
          variant="ghost"
          size="icon"
          disabled={!searchContent}
          onClick={() => {
            setSearching(true);
            setSearchDialogOpen(true);
            search(searchContent).then(data => {
              setSearchResult(data.documents);
              setSearching(false);
            });
          }}
        >
          <Search />
        </Button>
        <CommandDialog
          title="search-dialog"
          open={searchDialogOpen}
          onOpenChange={open => {
            setSearchDialogOpen(open);
            if (!open) {
              setSearchResult([]);
            }
          }}
        >
          <CommandInput placeholder="Search..." />
          {searching ? (
            <div className="flex h-32 items-center justify-center">
              <Loader />
            </div>
          ) : (
            <CommandList>
              {searchResult.length <= 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup heading="Notes">
                  {searchResult.map((result, idx) => (
                    <CommandItem key={idx}>
                      {/*<SimpleMarkdown hast={result.value} />*/}
                      {toText(result.value)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </CommandDialog>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
