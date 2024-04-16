import { toString } from 'mdast-util-to-string';
import { remark } from 'remark';
import { read } from 'to-vfile';

const filepath = '_posts/Demo/Demo.md';
const HEADING = 'Heading 2.1';

const file = await remark()
  .use(separateHeading)
  .process(await read(filepath));

console.log(file);

function separateHeading() {
  return function (tree) {
    const length = tree.children.length;
    const headingIdx = tree.children.findIndex(
      child => child.type == 'heading' && toString(child) == HEADING,
    );

    if (headingIdx == -1) {
      return;
    }

    const heading = tree.children[headingIdx];
    const depth = heading.depth;

    let nextSameDepthHeadingIdx = tree.children.findIndex(
      (child, index) =>
        index > headingIdx && child.type == 'heading' && child.depth == depth,
    );

    if (nextSameDepthHeadingIdx == -1) {
      nextSameDepthHeadingIdx = length;
    }

    tree.children = tree.children.slice(headingIdx, nextSameDepthHeadingIdx);
  };
}
