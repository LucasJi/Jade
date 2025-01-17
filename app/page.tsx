import { getHome, getNotePaths } from '@/app/api';
import Markdown from '@/components/markdown';

export default async function Home() {
  const home = await getHome();

  if (home === null) {
    // TODO: Show all note when there is no home page note configured.
    return <div>Home page note is not configured</div>;
  }

  const { hast, origin } = home;

  const paths = await getNotePaths();
  return (
    <Markdown
      hast={hast}
      origin={origin}
      className="w-full"
      notePaths={paths}
    />
  );
}
