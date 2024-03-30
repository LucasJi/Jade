# Galaxy Blog

This project is designed to enable the publication of my blogs, authored in [Obsidian](https://obsidian.md/), to a blog website. The website will strive to support various wonderful features of Obsidian, such as wikilinks, graph view, and more, as much as possible.

## Features

### Post tile

This project now supports two types of post title definitions:

1. The `title` key in frontmatter

   ```md
   ---
   title: Post Title
   ---

   ## Heading 2

   More contents
   ```

2. The heading starts with number sign `#`

   ```md
   # Post Title

   ## Heading 2

   More contents
   ```

The title defined in the front matter takes precedence over one starting with the number sign `#`.

### Wikilink

### Graph View

### File explorer

### Table of content

### Frontmatter

## Tech Stack

- [Next.js](https://nextjs.org/)
- [NextUI](https://nextui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [remarkjs](https://github.com/remarkjs)
- [D3](https://d3js.org/)
