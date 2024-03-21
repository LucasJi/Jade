import ForceDirectedGraph from '@components/ForceDirectedGraph';
import { PostGraph } from '@types';
import Slugger from 'github-slugger';

export default async function Home() {
  const postGraphResp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/graph`,
    {
      method: 'GET',
    },
  );
  const postGraph: PostGraph = await postGraphResp.json();

  const slugs = new Slugger();

  return (
    <div className="flex w-full justify-center">
      <ForceDirectedGraph postGraph={postGraph} />
      <div>{slugs.slug('some folder/some post.md')}</div>
      <div>{slugs.slug('some folder/some post.md')}</div>
      <div>{slugs.slug('some folder/some post.md')}</div>
    </div>
  );
}
