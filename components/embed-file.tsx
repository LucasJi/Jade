'use client';

import { getPreviewUrlByNameLike } from '@/app/api';
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

const _width = 100;
const _height = 100;

const parseImg = (filename: string) => {
  const [objName, config] = filename.split('|');
  let width, height;
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
        width: width ?? _width,
        height: height ?? _height,
      });
    } else if (isAudio(escapedPath)) {
      setFileType('AUDIO');
      name = escapedPath;
    }

    if (name) {
      getPreviewUrlByNameLike(name).then(url => {
        setUrl(url);
        setIsLoading(false);
      });
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
      return <Pdf />;
    }
    case 'IMG': {
      return url ? (
        <Image
          width={config.width}
          height={config.height}
          src={url}
          alt="Picture"
        />
      ) : (
        <div>Unknown image</div>
      );
    }
    case 'AUDIO': {
      return (
        <audio controls>
          <source src={url} />
        </audio>
      );
    }
    default: {
      return <div>not valid file</div>;
    }
  }
};

export default EmbedFile;
