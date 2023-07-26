import { Canvas } from '@react-three/fiber';
import { Nodes } from '@components';
import useStarryStore from '@store';
import { useEffect } from 'react';
import httpClient from '@utils/axios';

export default function Graph() {
  const { nodeMap, postMap, initPostMap } = useStarryStore();
  useEffect(() => {
    httpClient.post('api/getPostMap').then(res => {
      const { data } = res;
      initPostMap(data);
    });
  }, []);

  console.log('postMap:', postMap);

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
