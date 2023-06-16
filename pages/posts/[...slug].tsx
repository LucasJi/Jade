import { BambooSlip } from '@components';
import { getCachedPostBySlug, getCachedSlugs } from '@utils/postUtil';
import { Post, Slug } from 'types';

type PathParamsType = {
  params: {
    slug: Slug;
    content: string;
  };
};

type PropsType = {
  post: Post;
};

export default function PostPage({ post }: PropsType) {
  return <BambooSlip post={post} />;
}

export async function getStaticProps({ params }: PathParamsType) {
  const slug: Slug = params.slug;

  const post = await getCachedPostBySlug(slug);

  return {
    props: {
      post,
    },
  };
}

export async function getStaticPaths() {
  const slugs = await getCachedSlugs();

  const staticPaths = {
    paths: slugs.map(slug => {
      return {
        params: {
          slug,
        },
      };
    }),
    fallback: false,
  };

  return staticPaths;
}
