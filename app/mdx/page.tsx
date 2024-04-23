import { readFileSync } from 'fs';
import { MDXRemote } from 'next-mdx-remote/rsc';

export default async function Page() {
  const filepath = '_posts/Aliases/Add an alias to a note.md';
  const post = readFileSync(filepath);

  return <MDXRemote source={post} />;
}
