'use client';

import Pdf from '@/components/pdf';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { isAudio, isImg, isPdf } from '@/lib/file';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

interface EmbedFileProps {
  path: string;
}

interface EmbedFileConfig {
  page?: number;
  width?: number;
  height?: number;
}

const _width = 768;
const _height = 700;

const parseImg = (filename: string) => {
  const [objName, config] = filename.split('|');
  let width,
    height = undefined;
  if (config) {
    const [w, h] = config.split('x');
    width = w ? Number.parseInt(w) : undefined;
    height = h ? Number.parseInt(h) : undefined;
  }

  return {
    objName,
    width,
    height,
  };
};

const parsePdf = (filename: string) => {
  const heightConfigStr = 'height=';
  const pageConfigStr = 'page=';
  const [objName, config] = filename.split('#');
  let page, height;
  if (config?.includes(pageConfigStr)) {
    const _page = Number.parseInt(config.replace(pageConfigStr, ''));
    if (!Number.isNaN(_page)) {
      page = _page;
    }
  }
  if (config?.includes(heightConfigStr)) {
    const _height = Number.parseInt(config.replace(heightConfigStr, ''));
    if (!Number.isNaN(_height)) {
      height = _height;
    }
  }

  return {
    objName,
    page,
    height,
  };
};

const EmbedFile: FC<EmbedFileProps> = ({ path }) => {
  const [url, setUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<EmbedFileConfig>({
    width: _width,
    height: _height,
  });

  useEffect(() => {
    let name = path;
    const escapedPath = path.replace(/\\\|/g, '|');
    if (isPdf(escapedPath)) {
      const { objName, page, height } = parsePdf(escapedPath);
      name = objName;
      setFileType('PDF');
      setConfig({
        page,
        height,
      });
    } else if (isImg(escapedPath)) {
      const { objName, width, height } = parseImg(escapedPath);
      name = objName;
      setFileType('IMG');
      setConfig({
        width: width,
        height: height,
      });
    } else if (isAudio(escapedPath)) {
      setFileType('AUDIO');
      name = escapedPath;
    }

    if (name) {
      setUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/api/obj?name=${name}`);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          width: `${config.width}px`,
          height: `${config.height}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  switch (fileType) {
    case 'PDF': {
      return <Pdf url={url} />;
    }
    case 'IMG': {
      if (!url) {
        return <div>Unknown image</div>;
      }

      if (config.height !== undefined && config.width !== undefined) {
        return (
          <Image
            src={url}
            alt="Image"
            width={config.width}
            height={config.height}
          />
        );
      }

      // eslint-disable-next-line @next/next/no-img-element
      return <img src={url} alt="Image" />;
    }
    case 'AUDIO': {
      return (
        <audio controls>
          <source src={url} />
        </audio>
      );
    }
    default: {
      return <div>Unsupported file type</div>;
    }
  }
};

export default EmbedFile;
