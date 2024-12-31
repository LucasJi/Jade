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
import { Nodes } from 'hast';
import { toText } from 'hast-util-to-text';
import { CommandIcon } from 'lucide-react';
import { ComponentProps, useEffect, useState } from 'react';

interface SearchResult {
  id: string;
  value: Nodes;
}

export function Search({ ...props }: ComponentProps<'div'>) {
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searching, setSearching] = useState(false);
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

  useEffect(() => {
    if (!searchContent) {
      setSearchResult(null);
      return () => {};
    }
    const delayDebounceFn = setTimeout(async () => {
      search(searchContent).then(data => {
        console.log('search result:', data);
        setSearchResult(data);
      });
    }, 200);
    return () => clearTimeout(delayDebounceFn);
  }, [searchContent]);

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
            setSearchResult(null);
          }
        }}
      >
        <CommandInput
          placeholder="Search..."
          onValueChange={value => setSearchContent(value)}
        />
        {searching ? (
          <div className="flex h-32 items-center justify-center">
            <Loader />
          </div>
        ) : (
          <CommandList>
            {searchResult === null ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup heading="Notes">
                {Object.keys(searchResult).map((key, idx) => {
                  const results = searchResult[key];
                  return results.map((r: Nodes, idx: number) => (
                    <CommandItem key={`${key}-${idx}`}>
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground">
                          {key}
                        </span>
                        <span className="font-medium">{toText(r)}</span>
                      </div>
                    </CommandItem>
                  ));
                })}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </CommandDialog>
    </div>
  );
}
