import { BambooSlip } from '@components';
import { getCachedPostBySlug, getCachedSlugs } from '@utils/postUtil';
import { Slug } from '@types';

export default async function Post({ params }: { params: { slug: Slug } }) {
  const post = await getCachedPostBySlug(params.slug);
  return <BambooSlip post={post} />;
}

export async function generateStaticParams() {
  return await getCachedSlugs();
}
