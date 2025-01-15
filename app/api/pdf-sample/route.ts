import fs from 'fs';
import path from 'path';

export async function GET() {
  const pdfPath = path.join(process.cwd(), 'public', 'sample.pdf');

  if (!fs.existsSync(pdfPath)) {
    return new Response('File not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(pdfPath);

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="file.pdf"',
    },
  });
}
