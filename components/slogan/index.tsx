import classNames from 'classnames';
import Typewriter from 'typewriter-effect';
import styles from './slogan.module.scss';

export default function Slogan({ className }: { className?: string }) {
  return (
    <div>
      You are more than what you have become!
      <Typewriter
        onInit={(typewriter) => {
          typewriter
            .typeString('Hi, I am a full stack developer!')
            .callFunction(() => {
              console.log('String typed out!');
            })
            .pauseFor(2500)
            .deleteAll()
            .callFunction(() => {
              console.log('All strings were deleted');
            })
            .typeString('My name is Lucas Ji.')
            .pauseFor(2000)
            .deleteAll()
            .typeString('Welcome to my digital garden!')
            .start();
        }}
      />
    </div>
  );
}
