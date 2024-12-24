import config from '@/lib/config';
import { logger } from '@/lib/logger';

const log = logger.child({
  module: 'api',
  route: 'api/webhooks/minio',
});

const DELETE_EVENT = 's3:ObjectRemoved:Delete';
const CREATE_EVENT = 's3:ObjectCreated:Put';

/**
 * {
 *    "EventName":"s3:ObjectRemoved:DeleteMarkerCreated",
 *    "Key":"jade-docs/Remark 插件测试/remark-comment.md",
 *    "Records":[
 *       {
 *          "eventVersion":"2.0",
 *          "eventSource":"minio:s3",
 *          "awsRegion":"",
 *          "eventTime":"2024-10-15T06:51:11.299Z",
 *          "eventName":"s3:OtRemoved:DeleteMarkerCreated",
 *          "userIdentity":{
 *             "principalId":"admin"
 *          },
 *          "requestParameters":{
 *             "principalId":"admin",
 *             "region":"",
 *             "sourceIPAddress":"127.0.0.1"
 *          },
 *          "responseElements":{
 *             "content-length":"475",
 *             "x-amz-id-2":"dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8",
 *             "x-amz-request-id":"17FE8DAAB5285AEC",
 *             "x-minio-deployment-id":"9b38573c-4a63-4c62-9d0d-c567d4b2e19e",
 *             "x-minio-origin-endpoint":"http://172.20.12.41:9000"
 *          },
 *          "s3":{
 *             "s3SchemaVersion":"1.0",
 *             "configurationId":"Config",
 *             "bucket":{
 *                "name":"jade-docs",
 *                "ownerIdentity":{
 *                   "principalId":"admin"
 *                },
 *                "arn":"arn:aws:s3:::jade-docs"
 *             },
 *             "object":{
 *                "key":"Remark+%E6%8F%92%E4%BB%B6%E6%B5%8B%E8%AF%95%2Fremark-comment.md",
 *                "versionId":"7ead3921-78e0-441a-a939-c772d69c34a2",
 *                "sequencer":"17FE8DAAB64B78B4"
 *             }
 *          },
 *          "source":{
 *             "host":"127.0.0.1",
 *             "port":"",
 *             "userAgent":"MinIO (windows; amd64) minio-go/v7.0.77 MinIO Console/(dev)"
 *          }
 *       }
 *    ]
 * }
 * @param req
 * @constructor
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { Key, EventName } = body;
  const notePath = (Key as string).replace(config.s3.bucket + '/', '');
  log.info(
    {
      path: notePath,
      event: EventName,
    },
    'Minio Event',
  );
  return new Response('success', {
    status: 200,
  });
}
