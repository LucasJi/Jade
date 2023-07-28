import { Canvas } from '@react-three/fiber';
import { Nodes } from '@components';
import useStarryStore from '@store';
import { useEffect } from 'react';
import httpClient from '@utils/axios';
import { Vector3 } from 'three';

const fibVal = [0, 1];
const fib = (n: number) => {
  const len = fibVal.length;

  if (n <= len - 1) {
    return fibVal[n];
  }

  for (let i = len; i <= n; i++) {
    fibVal.push(fibVal[i - 1] + fibVal[i - 2]);
  }
  return fibVal[n];
};

const postCount = 12;

for (let i = 1; i <= postCount; i++) {
  const len = fib(i) * 10;
  const x = len;
  const y = 0;

  const circleNumber = i;
  const baseAngle = Math.PI / 2;
  const angle = baseAngle / circleNumber;

  const pos = new Vector3(x, y, 0);
  const origin = new Vector3(0, 0, 0);
  if (i <= 3 && i > 2) {
    console.log(pos);
  } else if (i > 3) {
    for (let count = 1; count <= circleNumber - 3; count++) {
      const rotated = pos.clone().applyAxisAngle(origin, Math.PI / 4);
      const cX = x - len * Math.cos(angle * count);
      const cY = y + len * Math.sin(angle * count);
      console.log(rotated);
    }
  }
}

export default function Graph() {
  const { nodeMap, postMap, initPostMap } = useStarryStore();
  useEffect(() => {
    httpClient.post('api/getPostMap').then(res => {
      const { data } = res;
      initPostMap(data);
    });
  }, []);

  return (
    <Canvas
      camera={{ zoom: 80 }}
      className="bg-[#151520] w-[500px] h-[500px] m-auto"
      orthographic
    >
      <Nodes nodeMap={nodeMap} />
      {/*<Node*/}
      {/*  color="#204090"*/}
      {/*  connectedTo={[b, c, e]}*/}
      {/*  name="a"*/}
      {/*  position={[-2, 2, 0]}*/}
      {/*  ref={a}*/}
      {/*/>*/}
      {/*<Node*/}
      {/*  color="#904020"*/}
      {/*  connectedTo={[d, a]}*/}
      {/*  name="b"*/}
      {/*  position={[2, -3, 0]}*/}
      {/*  ref={b}*/}
      {/*/>*/}
      {/*<Node color="#209040" name="c" position={[-0.25, 0, 0]} ref={c} />*/}
      {/*<Node color="#204090" name="d" position={[0.5, -0.75, 0]} ref={d} />*/}
      {/*<Node color="#204090" name="e" position={[-0.5, -1, 0]} ref={e} />*/}
    </Canvas>
  );
}
