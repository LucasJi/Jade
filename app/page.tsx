'use client';

import React, { Suspense } from 'react';
import { Post } from '@types';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import useSWR from 'swr';
import fetcher from '@api/fetcher';
import Loading from './loading';

export default function Home() {
  const { data } = useSWR<Post[]>('api/posts', fetcher, {
    suspense: true,
    fallbackData: [],
  });

  return (
    <div className="flex flex-col">
      <Suspense fallback={<Loading />}>
        {data?.map(({ wikilink, title, href, content }) => (
          <Card key={wikilink}>
            <CardHeader>{title}</CardHeader>
            <CardBody>{content}</CardBody>
          </Card>
        ))}
      </Suspense>
    </div>
  );
}
