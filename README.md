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

not supported yet:

- [Link to a block in a note](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+block+in+a+note)

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
