'use client';

import fetcher from '@api/fetcher';
import LgSpinnerInCenter from '@components/LgSpinnerInCenter';
import Markdown from '@components/Markdown';
import { Card, CardBody, CardFooter } from '@nextui-org/card';
import { Post } from '@types';
import React from 'react';
import { AiOutlineComment } from 'react-icons/ai';
import { RxClock, RxShare1 } from 'react-icons/rx';
import useSWR from 'swr';

function Posts() {
  const { data, isLoading } = useSWR<Post[]>('api/posts', fetcher);

  if (isLoading) {
    return <LgSpinnerInCenter />;
  }

  return (
    <div className="gap-2 grid grid-cols-12 grid-rows-2 py-8">
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
    </div>
  );
}

export default Posts;
