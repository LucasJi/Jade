'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { FC, Fragment, useEffect, useState } from 'react';

const SidebarRouter: FC = () => {
  const [paths, setPaths] = useState<string[]>([]);
  const { vaultPath } = useSidebar();

  console.log('router:', vaultPath);

  useEffect(() => {
    if (vaultPath) {
      setPaths(vaultPath.split('/'));
    }
  }, [vaultPath]);

  if (!vaultPath) {
    return <div />;
  }

  return (
    <>
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {paths.map((p, idx) => (
            <Fragment key={p}>
              <BreadcrumbItem className="hidden md:block">{p}</BreadcrumbItem>
              {idx < paths.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};

export default SidebarRouter;
