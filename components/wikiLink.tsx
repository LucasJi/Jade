import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react';
import { omit } from 'lodash';
import { useEffect } from 'react';
import httpClient from '@utils/axios';

export default function WikiLink(
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) {
  const { isOpen, onClose, onOpen } = useDisclosure();
  useEffect(() => {
    let { href } = props;
    href = href?.replace('/', '');
    const data = { slug: href?.split('/') };
    httpClient.post('api/post', data);
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
        <a
          className="underline decoration-pink-300"
          href={href}
          {...omittedProps}
          onMouseEnter={() => {
            onOpen();
          }}
          onMouseLeave={() => {
            onClose();
          }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody>Popover Content</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
