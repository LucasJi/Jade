import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  let res: NextResponse = NextResponse.next();

  if (req.method !== 'OPTIONS') {
    const authentication = req.headers.get('authentication');

    if (!authentication) {
      res = NextResponse.json(null, { status: 401 });
    }
  }

  return cors(res);
}

const cors = (res: NextResponse) => {
  res.headers.append('Access-Control-Allow-Origin', 'app://obsidian.md'); // replace this your actual origin
  res.headers.append('Access-Control-Allow-Methods', 'GET,POST');
  res.headers.append(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authentication',
  );
  return res;
};

export const config = {
  matcher: '/api/sync/:path*',
};
