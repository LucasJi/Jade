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
import { usePathname } from 'next/navigation';

const navbarItems = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Posts',
    href: '/posts',
  },
  {
    name: 'Tags',
    href: '#',
  },
];

export default function BlogNavbar() {
  const pathname = usePathname();

  const getUnderlineProp = (href: string) => {
    if (href === '/') {
      return pathname === '/' ? 'always' : 'hover';
    }

    return pathname.includes(href) ? 'always' : 'hover';
  };

  return (
    <Navbar shouldHideOnScroll>
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
        {navbarItems.map(item => (
          <NavbarItem key={item.name}>
            <Link
              color="foreground"
              href={item.href}
              underline={getUnderlineProp(item.href)}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
    </Navbar>
  );
}
