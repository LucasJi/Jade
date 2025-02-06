'use client';

import { getNoteVaultPathByRoutePath } from '@/app/api';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { getRoutePathFromURIComponentSlug } from '@/lib/note';
import { useParams } from 'next/navigation';
import { FC, Fragment, useEffect, useState } from 'react';

const SidebarRouter: FC = () => {
  const { slug } = useParams<{ slug: string[] }>();
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    const noteRoutePath = slug ? getRoutePathFromURIComponentSlug(slug) : '';
    getNoteVaultPathByRoutePath(noteRoutePath).then(resp => {
      setPaths(resp.data.split('/'));
    });
  }, [slug]);

  if (!slug) {
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
