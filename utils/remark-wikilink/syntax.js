const codes = {
  horizontalTab: -2,
  virtualSpace: -1,
  nul: 0,
  eof: null,
  // ' '
  space: 32,
};

function markdownLineEndingOrSpace(code) {
  return code < codes.nul || code === codes.space;
}

function markdownLineEnding(code) {
  return code < codes.horizontalTab;
}

function syntax(opts = {}) {
  const aliasDivider = opts.aliasDivider || '|';

  const aliasMarker = aliasDivider;
  const startMarker = '[[';
  const endMarker = ']]';

  function tokenize(effects, ok, nok) {
    var data;
    var alias;

    var aliasCursor = 0;
    var startMarkerCursor = 0;
    var endMarkerCursor = 0;

    return start;

    function start(code) {
      if (code !== startMarker.charCodeAt(startMarkerCursor)) {
        return nok(code);
      }

      effects.enter('wikilink');
      effects.enter('wikilinkMarker');

      return consumeStart(code);
    }

    function consumeStart(code) {
      if (startMarkerCursor === startMarker.length) {
        effects.exit('wikilinkMarker');
        return consumeData(code);
      }

      if (code !== startMarker.charCodeAt(startMarkerCursor)) {
        return nok(code);
      }

      effects.consume(code);
      startMarkerCursor++;

      return consumeStart;
    }

    function consumeData(code) {
      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }

      effects.enter('wikilinkData');
      effects.enter('wikilinkTarget');
      return consumeTarget(code);
    }

    function consumeTarget(code) {
      if (code === aliasMarker.charCodeAt(aliasCursor)) {
        if (!data) {
          return nok(code);
        }
        effects.exit('wikilinkTarget');
        effects.enter('wikilinkAliasMarker');
        return consumeAliasMarker(code);
      }

      if (code === endMarker.charCodeAt(endMarkerCursor)) {
        if (!data) {
          return nok(code);
        }
        effects.exit('wikilinkTarget');
        effects.exit('wikilinkData');
        effects.enter('wikilinkMarker');
        return consumeEnd(code);
      }

      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }

      if (!markdownLineEndingOrSpace(code)) {
        data = true;
      }

      effects.consume(code);

      return consumeTarget;
    }

    function consumeAliasMarker(code) {
      if (aliasCursor === aliasMarker.length) {
        effects.exit('wikilinkAliasMarker');
        effects.enter('wikilinkAlias');
        return consumeAlias(code);
      }

      if (code !== aliasMarker.charCodeAt(aliasCursor)) {
        return nok(code);
      }

      effects.consume(code);
      aliasCursor++;

      return consumeAliasMarker;
    }

    function consumeAlias(code) {
      if (code === endMarker.charCodeAt(endMarkerCursor)) {
        if (!alias) {
          return nok(code);
        }
        effects.exit('wikilinkAlias');
        effects.exit('wikilinkData');
        effects.enter('wikilinkMarker');
        return consumeEnd(code);
      }

      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }

      if (!markdownLineEndingOrSpace(code)) {
        alias = true;
      }

      effects.consume(code);

      return consumeAlias;
    }

    function consumeEnd(code) {
      if (endMarkerCursor === endMarker.length) {
        effects.exit('wikilinkMarker');
        effects.exit('wikilink');
        return ok(code);
      }

      if (code !== endMarker.charCodeAt(endMarkerCursor)) {
        return nok(code);
      }

      effects.consume(code);
      endMarkerCursor++;

      return consumeEnd;
    }
  }

  var call = { tokenize: tokenize };

  return {
    text: { 91: call }, // left square bracket
  };
}

export default syntax;
