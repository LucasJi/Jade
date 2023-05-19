import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react';
import { omit } from 'lodash';
import { useEffect, useState } from 'react';
import httpClient from '@utils/axios';
import { AxiosResponse } from 'axios';
import { Post } from '@utils/postUtil';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export default function WikiLink(
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) {
  const { isOpen, onClose, onOpen } = useDisclosure();
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
    <Popover
      closeOnBlur={false}
      isLazy
      isOpen={isOpen}
      onClose={onClose}
      onOpen={onOpen}
      placement="auto"
      returnFocusOnClose={false}
    >
      <PopoverTrigger>
        <div
          className="underline decoration-pink-300"
          // href={href}
          // {...omittedProps}
          onMouseEnter={() => {
            onOpen();
          }}
          onMouseLeave={() => {
            onClose();
          }}
        >
          {href}
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>
          <ReactMarkdown>{content}</ReactMarkdown>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
