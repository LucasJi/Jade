'use client';

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
import { Nodes } from 'hast';
import { toText } from 'hast-util-to-text';
import { CommandIcon } from 'lucide-react';
import { ComponentProps, useEffect, useState } from 'react';

interface SearchResult {
  id: string;
  value: Nodes;
}

export function Search({ ...props }: ComponentProps<'div'>) {
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchContent, setSearchContent] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchDialogOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="py-0" {...props}>
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <Button
        id="search"
        variant="secondary"
        className="w-56 justify-between text-muted-foreground [&_svg]:size-2.5"
        size="sm"
        onClick={() => setSearchDialogOpen(true)}
      >
        <span className="text-xs">Search notes...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-muted-foreground opacity-100">
          <CommandIcon />
          <span className="text-xs">K</span>
        </kbd>
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
    </div>
  );
}
