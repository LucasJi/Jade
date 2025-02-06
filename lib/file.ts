import {
  AUDIO_EXTS,
  IMAGE_EXTS,
  MD_EXTS,
  PDF_EXTS,
  VIDEO_EXTS,
} from '@/lib/constants';
import {
  chunk,
  groupBy,
  join,
  mapValues,
  reduce,
  slice,
  trimEnd,
} from 'lodash';

export const getExt = (path: string): string => {
  return path.slice(((path.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const getFilename = (path: string): string => {
  const ext = getExt(path);
  return trimEnd(path, '.' + ext);
};

export const getSimpleFilename = (path: string): string => {
  const filename = getFilename(path);
  const splits = filename.split('/');
  return splits[splits.length - 1];
};

export const checkExt = (exts: string[], path: string) =>
  exts.find(ext => path.includes('.' + ext));

export const isMd = (path: string) => checkExt(MD_EXTS, path);
export const isImg = (path: string) => checkExt(IMAGE_EXTS, path);
export const isAudio = (path: string) => checkExt(AUDIO_EXTS, path);
export const isVideo = (path: string) => checkExt(VIDEO_EXTS, path);
export const isPdf = (path: string) => checkExt(PDF_EXTS, path);

// 定义一种方法来生成一致的颜色
const hashToColor = (hash: number): string => {
  const [r, g, b] = chunk(hash.toString(16).padStart(6, '0'), 2).map(hex =>
    parseInt(hex.join(''), 16),
  );
  return `rgb(${r}, ${g}, ${b})`;
};

// 对字符串生成简单哈希值
const stringHash = (input: string): number => {
  return reduce(
    input,
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
};

// 提取文件路径的最小父目录
const getFolder = (path: string): string => {
  const splits = path.split('/');
  if (splits.length <= 0) {
    return '';
  }

  if (splits.length === 1) {
    return splits[0];
  }

  return join(slice(splits, 0, splits.length - 1), '/');
};

// 路径到颜色的映射函数
export const mapPathsToColors = (paths: string[]): Record<string, string> => {
  const groupedByFolder = groupBy(paths, getFolder);
  const rootToColorMap = mapValues(groupedByFolder, (_, root) =>
    hashToColor(stringHash(root)),
  );

  return reduce(
    paths,
    (result, path) => {
      result[path] = rootToColorMap[getFolder(path)];
      return result;
    },
    {} as Record<string, string>,
  );
};

export const mapInternalLinkToVaultPath = (
  internalLink: string,
  selfPath: string,
  paths: string[],
) => {
  const [vaultPathFromLink, ...subHeadings] = internalLink.split('#');
  // the internal link links to the note itself
  let vaultPath = vaultPathFromLink === '' ? selfPath : vaultPathFromLink;
  vaultPath = paths.find(e => e.includes(vaultPath)) ?? '';
  return { vaultPath, subHeadings };
};
