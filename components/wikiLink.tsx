import { omit } from 'lodash';
import { useEffect, useState } from 'react';
import httpClient from '@utils/axios';
import { AxiosResponse } from 'axios';
import { Post } from '@utils/postUtil';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import * as Popover from '@radix-ui/react-popover';

export default function WikiLink(
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    let { href } = props;
    href = href?.replace('/', '');
    const data = { slug: href?.split('/') };

    httpClient.post('api/post', data).then((res: AxiosResponse<Post>) => {
      console.log('api/post response data', res.data);
      setContent(res.data.content);
    });
  }, [props.href]);

  let { href } = props;
  href = '/posts' + href;
  const omittedProps = omit(props, ['className', 'href']);
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button>{href}</button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="bg-green-100 border-black h-80 w-80 text-ellipsis">
          <ReactMarkdown>{content}</ReactMarkdown>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
