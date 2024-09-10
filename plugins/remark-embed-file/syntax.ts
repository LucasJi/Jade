import { markdownLineEnding } from 'micromark-util-character';
import { codes } from 'micromark-util-symbol';
import { Construct, Extension, State, Tokenizer } from 'micromark-util-types';

const tokenizeEmbedFile: Tokenizer = function (effects, ok, nok) {
  const start: State = function (code) {
    if (code !== codes.exclamationMark) {
      return nok(code);
    }

    effects.enter('embedFile');

    effects.consume(code);

    return leftFirstSquareBracket;
  };

  const leftFirstSquareBracket: State = function (code) {
    if (code !== codes.leftSquareBracket) {
      return nok(code);
    }

    effects.consume(code);

    return leftSecondSquareBracket;
  };

  const leftSecondSquareBracket: State = function (code) {
    if (code !== codes.leftSquareBracket) {
      return nok(code);
    }

    effects.consume(code);

    effects.enter('embedFileName');

    return filename;
  };

  const filename: State = function (code) {
    if (markdownLineEnding(code) || code === codes.eof) {
      return nok(code);
    }

    if (code === codes.rightSquareBracket) {
      return effects.check(
        endMarkerConstruct,
        beforeEndMarker,
        continueFilename,
      )(code);
    }

    effects.consume(code);

    return filename;
  };

  const continueFilename: State = function (code) {
    if (markdownLineEnding(code) || code === codes.eof) {
      return nok(code);
    }

    effects.consume(code);

    return filename;
  };

  const beforeEndMarker: State = function (code) {
    effects.exit('embedFileName');
    effects.enter('embedFileEndMarker');
    return rightFirstSquareBracket(code);
  };

  const rightFirstSquareBracket: State = function (code) {
    effects.consume(code);
    return rightSecondSquareBracket;
  };

  const rightSecondSquareBracket: State = function (code) {
    effects.consume(code);
    effects.exit('embedFileEndMarker');
    effects.exit('embedFile');
    return ok(code);
  };

  return start;
};

const tokenizeEndMarker: Tokenizer = function (effects, ok, nok) {
  const rightFirstSquareBracket: State = function (code) {
    if (code !== codes.rightSquareBracket) {
      return nok(code);
    }

    effects.consume(code);
    return rightSecondSquareBracket;
  };

  const rightSecondSquareBracket: State = function (code) {
    if (code !== codes.rightSquareBracket) {
      return nok(code);
    }

    effects.consume(code);
    return ok(code);
  };

  return rightFirstSquareBracket;
};

const endMarkerConstruct: Construct = {
  partial: true,
  tokenize: tokenizeEndMarker,
};

const embedFileConstruct: Construct = {
  name: 'embedFile',
  tokenize: tokenizeEmbedFile,
};

export const syntax = (): Extension => {
  return {
    text: { [codes.exclamationMark]: embedFileConstruct },
  };
};
