'use client';
import { Divider } from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { RxGithubLogo } from 'react-icons/rx';

const Footer = () => {
  return (
    <footer className="flex flex-col justify-center w-full items-center">
      <Divider className="my-4" />
      <div className="flex h-16 w-full justify-between">
        <div>
          <Image
            alt="logo-text"
            height={120}
            loading="eager"
            src="/logo-text.png"
            width={200}
          />
          <span className="font-extralight">©2023 Created by Lucas Ji</span>
        </div>
        <div>
          <Link
            href="https://github.com/LucasJi"
            rel="noopener noreferrer"
            target="_blank"
          >
            <RxGithubLogo size={22} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
