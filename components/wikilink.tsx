import { useEffect, useState } from 'react';
import httpClient from '@utils/axios';
import { AxiosResponse } from 'axios';
import { Post } from '@utils/typeUtil';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import * as Popover from '@radix-ui/react-popover';

export default function Wikilink({
  href = '',
  onClick,
}: {
  href: string | undefined;
  onClick: (post: Post) => void;
}) {
  const [content, setContent] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [slug, setSlug] = useState<string[]>([]);

  useEffect(() => {
    let postRelativePath = href;
    if (href.startsWith('/')) {
      postRelativePath = href.replace('/', '');
    }
    setSlug([...postRelativePath.split('/')]);
  }, [href]);

  useEffect(() => {
    httpClient.post('api/post', { slug }).then((res: AxiosResponse<Post>) => {
      setContent(res.data.content);
    });
  }, [slug]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // prevent displaying content by clicking the button
    // only display the content by mouse enter event
    e.preventDefault();

    httpClient.post('api/post', { slug }).then((res: AxiosResponse<Post>) => {
      const post = res.data;
      onClick(post);
    });
  };

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
        <button onClick={e => handleClick(e)}>{href}</button>
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
