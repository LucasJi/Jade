import { factorySpace } from 'micromark-factory-space';
import { markdownLineEnding } from 'micromark-util-character';
import { codes, constants, types } from 'micromark-util-symbol';
import { Construct, Extension, State, Tokenizer } from 'micromark-util-types';

const tokenizeComment: Tokenizer = function (effects, ok, nok) {
  const start: State = function (code) {
    // console.log('comment: start, enter comment');
    effects.enter('comment');
    return effects.attempt(
      marker,
      factorySpace(effects, contentStart, types.whitespace),
      nok,
    )(code);
  };

  const contentStart: State = function (code) {
    // console.log('comment: content start', code);
    effects.enter(types.chunkText, {
      contentType: constants.contentTypeText,
    });
    return content(code);
  };

  const content: State = function (code) {
    // console.log('comment: content', code);
    return effects.check(
      marker,
      factorySpace(effects, contentAfter, types.whitespace),
      consumeData,
    )(code);
  };

  const consumeData: State = function (code) {
    // console.log('comment: consume data', code);
    if (markdownLineEnding(code) || code === codes.eof) {
      return nok;
    }
    effects.consume(code);
    return content;
  };

  const contentAfter: State = function (code) {
    // console.log('comment: content after', code);
    effects.exit(types.chunkText);
    return effects.attempt(marker, after, nok)(code);
  };

  const after: State = function (code) {
    // console.log('comment: after, exit comment');
    effects.exit('comment');
    return ok(code);
  };

  return start;
};

const tokenizeMarker: Tokenizer = function (effects, ok, nok) {
  let markerSize = 0;
  if (this.previous === codes.percentSign) {
    // console.log('marker: invalid previous', this.previous);
    return nok;
  }

  const start: State = function (code) {
    // console.log('marker--->', code);
    effects.enter('commentMarker');
    return marker(code);
  };

  const marker: State = function (code) {
    if (markerSize == 2) {
      // console.log('marker<---');
      effects.exit('commentMarker');
      markerSize = 0;
      return ok(code);
    }

    if (code === codes.percentSign) {
      // console.log('marker: consume', code);
      effects.consume(code);
      markerSize++;
      return marker;
    }

    // console.log('marker: nok', code);
    return nok(code);
  };

  return factorySpace(effects, start, types.whitespace);
};

const marker: Construct = {
  tokenize: tokenizeMarker,
  partial: true,
};

const comment: Construct = {
  name: 'comment',
  tokenize: tokenizeComment,
};

export const syntax = (): Extension => {
  return {
    text: { [codes.percentSign]: comment },
  };
};
