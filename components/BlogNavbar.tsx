'use client';
import {
  Avatar,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from '@nextui-org/react';
import Image from 'next/image';

export default function BlogNavbar() {
  return (
    <Navbar>
      <NavbarBrand>
        <Avatar
          icon={
            <Image
              alt="avatar"
              height={40}
              loading="eager"
              src="/avatar.png"
              width={40}
            />
          }
        />
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="end">
        <NavbarItem>
          <Link color="foreground" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/posts">
            Posts
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Tags
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Follow
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
