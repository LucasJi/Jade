import {
  AUDIO_EXTS,
  IMAGE_EXTS,
  MD_EXTS,
  PDF_EXTS,
  VIDEO_EXTS,
} from '@/lib/constants';
import { trimEnd } from 'lodash';

export const getExt = (path: string): string => {
  return path.slice(((path.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const getFilename = (path: string): string => {
  const ext = getExt(path);
  return trimEnd(path, '.' + ext);
};

export const checkExt = (exts: string[], path: string) =>
  exts.find(ext => path.includes('.' + ext));

export const isMd = (path: string) => checkExt(MD_EXTS, path);
export const isImg = (path: string) => checkExt(IMAGE_EXTS, path);
export const isAudio = (path: string) => checkExt(AUDIO_EXTS, path);
export const isVideo = (path: string) => checkExt(VIDEO_EXTS, path);
export const isPdf = (path: string) => checkExt(PDF_EXTS, path);
