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
import { ComponentProps } from 'react';

export function SearchForm({ ...props }: ComponentProps<'form'>) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the notes..."
            className="pl-8"
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-2 top-1/2 size-4 -translate-y-1/2 cursor-pointer select-none opacity-50',
            )}
            onClick={e => {
              e.preventDefault();
              console.log('clear search content');
            }}
          >
            <X />
          </Button>
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
