import { splice } from 'micromark-util-chunked';
import { classifyCharacter } from 'micromark-util-classify-character';
import { resolveAll } from 'micromark-util-resolve-all';
import { codes, constants, types } from 'micromark-util-symbol';
import type {
  Construct,
  Event,
  Extension as MicromarkExtension,
  Resolver,
  State,
  Token,
  Tokenizer,
} from 'micromark-util-types';

const tokenizeComment: Tokenizer = function (effects, ok, nok) {
  const previous = this.previous;
  const events = this.events;
  let size = 0;

  const start: State = function (code) {
    if (
      previous === codes.percentSign &&
      events[events.length - 1][1].type !== types.characterEscape
    ) {
      return nok(code);
    }

    effects.enter('commentSequenceTemporary');
    return more(code);
  };

  const more: State = function (code) {
    const before = classifyCharacter(previous);

    if (code === codes.percentSign) {
      // If this is the third marker, exit.
      if (size > 1) {
        return nok(code);
      }
      effects.consume(code);
      size++;
      return more;
    }

    if (size < 2) {
      return nok(code);
    }
    const token = effects.exit('commentSequenceTemporary');
    const after = classifyCharacter(code);
    token._open =
      !after || (after === constants.attentionSideAfter && Boolean(before));
    token._close =
      !before || (before === constants.attentionSideAfter && Boolean(after));
    return ok(code);
  };

  return start;
};

const resolveAllComment: Resolver = function (events, context) {
  let index = -1;

  // Walk through all events.
  while (++index < events.length) {
    // Find a token that can close.
    if (
      events[index][0] === 'enter' &&
      events[index][1].type === 'commentSequenceTemporary' &&
      events[index][1]._close
    ) {
      let open = index;

      // Now walk back to find an opener.
      while (open--) {
        // Find a token that can open the closer.
        if (
          events[open][0] === 'exit' &&
          events[open][1].type === 'commentSequenceTemporary' &&
          events[open][1]._open &&
          // If the sizes are the same:
          events[index][1].end.offset - events[index][1].start.offset ===
            events[open][1].end.offset - events[open][1].start.offset
        ) {
          events[index][1].type = 'commentSequence';
          events[open][1].type = 'commentSequence';

          const comment: Token = {
            type: 'comment',
            start: Object.assign({}, events[open][1].start),
            end: Object.assign({}, events[index][1].end),
          };

          const commentText: Token = {
            type: 'commentText',
            start: Object.assign({}, events[open][1].end),
            end: Object.assign({}, events[index][1].start),
          };

          // Opening.
          const nextEvents: Array<Event> = [
            ['enter', comment, context],
            ['enter', events[open][1], context],
            ['exit', events[open][1], context],
            ['enter', commentText, context],
          ];

          const insideSpan = context.parser.constructs.insideSpan.null;

          if (insideSpan) {
            // Between.
            splice(
              nextEvents,
              nextEvents.length,
              0,
              resolveAll(insideSpan, events.slice(open + 1, index), context),
            );
          }

          // Closing.
          splice(nextEvents, nextEvents.length, 0, [
            ['exit', commentText, context],
            ['enter', events[index][1], context],
            ['exit', events[index][1], context],
            ['exit', comment, context],
          ]);

          splice(events, open - 1, index - open + 3, nextEvents);

          index = open + nextEvents.length - 2;
          break;
        }
      }
    }
  }

  index = -1;

  while (++index < events.length) {
    if (events[index][1].type === 'commentSequenceTemporary') {
      events[index][1].type = types.data;
    }
  }

  return events;
};

const tokenizer: Construct = {
  name: 'comment',
  tokenize: tokenizeComment,
  resolveAll: resolveAllComment,
};

export const syntax = (): MicromarkExtension => {
  return {
    text: {
      [codes.percentSign]: tokenizer,
    },
    insideSpan: { null: [tokenizer] },
    attentionMarkers: { null: [codes.percentSign] },
  };
};
