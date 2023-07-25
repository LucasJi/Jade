import { createRef, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Circle, Node } from '@components';
import { Group, Object3D, Vector3 } from 'three';
import { NodePosProps } from '@types';
import { QuadraticBezierLine } from '@react-three/drei';

export default function Graph() {
  const group = useRef<Group>(null);
  const [nodes, set] = useState<NodePosProps[]>([]);
  const [[a, b, c, d, e]] = useState(() =>
    [...Array(5)].map(createRef<Object3D>),
  );

  const lines = useMemo(() => {
    const lines: {
      start: Vector3;
      end: Vector3;
    }[] = [];
    for (const node of nodes) {
      node.connectedTo
        .map(ref => [node.position, ref.current?.position])
        .forEach(([start, end]) => {
          if (start && end) {
            lines.push({
              start: start.clone().add(new Vector3(0.35, 0, 0)),
              end: end.clone().add(new Vector3(-0.35, 0, 0)),
            });
          }
        });
    }
    return lines;
  }, [nodes]);

  // useFrame((_, delta) =>
  //   group.current.children.forEach(
  //     group =>
  //       (group.children[0].material.uniforms.dashOffset.value -= delta * 10),
  //   ),
  // );

  return (
    <Canvas
      camera={{ zoom: 80 }}
      className="bg-[#151520] w-[500px] h-[500px] m-auto"
      orthographic
    >
      <>
        <group ref={group}>
          {lines.map(({ start, end }) => (
            <group key={Math.random()}>
              <QuadraticBezierLine
                color="white"
                dashed
                dashScale={50}
                end={end}
                gapSize={20}
                start={start}
              />
              <QuadraticBezierLine
                color="white"
                end={end}
                lineWidth={0.5}
                opacity={0.1}
                start={start}
                transparent
              />
            </group>
          ))}
        </group>
        <Node
          color="#204090"
          connectedTo={[b]}
          name="a"
          position={new Vector3(0, 0, 0)}
          ref={a}
          set={set}
        />
        <Node
          color="#904020"
          name="b"
          position={new Vector3(2, -3, 0)}
          ref={b}
          set={set}
        />
        {lines.map(({ start, end }, index) => (
          <group key={index} position-z={1}>
            <Circle position={start} />
            <Circle position={end} />
          </group>
        ))}
      </>
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
