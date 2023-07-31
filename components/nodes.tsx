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
import { generateRandomCoordinate, wcToDnc } from '@utils/graphUtil';

const Nodes = () => {
  const lineGroupRef = useRef<Group>(null);
  const { size, camera } = useThree();
  const { postMap, initPostMap } = useStarryStore();

  useEffect(() => {
    const radius = Math.min(size.width, size.height) / 2;
    httpClient.post('api/getPostMap').then((res: AxiosResponse<PostMap>) => {
      const { data } = res;

      Object.keys(data).forEach(key => {
        const value = data[key];
        const [x, y] = generateRandomCoordinate(size.width, size.height);
        value.position = new Vector3(x, y, 0);
      });

      initPostMap(data);
    });
  }, []);

  const lines = useMemo(() => {
    const lines: Line[] = [];

    Object.keys(postMap).forEach(name => {
      const post = postMap[name];
      const connectedTo = post.forwardWikilinks.map(
        wikilink => postMap[wikilink].position,
      );

      connectedTo.forEach(target => {
        lines.push({
          start: wcToDnc(camera, size, post.position).add(
            new Vector3(0.35, 0, 0),
          ),
          end: wcToDnc(camera, size, target).add(new Vector3(-0.35, 0, 0)),
        });
      });
    });

    return lines;
  }, [postMap]);

  useFrame((_, delta) => {
    if (lineGroupRef.current) {
      lineGroupRef.current.children.forEach(group => {
        (group.children[0] as Line2).material.uniforms.dashOffset.value -=
          delta * 10;
      });
    }
  });

  console.log(postMap);

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
      {Object.keys(postMap).map(name => {
        const post = postMap[name];
        const connectedTo = post.forwardWikilinks.map(
          wikilink => postMap[wikilink].position,
        );
        return (
          <Node
            color="#204090"
            connectedTo={connectedTo}
            key={name}
            name={name}
            position={post.position}
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
