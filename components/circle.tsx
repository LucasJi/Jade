import { forwardRef } from 'react';
import { Object3D } from 'three';
import { Circle } from '@types';

const junctionCircleRadius = 0.05;

const Circle = forwardRef<Object3D, Circle>(
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
    <mesh {...props} ref={ref}>
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

export default Circle;
