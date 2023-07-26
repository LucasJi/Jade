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
  const [x, y, z] = position;
  const [pos, setPos] = useState(() => new Vector3(x, y, z));
  // DNC(device normalized coordinate) -> project -> de-normalized => world coordinate(screen pixel coordinate)
  const deviceCoordinate = useRef(
    denormalize(pos.clone().project(camera), size),
  );
  // Drag n drop, hover
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? 'grab' : 'auto';
  }, [hovered]);

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    document.body.style.cursor = down ? 'grabbing' : 'grab';

    const movedDeviceCoordinate = deviceCoordinate.current
      .clone()
      .add(new Vector3(mx, my, 0));

    const normalizedMovedDeviceCoordinate = normalize(
      movedDeviceCoordinate,
      size,
    );

    const nextPos = normalizedMovedDeviceCoordinate
      .unproject(camera)
      .multiply(new Vector3(1, 1, 0))
      .clone();
    setPos(nextPos);
    updateNodePos(name, nextPos);

    // When stopping dragging, update the initial device coordinate for next-time dragging operation.
    if (!down) {
      deviceCoordinate.current = movedDeviceCoordinate;
    }
  }, {});
  return (
    <Circle
      {...bind()}
      color={color}
      opacity={0.2}
      position={pos}
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
