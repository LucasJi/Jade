import { createRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Node, Nodes } from '@components';

export default function Graph() {
  const [[a, b, c, d, e]] = useState(() => [...Array(5)].map(createRef));
  return (
    <Canvas camera={{ zoom: 80 }} className="bg-black" orthographic>
      <Nodes>
        <Node
          color="#204090"
          connectedTo={[b, c, e]}
          name="a"
          position={[-2, 2, 0]}
          ref={a}
        />
        <Node
          color="#904020"
          connectedTo={[d, a]}
          name="b"
          position={[2, -3, 0]}
          ref={b}
        />
        <Node color="#209040" name="c" position={[-0.25, 0, 0]} ref={c} />
        <Node color="#204090" name="d" position={[0.5, -0.75, 0]} ref={d} />
        <Node color="#204090" name="e" position={[-0.5, -1, 0]} ref={e} />
      </Nodes>
    </Canvas>
  );
}
