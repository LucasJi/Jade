import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react';
import { omit } from 'lodash';

export default function WikiLink(
  props: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >,
) {
  const { isOpen, onClose, onOpen } = useDisclosure();

  console.log('WikiLink props:', props);

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
            console.log('onMouseEnter');
            onOpen();
          }}
          onMouseLeave={() => {
            console.log('onMouseLeave');
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
