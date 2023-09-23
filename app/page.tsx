'use client';

import React, { Suspense } from 'react';
import { Post } from '@types';
import { Card, CardBody, CardFooter, CardHeader } from '@nextui-org/card';
import useSWR from 'swr';
import fetcher from '@api/fetcher';
import Loading from './loading';
import { RxClock, RxShare1 } from 'react-icons/rx';
import { AiOutlineComment } from 'react-icons/ai';
import Link from 'next/link';

export default function Home() {
  const { data } = useSWR<Post[]>('api/posts', fetcher, {
    suspense: true,
    fallbackData: [],
  });

  console.log(data);

  return (
    <div className="gap-2 grid grid-cols-12 grid-rows-2 py-8">
      <Suspense fallback={<Loading />}>
        {data?.map(({ wikilink, title, href, content }) => (
          <Card className="col-span-12 sm:col-span-4" key={wikilink}>
            <CardHeader className="text-lg font-bold">
              <Link href={href}>{title}</Link>
            </CardHeader>
            <CardBody className="font-light">{content}</CardBody>
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
