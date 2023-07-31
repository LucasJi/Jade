import { Vector3 } from 'three';
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { NodeProps } from '@types';
import { denormalize, normalize } from '@utils/graphUtil';
import { Circle } from '@components';
import useStarryStore from '@store';

const outerCircleRadius = 0.5;
const innerCircleRadius = outerCircleRadius / 2;

const Node = ({
  name,
  color = 'black',
  connectedTo = [],
  position = new Vector3(0, 0, 0),
}: NodeProps) => {
  const { updateNodePos } = useStarryStore();
  const { size, camera } = useThree();
  const [dnc, setDnc] = useState(position);
  // DNC(device normalized coordinate) -> project -> de-normalized => world coordinate(screen pixel coordinate)
  const worldCoordinate = useRef(
    denormalize(dnc.clone().project(camera), size),
  );
  // Drag n drop, hover
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? 'grab' : 'auto';
  }, [hovered]);

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    document.body.style.cursor = down ? 'grabbing' : 'grab';

    const movedWorldCoordinate = worldCoordinate.current
      .clone()
      .add(new Vector3(mx, my, 0));

    const normalizedMovedWorldCoordinate = normalize(
      movedWorldCoordinate,
      size,
    );

    const nextDnc = normalizedMovedWorldCoordinate
      .unproject(camera)
      .multiply(new Vector3(1, 1, 0))
      .clone();

    setDnc(nextDnc);

    updateNodePos(name, nextDnc);

    // When stopping dragging, update the initial device coordinate for next-time dragging operation.
    if (!down) {
      worldCoordinate.current = movedWorldCoordinate;
    }
  }, {});

  return (
    <Circle
      {...bind()}
      color={color}
      opacity={0.2}
      position={dnc}
      radius={outerCircleRadius}
    >
      <Circle
        color={hovered ? '#ff1050' : color}
        onPointerOut={() => setHovered(false)}
        onPointerOver={() => setHovered(true)}
        position={new Vector3(0, 0, 0.1)}
        radius={innerCircleRadius}
      >
        <Text fontSize={0.25} position={[0, 0, 0]}>
          {name}
        </Text>
      </Circle>
    </Circle>
  );
};

export default Node;
