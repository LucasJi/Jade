import Typewriter from 'typewriter-effect';

export default function Slogan() {
  return (
    <Typewriter
      onInit={typewriter => {
        typewriter
          .typeString('Hi, I am a full stack developer!')
          .pauseFor(1500)
          .deleteAll()
          .typeString('My name is Lucas Ji.')
          .pauseFor(1500)
          .deleteAll()
          .typeString('Welcome to my digital garden!')
          .start();
      }}
    />
  );
}
