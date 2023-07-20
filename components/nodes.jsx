import * as THREE from 'three';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { QuadraticBezierLine, Text } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';

const context = createContext();
const Circle = forwardRef(
  (
    {
      children,
      opacity = 1,
      radius = 0.05,
      segments = 32,
      color = '#ff1050',
      ...props
    },
    ref,
  ) => (
    <mesh ref={ref} {...props}>
      <circleGeometry args={[radius, segments]} />
      <meshBasicMaterial
        color={color}
        opacity={opacity}
        transparent={opacity < 1}
      />
      {children}
    </mesh>
  ),
);

export function Nodes({ children }) {
  const group = useRef();
  const [nodes, set] = useState([]);
  const lines = useMemo(() => {
    const lines = [];
    for (const node of nodes) {
      node.connectedTo
        .map(ref => [node.position, ref.current.position])
        .forEach(([start, end]) =>
          lines.push({
            start: start.clone().add({ x: 0.35, y: 0, z: 0 }),
            end: end.clone().add({ x: -0.35, y: 0, z: 0 }),
          }),
        );
    }
    return lines;
  }, [nodes]);
  useFrame((_, delta) =>
    group.current.children.forEach(
      group =>
        (group.children[0].material.uniforms.dashOffset.value -= delta * 10),
    ),
  );

  console.log('lines:', lines);

  return (
    <context.Provider value={set}>
      <group ref={group}>
        {lines.map((line, index) => (
          <group key={new Date()}>
            <QuadraticBezierLine
              key={new Date()}
              {...line}
              color="white"
              dashed
              dashScale={50}
              gapSize={20}
            />
            <QuadraticBezierLine
              key={new Date()}
              {...line}
              color="white"
              lineWidth={0.5}
              opacity={0.1}
              transparent
            />
          </group>
        ))}
      </group>
      {children}
      {lines.map(({ start, end }, index) => (
        <group key={index} position-z={1}>
          <Circle position={start} />
          <Circle position={end} />
        </group>
      ))}
    </context.Provider>
  );
}

export const Node = forwardRef(
  (
    { color = 'black', name, connectedTo = [], position = [0, 0, 0], ...props },
    ref,
  ) => {
    const set = useContext(context);
    const { size, camera } = useThree();
    const [pos, setPos] = useState(() => new THREE.Vector3(...position));
    const state = useMemo(
      () => ({ position: pos, connectedTo }),
      [pos, connectedTo],
    );
    // Register this node on mount, unregister on unmount
    useLayoutEffect(() => {
      set(nodes => [...nodes, state]);
      return () => void set(nodes => nodes.filter(n => n !== state));
    }, [state, pos]);
    // Drag n drop, hover
    const [hovered, setHovered] = useState(false);
    useEffect(
      () => void (document.body.style.cursor = hovered ? 'grab' : 'auto'),
      [hovered],
    );
    const bind = useDrag(({ down, xy: [x, y] }) => {
      document.body.style.cursor = down ? 'grabbing' : 'grab';
      setPos(
        new THREE.Vector3(
          (x / size.width) * 2 - 1,
          -(y / size.height) * 2 + 1,
          0,
        )
          .unproject(camera)
          .multiply({ x: 1, y: 1, z: 0 })
          .clone(),
      );
    });
    return (
      <Circle
        ref={ref}
        {...bind()}
        color={color}
        opacity={0.2}
        position={pos}
        radius={0.5}
        {...props}
      >
        <Circle
          color={hovered ? '#ff1050' : color}
          onPointerOut={() => setHovered(false)}
          onPointerOver={() => setHovered(true)}
          position={[0, 0, 0.1]}
          radius={0.25}
        >
          <Text fontSize={0.25} position={[0, 0, 1]}>
            {name}
          </Text>
        </Circle>
      </Circle>
    );
  },
);
