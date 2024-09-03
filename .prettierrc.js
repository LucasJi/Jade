const config = {
  arrowParens: 'avoid',
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  endOfLine: 'auto',
  organizeImportsSkipDestructiveCodeActions: true,
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.mjs',
  tailwindFunctions: ['clsx', 'cva', 'cn'],
  tailwindPreserveWhitespace: true,
  tailwindPreserveDuplicates: true,
};

export default config;
