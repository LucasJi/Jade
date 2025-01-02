import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { sortBy, trim, trimStart } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import { RedisSearchLanguages } from 'redis';

const log = logger.child({
  module: 'api',
  route: 'api/search',
});

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const content = searchParams.get('content') || '';
  const contentQuery = trim(content)
    .split(' ')
    .map(c => `${c}|*${c}*|%${c}%`)
    .join('|');

  let tagQuery = trim(content)
    .split(' ')
    .map(c => `${c}|*${c}*`)
    .join('|');
  tagQuery = `@tag:{${tagQuery}}`;

  log.info({ contentQuery, tagQuery }, 'Searching with content...');

  try {
    const contentSearchResult = await redis.ft.search(
      RK.IDX_HAST_CHILD,
      `${contentQuery}`,
      {
        LANGUAGE: RedisSearchLanguages.CHINESE,
      },
    );

    let noteResult: Record<any, any> | null = null;
    if (contentSearchResult.documents.length > 0) {
      noteResult = {};
      const sortedDocs = sortBy(contentSearchResult.documents, ['id']);
      for (const doc of sortedDocs) {
        const { id, value } = doc;
        const path = trimStart(id, RK.HAST_CHILD).split(':')[0];

        if (path in noteResult) {
          const results = noteResult[path];
          results?.push({ ...value });
        } else {
          noteResult[path] = [{ ...value }];
        }
      }
    }

    const tagSearchResult = await redis.ft.search(
      RK.IDX_FRONT_MATTER,
      `${tagQuery}`,
      {
        LANGUAGE: RedisSearchLanguages.CHINESE,
      },
    );
    const tagResult = tagSearchResult.documents.map(d =>
      trimStart(d.id, RK.FRONT_MATTER),
    );

    return NextResponse.json({
      noteResult,
      tagResult,
    });
  } catch (e) {
    log.error('Error occurs when searching...', e);
    return NextResponse.json(null);
  }
}
