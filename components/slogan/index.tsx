import Typewriter from 'typewriter-effect';

export default function Slogan({ className }: { className: string }) {
  return (
    <div className={className}>
      <Typewriter
        onInit={typewriter => {
          typewriter
            .typeString('Hi, I am Lucas Ji. I am a full stack developer~')
            .pauseFor(1500)
            .deleteAll()
            .typeString('Welcome to my digital garden!')
            .pauseFor(1500)
            .start();
        }}
        options={{
          loop: true,
        }}
      />
    </div>
  );
}
