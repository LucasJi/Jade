import { encodeNotePath, listExistedObjs } from '@/lib/note';
import { S3 } from '@/lib/server/s3';
import type { MetadataRoute } from 'next';

const s3 = new S3();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const objs = listExistedObjs(await s3.listObjectVersions());
  const result = [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      lastModified: new Date(),
    },
  ];
  const notePages = objs.map(obj => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/notes/${encodeNotePath(
      obj.path,
    )}`,
    lastModified: obj.lastModified!,
  }));
  result.push(...notePages);
  return result;
}
