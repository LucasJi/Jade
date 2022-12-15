import Image from 'next/image';
import avatar from '../public/avatar.png';

export default function Avatar() {
  return (
    <div className="w-36 h-36 mx-auto mt-32">
      <Image src={avatar} alt="avatar" width={144} height={144} priority />
    </div>
  );
}
