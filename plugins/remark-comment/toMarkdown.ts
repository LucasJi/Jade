import type {
  ConstructName,
  Handle,
  Options,
  Unsafe,
} from 'mdast-util-to-markdown';

const constructsWithoutComment: ConstructName[] = [
  'autolink',
  'destinationLiteral',
  'destinationRaw',
  'reference',
  'titleQuote',
  'titleApostrophe',
];

const handleComment: Handle = function (node, _, state, info) {
  const tracker = state.createTracker(info);
  const exit = state.enter('comment');
  let value = tracker.move('%%');
  value += state.containerPhrasing(node, {
    ...tracker.current(),
    before: value,
    after: '%',
  });
  value += tracker.move('%%');
  exit();
  return value;
};

const unsafe: Unsafe = {
  character: '%',
  inConstruct: 'phrasing',
  notInConstruct: constructsWithoutComment,
};

export const toMarkdown = (): Options => ({
  unsafe: [unsafe],
  handlers: { comment: handleComment },
});
