import EmbedFile from '@/components/embed-file';
import Markdown from '@/components/markdown';
import { RK } from '@/lib/constants';
import { getExt } from '@/lib/file';
import { logger } from '@/lib/logger';
import { decodeURISlug, getRoutePathFromSlug } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { Nodes } from 'hast';
import { notFound } from 'next/navigation';

export const dynamicParams = true;
export const dynamic = 'force-static';

const log = logger.child({
  module: 'app/notes/[...slug]',
});

export async function generateStaticParams() {
  return [];
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;

  const { slug: uriSlug } = params;
  const slug = decodeURISlug(uriSlug);
  const redis = await createRedisClient();

  try {
    const routePath = getRoutePathFromSlug(slug);
    const vaultPath = await redis.get(`${RK.PATH_MAPPING}${routePath}`);

    if (!vaultPath) {
      log.error(`Failed to get vault path from route path: ${routePath}`);
      notFound();
    }

    const ext = getExt(vaultPath);

    log.info(
      {
        vaultPath,
      },
      `Rendering page...`,
    );

    if (ext !== 'md') {
      return (
        <div className="flex w-full justify-center">
          <EmbedFile path={vaultPath} />
        </div>
      );
    }

    const hast = (await redis.json.get(
      `${RK.HAST}${vaultPath}`,
    )) as unknown as Nodes;

    log.info(
      {
        vaultPath,
      },
      'Get hast of page',
    );

    if (!hast) {
      log.info(
        {
          vaultPath,
        },
        'Page hast not found',
      );
      notFound();
    }

    const vaultPaths = await redis.sMembers(RK.PATHS);

    return (
      <Markdown
        hast={hast}
        origin={vaultPath}
        className="w-full"
        vaultPaths={vaultPaths}
      />
    );
  } catch (error) {
    log.error({ error, slug }, 'Error occurs when rendering page');
    notFound();
  }
}
