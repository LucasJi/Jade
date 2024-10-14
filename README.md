# Jade

This project is designed to enable the publication of my blogs, authored
in [Obsidian](https://obsidian.md/), to a blog website. The website will strive to support various
wonderful features of Obsidian, such as wikilinks, graph view, and more, as much as possible.

## Getting Started

1. Clone this repository

   ```bash
   git clone https://github.com/LucasJi/Jade.git
   ```

2. Install dependencies

   ```bash
   cd Jade
   npm install
   ```

3. Config environment variables in `.env` file

   ```env
   # Website
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_TITLE="Jade"
   NEXT_PUBLIC_SITE_DESCRIPTION="A personal blog, publishing notes written by Obsidian."

   REPO_ACCESS_TOKEN=
   REPO_NAME=
   REPO_OWNER=
   REPO_BRANCH=

   DIRS_INCLUDED=
   DIRS_EXCLUDED=
   DIRS_ROOT=
   
   REDIS_HOST=
   REDIS_PORT=
   REDIS_PASS=
   
   S3_ENDPOINT=
   S3_PORT=
   S3_ACCESS_KEY=
   S3_SECRET_KEY=
   S3_BUCKET=
   ```

    - `GITHUB_REPO_ACCESS_TOKEN`: When generating
      your [GitHub API access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token),
      the **Read-Only** permission of **Contents** must be selected.
    - `GITHUB_REPO`: The repository where your notes are stored. If you haven't created a note
      repository yet, you can fork
      my [feature test note repository](https://github.com/LucasJi/obsidian-feature-demo-notes).
    - `GITHUB_OWNER`: The owner of the repository.

4. Start the server

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser

## Features

### Note tile

This project now supports three types of note title definitions:

1. The `title` key in frontmatter

   ```md
   ---
   title: Note Title
   ---

   ## Heading 2

   More contents
   ```

2. The heading starts with number sign `#`

   ```md
   # Note Title

   ## Heading 2

   More contents
   ```

3. The filename of note, just like what Obsidian does.

The first type(title defined in the front matter) takes highest precedence over others.

### Wikilink

Galaxy Blog supports displaying all kinds of Obsidian's wikilinks:

- [Link to a file](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+file)
- [Link to a heading in a note](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+heading+in+a+note)
- [Link to a note using an alias](https://help.obsidian.md/Linking+notes+and+files/Aliases#Link+to+a+note+using+an+alias)

**_not supported yet:_**

- [Link to a block in a note](https://help.obsidian.md/Linking+notes+and+files/Internal+links#Link+to+a+block+in+a+note)

### Graph View

Galaxy Note generates a graph view just like what Obsidian does.

The only difference is the nodes in Galaxy Note's graph view are clickable. You will navigate the
specific note page after clicking the note node in the graph view.

### File explorer

Galaxy Note shows the directory structure of your notes.

### Table of Content

Galaxy Note generates a table of content for each note. It will be displayed at the right-bottom
side of the note page.

### Frontmatter

Galaxy Note only supports `yaml` style frontmatter now. For example:

```yaml
---
title: Note Title
aliases: 2023-01-01
tags:
  - tag1
  - tag2
---
```

For now, only the `title`, `tags` and `aliases` keys are supported. The values of them will be
resolved and friendly displayed in the note page.

## Tech Stack

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [remarkjs](https://github.com/remarkjs)
- [D3](https://d3js.org/)
- [pixi.js](https://pixijs.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
