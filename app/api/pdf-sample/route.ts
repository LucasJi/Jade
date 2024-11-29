import fs from 'fs';
import { NextRequest } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
  // 指定 PDF 文件路径（位于 public 目录中）
  const pdfPath = path.join(process.cwd(), 'public', 'sample.pdf');

  // 检查文件是否存在
  if (!fs.existsSync(pdfPath)) {
    return new Response('File not found', { status: 404 });
  }

  // 读取 PDF 文件内容
  const fileBuffer = fs.readFileSync(pdfPath);

  // 返回 PDF 文件内容
  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="file.pdf"',
    },
  });
}
