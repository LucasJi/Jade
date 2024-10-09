import type {
  ConstructName,
  Handle,
  Options,
  Unsafe,
} from 'mdast-util-to-markdown';

const constructsWithoutMark: ConstructName[] = [
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

function peekMark() {
  return '=';
}

const unsafe: Unsafe = {
  character: '=',
  inConstruct: 'phrasing',
  notInConstruct: constructsWithoutMark,
};

export const toMarkdown = (): Options => ({
  unsafe: [unsafe],
  handlers: { mark: handleMark },
});
