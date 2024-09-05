import type { ConstructName, Handle, Unsafe } from 'mdast-util-to-markdown';

const handleMark: Handle = function (node, _, state, info) {
  const tracker = state.createTracker(info);
  const exit = state.enter('highlight');
  let value = tracker.move('==');
  value += state.containerPhrasing(node, {
    ...tracker.current(),
    before: value,
    after: '=',
  });
  value += tracker.move('==');
  exit();
  return value;
};

const constructsWithoutMark: ConstructName[] = [
  'autolink',
  'destinationLiteral',
  'destinationRaw',
  'reference',
  'titleQuote',
  'titleApostrophe',
];

const unsafe: Unsafe = {
  character: '=',
  inConstruct: 'phrasing',
  notInConstruct: constructsWithoutMark,
};

export const toMarkdown = () => ({
  unsafe: [unsafe],
  handlers: { mark: handleMark },
});
