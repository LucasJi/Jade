import { Divider, Link } from '@nextui-org/react';
import { RxGithubLogo } from 'react-icons/rx';

const Footer = () => {
  return (
    <footer className="w-3/5 mx-auto flex flex-col items-center h-[100px]">
      <Divider className="my-4" />
      <div className="w-full flex h-16 justify-between">
        <div className="flex flex-col">
          <span>Galaxy Blog</span>
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
