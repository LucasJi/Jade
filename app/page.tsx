import Avatar from '@components/avatar';
import Slogan from '@components/slogan';
import React from 'react';

export default function Home() {
  return (
    <div className="flex-col">
      <Avatar className="self-center" />
      <Slogan className="mt-8 text-center self-center" />
    </div>
  );
}
