import { Avatar, Slogan } from '@components';
import Head from 'next/head';
import React, { useRef, useState } from 'react';
import { Mesh } from 'three';
import { Canvas, ThreeElements, useFrame } from '@react-three/fiber';

function Box(props: ThreeElements['mesh']) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ref = useRef<Mesh>(null!);
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useFrame((state, delta) => {
    ref.current.rotation.x += delta;
    ref.current.rotation.y += delta;
  });
  return (
    <mesh
      {...props}
      onClick={() => click(!clicked)}
      onPointerOut={() => hover(false)}
      onPointerOver={() => hover(true)}
      ref={ref}
      scale={clicked ? 2 : 1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

function Lines() {
  return <div></div>;
}

export default function Home() {
  return (
    <div className="flex-col">
      <Head>
        <title>{"Lucas Ji's Blog"}</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <Avatar className="self-center" />
      <Slogan className="mt-8 text-center self-center" />

      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
      </Canvas>
    </div>
  );
}
