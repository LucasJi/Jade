# Galaxy Blog

This project is designed to enable the publication of my blogs, authored in [Obsidian](https://obsidian.md/), to a blog website. The website will strive to support various wonderful features of Obsidian, such as wikilinks, graph view, and more, as much as possible.

## Getting Started

1. Clone this repository

   ```bash
   git clone https://github.com/LucasJi/galaxy.git
   ```

2. Install dependencies

   ```bash
   cd galaxy
   npm install
   ```

3. Config environment variables in `.env` file

   ```env
   NEXT_PUBLIC_BASE_URL=<http://localhost:3000>

   # github api configs

   GITHUB_REPO_ACCESS_TOKEN=
   GITHUB_REPO=
   GITHUB_OWNER=
   ```

   - `GITHUB_REPO_ACCESS_TOKEN`: When generating your [GitHub API access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token), the **Read-Only** permission of **Contents** must be selected.
   - `GITHUB_REPO`: The repository where your posts are stored. If you haven't created a post repository yet, you can folk my [feature test post repository](https://github.com/LucasJi/galaxy-feature-posts).
   - `GITHUB_OWNER`: The owner of the repository.

4. Start the server

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser

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
aliases: 2023-01-01
tags:
  - tag1
  - tag2
---
```

For now, only the `title`, `tags` and `aliases` keys are supported. The values of them will be resolved and friendly displayed in the post page.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [NextUI](https://nextui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [remarkjs](https://github.com/remarkjs)
- [D3](https://d3js.org/)
- [React Icons](https://react-icons.github.io/react-icons/)
