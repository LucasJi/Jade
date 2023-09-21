'use client';
import { Divider } from '@nextui-org/react';
import { FiGithub } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="flex flex-col justify-center w-full items-center absolute bottom-0">
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
          <span>©2023 Created by Lucas Ji</span>
        </div>
        <div>
          <Link
            href="https://github.com/LucasJi"
            rel="noopener noreferrer"
            target="_blank"
          >
            <FiGithub size={22} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
