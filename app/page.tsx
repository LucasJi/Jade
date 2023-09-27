'use client';

import fetcher from '@api/fetcher';
import Markdown from '@components/Markdown';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import { Post } from '@types';
import React, { Suspense } from 'react';
import { AiOutlineComment } from 'react-icons/ai';
import { RxClock, RxShare1 } from 'react-icons/rx';
import useSWR from 'swr';
import Loading from './loading';

export default function Home() {
  const { data } = useSWR<Post[]>('api/posts', fetcher, {
    suspense: true,
    fallbackData: [],
  });

  return (
    <div className="gap-2 grid grid-cols-12 grid-rows-2 py-8">
      <Suspense fallback={<Loading />}>
        {data?.map(({ wikilink, href, content }) => (
          <Card className="col-span-12 sm:col-span-4" key={wikilink}>
            <CardBody className="font-light">
              <Markdown markdown={content} titleLink={href} />
            </CardBody>
            <CardFooter className="text-small">
              <RxClock />
              <AiOutlineComment />
              <RxShare1 />
            </CardFooter>
          </Card>
        ))}
      </Suspense>
    </div>
  );
}
