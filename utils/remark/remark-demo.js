function remarkDemo(options = {}) {
  const data = this.data();

  function add(field, value) {
    if (data[field]) {
      data[field].push(value);
    } else {
      data[field] = [value];
    }
  }

  const variableConstruct = { name: 'variable', tokenize: variableTokenize };

  const variables = { text: { 123: variableConstruct } };

  function variableTokenize(effects, ok, nok) {
    console.log(effects);
    return start;

    function start(code) {
      effects.enter('variable');
      effects.enter('variableMarker');
      effects.consume(code);
      effects.exit('variableMarker');
      effects.enter('variableString');
      effects.enter('chunkString', { contentType: 'string' });
      return begin;
    }

    function begin(code) {
      return code === 125 ? nok(code) : inside(code);
    }

    function inside(code) {
      if (code === -5 || code === -4 || code === -3 || code === null) {
        return nok(code);
      }

      if (code == 92) {
        effects.consume(code);
        return insideEscape;
      }

      if (code === 125) {
        effects.exit('chunkString');

        effects.exit('variableString');

        effects.enter('variableMarker');

        effects.consume(code);

        effects.exit('variableMarker');

        effects.exit('variable');

        return ok;
      }

      effects.consume(code);

      return inside;
    }

    function insideEscape(code) {
      if (code === 125 || code === 92) {
        effects.consume(code);
        return inside;
      }
    }
  }

  add('micromarkExtensions', variables);
}

export default remarkDemo;

export { remarkDemo };
