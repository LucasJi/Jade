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
  CommandSeparator,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { encodeNotePath } from '@/lib/note';
import { Nodes } from 'hast';
import { toText } from 'hast-util-to-text';
import { trim } from 'lodash';
import { CommandIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ComponentProps, useEffect, useState } from 'react';

const NoResultFound = () => (
  <CommandEmpty className="py-6 text-center text-xs">
    No Result found.
  </CommandEmpty>
);

const highlight = (text: string, searchContent: string) => {
  const keywords = trim(searchContent).split(' ');
  let splits: any[] = [trim(text)];
  for (const keyword of keywords) {
    splits = splits
      .map((s, idx) =>
        typeof s === 'string'
          ? s
              .split(new RegExp(`(${keyword})`, 'gi'))
              .map((c, i) =>
                c === keyword ? (
                  <mark key={`${keyword}-${idx}-${i}`}>{c}</mark>
                ) : (
                  c
                ),
              )
          : [s],
      )
      .flatMap(s => s);
  }
  return splits;
};

export function Search({ ...props }: ComponentProps<'div'>) {
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchContent, setSearchContent] = useState('');
  const router = useRouter();

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
        <CommandList>
          {(searchResult === null ||
            (!searchResult.noteResult &&
              searchResult.tagResult.length <= 0)) && <NoResultFound />}
          {searchResult?.noteResult && (
            <CommandGroup heading="Notes">
              {Object.keys(searchResult.noteResult).map((key, noteIdx) => {
                const results = searchResult.noteResult[key];
                return results.map((r: Nodes, idx: number) => (
                  <CommandItem
                    key={`${noteIdx}-${key}-${idx}`}
                    onSelect={() =>
                      router.push(`/notes/${encodeNotePath(key)}`)
                    }
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground">
                        {key}
                      </span>
                      <span className="font-medium">
                        {highlight(toText(r), searchContent)}
                      </span>
                    </div>
                  </CommandItem>
                ));
              })}
            </CommandGroup>
          )}
          <CommandSeparator />
          {searchResult?.tagResult.length > 0 && (
            <CommandGroup heading="Tags">
              {searchResult?.tagResult.map((e: string, idx: number) => (
                <CommandItem
                  key={`tag-${e}-${idx}`}
                  onSelect={() => router.push(`/notes/${encodeNotePath(e)}`)}
                >
                  <span>{e}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
