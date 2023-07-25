import useStore from '@store';
import { Fragment, useMemo, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { Line } from '@types';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import { Circle, Node } from './index';
import { Line2 } from 'three-stdlib';

const Nodes = () => {
  const { nodeMap } = useStore();

  const lineGroupRef = useRef<Group>(null);

  const lines = useMemo(() => {
    const lines: Line[] = [];

    Object.keys(nodeMap).forEach(name => {
      const node = nodeMap[name];
      const connectedTo = node.connectedTo.map(
        connectedToName => nodeMap[connectedToName].position,
      );

      connectedTo.forEach(target => {
        lines.push({
          start: node.position.clone().add(new Vector3(0.35, 0, 0)),
          end: target.clone().add(new Vector3(-0.35, 0, 0)),
        });
      });
    });

    return lines;
  }, [nodeMap]);

  console.log('graph renders - lines:', lines);

  useFrame((_, delta) => {
    if (lineGroupRef.current) {
      lineGroupRef.current.children.forEach(group => {
        (group.children[0] as Line2).material.uniforms.dashOffset.value -=
          delta * 10;
      });
    }
  });

  return (
    <Fragment>
      <group ref={lineGroupRef}>
        {lines.map(({ start, end }) => (
          <group key={`${start}-${end}`}>
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
      {Object.keys(nodeMap).map(name => {
        const node = nodeMap[name];
        const connectedTo = node.connectedTo.map(
          connectedToName => nodeMap[connectedToName].position,
        );
        return (
          <Node
            color={node.color}
            connectedTo={connectedTo}
            key={name}
            name={name}
            position={node.position}
          />
        );
      })}
      {lines.map(({ start, end }) => (
        <group key={`${start}-${end}`} position-z={1}>
          <Circle position={start} />
          <Circle position={end} />
        </group>
      ))}
    </Fragment>
  );
};

export default Nodes;
