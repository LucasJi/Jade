'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar';
import { cn } from '@/components/utils';
import { Search, X } from 'lucide-react';
import { ComponentProps, useState } from 'react';

export function SearchInput({ ...props }: ComponentProps<typeof SidebarGroup>) {
  const [content, setContent] = useState('');
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
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              console.log('On press Enter');
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
            console.log('clear search content');
            setContent('');
          }}
        >
          <X />
        </Button>
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
