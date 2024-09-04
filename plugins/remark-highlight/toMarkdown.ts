import type { Handle } from 'mdast-util-to-markdown';

const constructsWithoutMark = [
  'autolink',
  'destinationLiteral',
  'destinationRaw',
  'reference',
  'titleQuote',
  'titleApostrophe',
];

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

export const toMarkdown = () => ({
  unsafe: [
    {
      character: '=',
      inConstruct: 'phrasing',
      notInConstruct: constructsWithoutMark,
    },
  ],
  handlers: { mark: handleMark },
});
