import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { trim } from 'lodash';
import { NextRequest, NextResponse } from 'next/server';
import { RedisSearchLanguages } from 'redis';

const log = logger.child({
  module: 'api',
  route: 'api/search',
});

const redis = await createRedisClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  let content = searchParams.get('content') || '';
  content = trim(content)
    .split(' ')
    .map(c => `${c}|*${c}*|%${c}%`)
    .join('|');

  log.info({ content }, 'Searching with content...');

  try {
    const result = await redis.ft.search('jade:idx:hChld', `${content}`, {
      LANGUAGE: RedisSearchLanguages.CHINESE,
    });
    return NextResponse.json(result);
  } catch (e) {
    log.error('Error occurs when searching...', e);
    return NextResponse.json({
      total: 0,
      documents: [],
    });
  }
}
