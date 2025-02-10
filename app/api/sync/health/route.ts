export async function GET() {
  return Response.json({
    data: true,
    msg: 'You Jade service is available',
  });
}
