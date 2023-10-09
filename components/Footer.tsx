'use client';
import { Divider } from '@nextui-org/react';
import githubIcon from '@public/icons8-github.svg';
import Image from 'next/image';
import Link from 'next/link';

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
          />
          <span className="font-extralight">©2023 Created by Lucas Ji</span>
        </div>
        <div>
          <Link
            href="https://github.com/LucasJi"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image src={githubIcon} height={32} width={32} alt="GithubIcon" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
