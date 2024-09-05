import { ok as assert } from 'devlop';
import { factorySpace } from 'micromark-factory-space';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';
import { codes, types } from 'micromark-util-symbol';
import { Extension, State, Tokenizer } from 'micromark-util-types';

const tokenizeTaskListCheck: Tokenizer = function (effects, ok, nok) {
  const previous = this.previous;
  const _gfmTaskListFirstContentOfListItem =
    this._gfmTasklistFirstContentOfListItem;
  const open: State = function (code) {
    assert(code === codes.leftSquareBracket, 'expected `[`');

    if (
      // Exit if there’s stuff before.
      previous !== codes.eof ||
      // Exit if not in the first content that is the first child of a list
      // item.
      !_gfmTaskListFirstContentOfListItem
    ) {
      return nok(code);
    }

    effects.enter('taskListCheck');
    effects.enter('taskListCheckMarker');
    effects.consume(code);
    effects.exit('taskListCheckMarker');
    return inside;
  };

  const inside: State = function (code) {
    // Currently we match how GH works in files.
    // To match how GH works in comments, use `markdownSpace` (`[\t ]`) instead
    // of `markdownLineEndingOrSpace` (`[\t\n\r ]`).
    if (markdownLineEndingOrSpace(code)) {
      effects.enter('taskListCheckValueUnchecked');
      effects.consume(code);
      effects.exit('taskListCheckValueUnchecked');
      return close;
    }

    if (
      code !== null &&
      code !== codes.leftSquareBracket &&
      code !== codes.rightSquareBracket &&
      code >= codes.exclamationMark &&
      code <= codes.tilde
    ) {
      effects.enter('taskListCheckValueChecked');
      effects.consume(code);
      effects.exit('taskListCheckValueChecked');
      return close;
    }

    return nok(code);
  };

  const close: State = function (code) {
    if (code === codes.rightSquareBracket) {
      effects.enter('taskListCheckMarker');
      effects.consume(code);
      effects.exit('taskListCheckMarker');
      effects.exit('taskListCheck');
      return after;
    }

    return nok(code);
  };

  const after: State = function (code) {
    // EOL in paragraph means there must be something else after it.
    if (markdownLineEnding(code)) {
      return ok(code);
    }

    // Space or tab?
    // Check what comes after.
    if (markdownSpace(code)) {
      return effects.check({ tokenize: spaceThenNonSpace }, ok, nok)(code);
    }

    // EOF, or non-whitespace, both wrong.
    return nok(code);
  };

  return open;
};

const spaceThenNonSpace: Tokenizer = function (effects, ok, nok) {
  const after: State = function (code) {
    // EOF means there was nothing, so bad.
    // EOL means there’s content after it, so good.
    // Impossible to have more spaces.
    // Anything else is good.
    return code === codes.eof ? nok(code) : ok(code);
  };

  return factorySpace(effects, after, types.whitespace);
};

const taskListCheck = {
  name: 'taskListCheck',
  tokenize: tokenizeTaskListCheck,
};

const syntax = (): Extension => {
  return {
    text: { [codes.leftSquareBracket]: taskListCheck },
  };
};

export default syntax;
