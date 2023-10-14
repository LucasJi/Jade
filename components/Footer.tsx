'use client';
import { Divider, Link } from '@nextui-org/react';
import Image from 'next/image';
import { RxGithubLogo } from 'react-icons/rx';

const Footer = () => {
  return (
    <footer className="max-w-[1024px] mx-auto flex flex-col justify-center w-full items-center">
      <Divider className="my-4" />
      <div className="flex h-16 w-full justify-between">
        <div>
          <Image
            alt="logo-text"
            height={0}
            loading="eager"
            src="/logo-text.png"
            style={{ width: '60%', height: 'auto' }}
            width={200}
            priority
          />
          <span className="font-extralight">©2023 Created by Lucas Ji</span>
        </div>
        <div>
          <Link href="https://github.com/LucasJi" isExternal color="foreground">
            <RxGithubLogo size={22} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
