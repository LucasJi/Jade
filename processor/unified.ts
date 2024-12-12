import { remarkCallout } from '@/plugins/remark-callout';
import remarkComment from '@/plugins/remark-comment';
import { remarkEmbedFile } from '@/plugins/remark-embed-file';
import remarkHighlight from '@/plugins/remark-highlight';
import { remarkTaskList } from '@/plugins/remark-task-list';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { PluggableList, unified } from 'unified';

const remarkPlugins: PluggableList = [
  remarkFrontmatter,
  remarkGfm,
  remarkBreaks,
  remarkHighlight,
  remarkComment,
  remarkTaskList,
  remarkCallout,
  remarkMath,
  remarkWikilink,
  remarkEmbedFile,
];

const rehypePlugins: PluggableList = [
  rehypeRaw as any,
  [rehypeKatex, { strict: false }],
  rehypeSlug,
];

const unifiedProcessor = unified()
  .use(remarkParse)
  .use(remarkPlugins)
  .use(remarkRehype, {
    allowDangerousHtml: true,
  })
  .use(remarkPlugins);

export default unifiedProcessor;
