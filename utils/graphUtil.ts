import { Vector3 } from 'three';
import { Camera, Size } from '@react-three/fiber';

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

const generateRandomCoordinate = (width: number, height: number) => {
  const randomWidth = Math.random() * width;
  const randomHeight = Math.random() * height;
  return [randomWidth, randomHeight];
};

// convert world coordinate to normalized device coordinate
const wcToDnc = (camera: Camera, size: Size, position: Vector3) =>
  normalize(position, size).unproject(camera).multiply(new Vector3(1, 1, 0));

// convert normalized device coordinate to world coordinate
const dncToWc = (camera: Camera, size: Size, dnc: Vector3) =>
  denormalize(dnc.clone().project(camera), size).multiply(new Vector3(1, 1, 0));

export {
  normalize,
  denormalize,
  directSamplingInCircle,
  wcToDnc,
  dncToWc,
  generateRandomCoordinate,
};
