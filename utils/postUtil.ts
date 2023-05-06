import fs from 'fs';
import { join } from 'path';

const postsDirectory = join(process.cwd(), '_posts');

export function getPostFullPaths() {
  return walkFilesRecursively(postsDirectory);
}

function walkFilesRecursively(dir: string, fileNameArray: string[] = []) {
  const files = fs.readdirSync(dir);
  let innerFileNameArray = fileNameArray || [];

  files.forEach(file => {
    const path = join(dir, file);
    if (fs.statSync(path).isDirectory()) {
      innerFileNameArray = walkFilesRecursively(path, innerFileNameArray);
    } else {
      innerFileNameArray.push(path);
    }
  });

  return innerFileNameArray;
}

export function getPostBySlug(name: string, fields: string[] = []) {
  const slug = name.replace(/\.md$/, '');
  const fullPath = join(postsDirectory, name);
  const content = fs.readFileSync(fullPath, 'utf8');

  type Items = {
    [key: string]: string;
  };

  const items: Items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach(field => {
    if (field === 'slug') {
      items[field] = slug;
    }
    if (field === 'content') {
      items[field] = content;
    }
  });

  return items;
}

export function getAllPosts(fields: string[] = []) {
  const fullPaths = getPostFullPaths();
  console.log('post full paths:', fullPaths);
  const posts = fullPaths.map(name => getPostBySlug(name, fields));
  return posts;
}
