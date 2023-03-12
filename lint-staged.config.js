module.exports = {
  // This will lint and format TypeScript and                                             //JavaScript files
  '**/*.(ts|tsx|js)': filenames => [
    `pnpm eslint --fix ${filenames.join(' ')}`,
    // `pnpm prettier --write ${filenames.join(' ')}`,
  ],

  // this will Format MarkDown and JSON
  '**/*.(json)': filenames => `pnpm prettier --write ${filenames.join(' ')}`,
};
