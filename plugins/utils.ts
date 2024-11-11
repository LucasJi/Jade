import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown';
import type { Extension as MicromarkExtension } from 'micromark-util-types';
import { Data } from 'unified';

export const addExtensions = ({
  data,
  micromarkExtension,
  fromMarkdownExtension,
  toMarkdownExtension,
}: {
  data: Data;
  micromarkExtension?: MicromarkExtension;
  fromMarkdownExtension?: FromMarkdownExtension;
  toMarkdownExtension?: ToMarkdownExtension;
}) => {
  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions =
    // @ts-ignore
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  if (micromarkExtension) {
    micromarkExtensions.push(micromarkExtension);
  }

  if (fromMarkdownExtension) {
    fromMarkdownExtensions.push(fromMarkdownExtension);
  }

  if (toMarkdownExtension) {
    toMarkdownExtensions.push(toMarkdownExtension);
  }
};
