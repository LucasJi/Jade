'use client';
import { search } from '@/app/api';
import SimpleMarkdown from '@/components/simple-md';
import { Input } from '@/components/ui/input';
import { Nodes } from 'hast';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchResult {
  id: string;
  value: Nodes;
}

export function SearchDemo() {
  const [searchResult, setSearchResult] = useState<SearchResult[]>([]);
  const [searchContent, setSearchContent] = useState('');

  useEffect(() => {
    if (!searchContent) {
      setSearchResult([]);
      return () => {};
    }

    const delayDebounceFn = setTimeout(async () => {
      const data = await search(searchContent);
      console.log('search result:', data);
      setSearchResult(data.documents);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchContent]);

  return (
    <div className="w-[450px] rounded-lg border shadow-md">
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="relative flex items-center">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8"
              onChange={e => setSearchContent(e.currentTarget.value)}
            />
          </div>
        </form>
      </div>

      {searchResult.map((result, idx) => (
        <div key={idx}>
          <SimpleMarkdown hast={result.value} />
        </div>
      ))}
    </div>
  );
}
