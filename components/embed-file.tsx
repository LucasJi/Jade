'use client';

import { getPreviewUrlByNameLike } from '@/app/api';
import Pdf from '@/components/pdf';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AUDIO_EXTS, IMAGE_EXTS, PDF_EXTS } from '@/lib/constants';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EmbedFileProps {
  filename: string;
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

const checkExt = (exts: string[], filename: string) =>
  exts.find(ext => filename.includes('.' + ext));

const EmbedFile: FC<EmbedFileProps> = ({ filename }) => {
  const [url, setUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<EmbedFileConfig>({
    width: _width,
    height: _height,
  });

  useEffect(() => {
    let name;
    if (checkExt(PDF_EXTS, filename)) {
      const { objName, page, height } = parsePdf(filename);
      name = objName;
      setFileType('PDF');
      setConfig({
        page,
        height,
      });
    } else if (checkExt(IMAGE_EXTS, filename)) {
      const { objName, width, height } = parseImg(filename);
      name = objName;
      setFileType('IMG');
      setConfig({
        width: width ?? _width,
        height: height ?? _height,
      });
    } else if (checkExt(AUDIO_EXTS, filename)) {
      setFileType('AUDIO');
      name = filename;
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
        <span>Unknown image</span>
      );
    }
    case 'AUDIO': {
      return (
        <div>
          <audio controls>
            <source src={url} />
          </audio>
        </div>
      );
    }
    default: {
      return <div>not valid file</div>;
    }
  }
};

export default EmbedFile;
