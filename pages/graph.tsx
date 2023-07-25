import { Canvas } from '@react-three/fiber';
import { Circle, Node } from '@components';
import { Vector3 } from 'three';
import { Fragment, useMemo } from 'react';
import { QuadraticBezierLine } from '@react-three/drei';
import useStore from '@store';
import { Line } from '@types';

export default function Graph() {
  const { nodes } = useStore();
  const lines = useMemo(() => {
    const lines: Line[] = [];
    for (const node of nodes) {
      node.connectedTo
        .map(target => [node.position, target])
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

  console.log('graph renders - lines:', lines);

  return (
    <Canvas
      camera={{ zoom: 80 }}
      className="bg-[#151520] w-[500px] h-[500px] m-auto"
      orthographic
    >
      <group>
        {lines.map(({ start, end }) => (
          <Fragment key={`${start}-${end}`}>
            <group>
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
            <group position-z={1}>
              <Circle position={start} />
              <Circle position={end} />
            </group>
          </Fragment>
        ))}
      </group>
      {/*<Nodes>*/}
      {nodes.map(node => (
        <Node
          color={node.color}
          connectedTo={node.connectedTo}
          key={node.name}
          name={node.name}
          position={node.position}
        />
      ))}
      {/*</Nodes>*/}
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
