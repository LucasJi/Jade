const baseSiteConfig = {
  name: 'Jade Docs',
  description:
    'Jade is a kind of Obsidian publishing solution. It publishes your Obsidian vault to a public website which strives to support various wonderful features of Obsidian, such as Obsidian flavored markdown, wiki-links, graph view, and more, as much as possible.',
  url: 'https://jade-doc.lucasji.cn',
  keywords: [
    'Personal Blog',
    'Obsidian Publish',
    'Obsidian Publish Alternative',
    'Open Source Obsidian Publish Alternative',
    'Next.js',
    'React',
  ],
  authors: [
    {
      name: 'Lucas Ji',
      url: 'https://github.com/LucasJi',
    },
  ],
  creator: 'Lucas Ji',
  links: {
    github: 'https://github.com/LucasJi/Jade',
  },
};

export const siteConfig = {
  ...baseSiteConfig,
  openGraph: {
    type: 'website',
    locale: 'zh',
    url: baseSiteConfig.url,
    title: baseSiteConfig.name,
    description: baseSiteConfig.description,
    siteName: baseSiteConfig.name,
  },
};
