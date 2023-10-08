import BambooSlip from '@components/bambooSlip';
import { Slug } from '@types';
import { getCachedSlugs, getPostBySlug } from '@utils/postUtil';

export default async function Post({ params }: { params: { slug: Slug } }) {
  const post = getPostBySlug(params.slug);
  if (!post) {
    return <div>POST NOT FOUND</div>;
  }
  return <BambooSlip post={post} />;
}

export async function generateStaticParams() {
  return await getCachedSlugs();
}
