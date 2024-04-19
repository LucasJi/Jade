# Galaxy Blog

This project is designed to enable the publication of my blogs, authored in [Obsidian](https://obsidian.md/), to a blog website. The website will strive to support various wonderful features of Obsidian, such as wikilinks, graph view, and more, as much as possible.

## Features

### Post tile

This project now supports three types of post title definitions:

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

3. The filename of post, just like what Obsidian does.

The first type(title defined in the front matter) takes highest precedence over others.

### Wikilink

Galaxy Blog supports displaying all kinds of Obsidian's wikilinks:

- [Link to a file](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+file)
- [Link to a heading in a note](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+heading+in+a+note)
- [Link to a note using an alias](https://help.obsidian.md/Linking+notes+and+files/Aliases#Link+to+a+note+using+an+alias)

**_not supported yet:_**

- [Link to a block in a note](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+block+in+a+note)

### Graph View

Galaxy Post generates a graph view just like what Obsidian does.

The only difference is the nodes in Galaxy Post's graph view are clickable. You will navigate the specific post page after clicking the post node in the graph view.

### File explorer

Galaxy Post shows the directory structure of your posts.

### Table of Content

Galaxy Post generates a table of content for each post. It will be displayed at the right-bottom side of the post page.

### Frontmatter

Galaxy Post only supports `yaml` style frontmatter now. For example:

```yaml
---
title: Post Title
date: 2023-01-01
tags:
  - tag1
  - tag2
---
```

For now, only the `title` and `tags` key are supported. The values of them will be resolved and friendly displayed in the post page.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [NextUI](https://nextui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [remarkjs](https://github.com/remarkjs)
- [D3](https://d3js.org/)
