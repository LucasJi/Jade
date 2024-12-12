'use client';

import { search } from '@/app/api';
import SimpleMarkdown from '@/components/simple-md';
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
          placeholder="Press 'Enter' to search..."
          className="pl-8"
          value={searchContent}
          onChange={e => setSearchContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && searchContent) {
              setSearchDialogOpen(true);
              search(searchContent).then(data => {
                setSearchResult(data.documents);
                setSearching(false);
              });
            }
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-2 top-1/2 size-4 -translate-y-1/2 cursor-pointer select-none opacity-50',
          )}
          onClick={() => {
            console.log('clear search searchContent');
            setSearchContent('');
          }}
        >
          <X />
        </Button>
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        <CommandDialog
          title="search-dialog"
          open={searchDialogOpen}
          onOpenChange={open => {
            setSearchDialogOpen(open);
            if (!open) {
              setSearching(true);
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
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Notes">
                {searchResult.map((result, idx) => (
                  <CommandItem key={idx}>
                    <SimpleMarkdown hast={result.value} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </CommandDialog>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
