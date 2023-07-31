import { Vector3 } from 'three';
import { Size } from '@react-three/fiber';

const normalize = (vec: Vector3, size: Size): Vector3 =>
  new Vector3((vec.x / size.width) * 2 - 1, -(vec.y / size.height) * 2 + 1, 0);

const denormalize = (vec: Vector3, size: Size): Vector3 =>
  new Vector3(
    (size.width / 2) * (vec.x + 1),
    (size.height / 2) * (1 - vec.y),
    vec.z,
  );

const directSamplingInCircle = (
  radius: number,
  xCenter: number,
  yCenter: number,
) => {
  const u = Math.random();
  const theta = Math.random() * 2 * Math.PI;
  const r = Math.sqrt(u);
  return [
    xCenter + r * Math.cos(theta) * radius,
    yCenter + r * Math.sin(theta) * radius,
  ];
};

export { normalize, denormalize, directSamplingInCircle };
