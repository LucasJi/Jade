import { Vector3 } from 'three';
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

const outerCircleRadius = 0.5;
const innerCircleRadius = outerCircleRadius / 2;
const junctionCircleRadius = 0.05;

const normalize = (x, y, width, height) => [
  (x / width) * 2 - 1,
  -(y / height) * 2 + 1,
];

const denormalize = (x, y, width, height) => [
  (width / 2) * (x + 1),
  (height / 2) * (1 - y),
];

const context = createContext();

const Circle = forwardRef(
  (
    {
      children,
      opacity = 1,
      radius = junctionCircleRadius,
      segments = 64,
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
  /*
  {
    "start": {
        "x": -1.65,
        "y": 2,
        "z": 0
    },
    "end": {
        "x": 1.65,
        "y": -3,
        "z": 0
    }
}
   */
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

  console.log('lines:', lines);

  useFrame((_, delta) =>
    group.current.children.forEach(
      group =>
        (group.children[0].material.uniforms.dashOffset.value -= delta * 10),
    ),
  );

  return (
    <context.Provider value={set}>
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

    const [x, y, z] = position;
    const [pos, setPos] = useState(() => new Vector3(x, y, z));
    const initPos = useRef({
      initNormalizedDeviceX: pos.x,
      initNormalizedDeviceY: pos.y,
    });

    const state = useMemo(
      () => ({ position: pos, connectedTo }),
      [pos, connectedTo],
    );

    // Register this node on mount, unregister on unmount
    useLayoutEffect(() => {
      set(nodes => [...nodes, state]);
      return () => {
        set(nodes => nodes.filter(n => n !== state));
      };
    }, [state, pos]);

    // Drag n drop, hover
    const [hovered, setHovered] = useState(false);
    useEffect(() => {
      document.body.style.cursor = hovered ? 'grab' : 'auto';
    }, [hovered]);

    const bind = useDrag(({ down, movement: [mx, my] }) => {
      document.body.style.cursor = down ? 'grabbing' : 'grab';

      const { initNormalizedDeviceX, initNormalizedDeviceY } = initPos.current;
      const [initDeviceX, initDeviceY] = denormalize(
        initNormalizedDeviceX,
        initNormalizedDeviceY,
        size.width,
        size.height,
      );

      // camera's normalized device coordinate (NDC) space
      const movedDeviceX = initDeviceX + mx;
      const movedDeviceY = initDeviceY + my;
      const [normalizedDeviceX, normalizedDeviceY] = normalize(
        movedDeviceX,
        movedDeviceY,
        size.width,
        size.height,
      );

      const nextPos = new Vector3(normalizedDeviceX, normalizedDeviceY, 0)
        .unproject(camera)
        .multiply(new Vector3(1, 1, 0))
        .clone();
      setPos(nextPos);

      // When stopping dragging, update the initial normalized device coordinate for next-time dragging operation.
      if (!down) {
        initPos.current = {
          initNormalizedDeviceX: normalizedDeviceX,
          initNormalizedDeviceY: normalizedDeviceY,
        };
      }
    }, {});
    return (
      <Circle
        ref={ref}
        {...bind()}
        color={color}
        opacity={0.2}
        position={pos}
        radius={outerCircleRadius}
        {...props}
      >
        <Circle
          color={hovered ? '#ff1050' : color}
          onPointerOut={() => setHovered(false)}
          onPointerOver={() => setHovered(true)}
          position={[0, 0, 0.1]}
          radius={innerCircleRadius}
        >
          <Text fontSize={0.25} position={[0, 0, 0]}>
            {name}
          </Text>
        </Circle>
      </Circle>
    );
  },
);
