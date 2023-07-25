import { CircleProps } from '@types';

const junctionCircleRadius = 0.05;

const Circle = ({
  children,
  opacity = 1,
  radius = junctionCircleRadius,
  segments = 64,
  color = '#ff1050',
  ...props
}: CircleProps) => (
  <mesh {...props}>
    <circleGeometry args={[radius, segments]} />
    <meshBasicMaterial
      color={color}
      opacity={opacity}
      transparent={opacity < 1}
    />
    {children}
  </mesh>
);

export default Circle;
