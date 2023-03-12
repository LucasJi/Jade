import Image from 'next/image';
import avatar from '@public/avatar.png';

export default function Avatar() {
  return (
    <div className="w-36 h-36 mx-auto mt-32">
      <Image alt="avatar" height={144} priority src={avatar} width={144} />
    </div>
  );
}
