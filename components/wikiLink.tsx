import { omit } from 'lodash';
import { useEffect, useState } from 'react';
import httpClient from '@utils/axios';
import { AxiosResponse } from 'axios';
import { Post } from '@utils/typeUtil';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import * as Popover from '@radix-ui/react-popover';

export default function WikiLink(
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) {
  const [content, setContent] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [slug, setSlug] = useState<string[]>([]);

  useEffect(() => {
    console.log('useEffect - resolve slug from href');

    let { href = '' } = props;
    href = href.replace('/', '');
    setSlug([...href.split('/')]);
  }, [props.href]);

  useEffect(() => {
    console.log('useEffect - request postContent through slug', slug);

    httpClient.post('api/post', { slug }).then((res: AxiosResponse<Post>) => {
      console.log('api/post response data', res.data);
      setContent(res.data.content);
    });
  }, [slug]);

  const { href } = props;
  const wikilink = '/posts' + href;
  const omittedProps = omit(props, ['className', 'href']);

  return (
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger
        asChild
        onMouseEnter={() => {
          setOpen(true);
        }}
        onMouseLeave={() => {
          setOpen(false);
        }}
      >
        <button
          onClick={e => {
            console.log('on click');
            // prevent displaying content by clicking the button
            // only display the content by mouse enter event
            e.preventDefault();

            httpClient
              .post('api/post', { slug })
              .then((res: AxiosResponse<Post>) => {
                console.log('post content by click wikilink', res.data);
              });
          }}
        >
          {wikilink}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-green-100 border-black h-60 w-60 text-ellipsis"
          side="right"
          sideOffset={50}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
