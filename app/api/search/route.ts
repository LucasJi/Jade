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
  const query = trim(content)
    .split(' ')
    .map(c => `${c}|*${c}*|%${c}%`)
    .join('|');

  log.info({ query }, 'Searching with content...');

  try {
    const rsResult = await redis.ft.search(RK.IDX_HAST_CHILD, `${query}`, {
      LANGUAGE: RedisSearchLanguages.CHINESE,
    });

    const result: Record<string, any[]> = {};
    const { documents } = rsResult;

    if (documents.length <= 0) {
      return NextResponse.json(null);
    }

    const sortedDocs = sortBy(documents, ['id']);
    for (const doc of sortedDocs) {
      const { id, value } = doc;
      const path = trimStart(id, RK.HAST_CHILD).split(':')[0];

      if (path in result) {
        const results = result[path];
        results?.push({ ...value });
      } else {
        result[path] = [{ ...value }];
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    log.error('Error occurs when searching...', e);
    return NextResponse.json(null);
  }
}
