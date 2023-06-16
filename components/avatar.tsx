import Image from 'next/image';
import avatar from '@public/avatar.png';
import classNames from 'classnames';

export default function Avatar({ className }: { className?: string }) {
  return (
    <div className={classNames('w-36', 'h-36', 'mx-auto', 'mt-32', className)}>
      <Image alt="avatar" height={144} priority src={avatar} width={144} />
    </div>
  );
}
