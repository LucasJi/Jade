'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  decodeNotePath,
  getEncodedNotePathFromURIComponentSlug,
} from '@/lib/note';
import { useParams } from 'next/navigation';
import { FC, Fragment } from 'react';

const SidebarRouter: FC = () => {
  const { slug } = useParams<{ slug: string[] }>();

  if (!slug) {
    return <div />;
  }

  const currentNotePath = slug
    ? getEncodedNotePathFromURIComponentSlug(slug)
    : '';
  const decodedNotePath = decodeNotePath(currentNotePath);
  const paths = decodedNotePath.split('/');
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
