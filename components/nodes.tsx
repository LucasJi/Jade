import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Group, Vector3 } from 'three';
import { Line, PostMap } from '@types';
import { useFrame, useThree } from '@react-three/fiber';
import { QuadraticBezierLine } from '@react-three/drei';
import { Circle, Node } from './index';
import { Line2 } from 'three-stdlib';
import useStarryStore from '@store';
import httpClient from '@utils/axios';
import { AxiosResponse } from 'axios';
import { directSamplingInCircle } from '@utils/graphUtil';

const Nodes = () => {
  const lineGroupRef = useRef<Group>(null);
  const { size } = useThree();
  const { nodeMap, postMap, initPostMap } = useStarryStore();

  useEffect(() => {
    httpClient.post('api/getPostMap').then((res: AxiosResponse<PostMap>) => {
      const { data } = res;

      Object.keys(data).forEach(key => {
        const value = data[key];
        const randomCoordinate = directSamplingInCircle(
          Math.min(size.height, size.width),
          0,
          0,
        );
      });

      initPostMap(data);
    });
  }, []);

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
          <group
            key={`${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`}
          >
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
        <group
          key={`${start.x},${start.y},${start.z}-${end.x},${end.y},${end.z}`}
          position-z={1}
        >
          <Circle position={start} />
          <Circle position={end} />
        </group>
      ))}
    </Fragment>
  );
};

export default Nodes;
