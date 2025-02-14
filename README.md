# Jade

Jade is an open-source publishing solution for [Obsidian](https://obsidian.md), allowing you to turn
your Obsidian vault into an online website easily. With full support for Obsidian-flavored Markdown
and wiki-style internal links, Jade offers a seamless experience for publishing and browsing your
notes online.

## Features

- **Obsidian-Flavored Markdown**: Supports Obsidian's extended Markdown syntax, including callouts,
  footnotes, comments, and embedded content.
- **Wiki-Style Internal Links**: Enables seamless navigation using `[[WikiLinks]]`, just like in
  Obsidian.
- **Responsive Layout**: Optimized for desktop and mobile devices with a fully responsive design.
- **Built-in Search**: Allows users to quickly find content within the published site.

For more details about features, please read the documentation: https://jade.lucasji.cn

## Installation

### Prerequisites

Before installing Jade, ensure you have the following:

1. [Obsidian](https://obsidian.md/) installed on your device.
2. The [Obsidian2Jade](https://github.com/LucasJi/Obsidian2Jade) plugin installed in Obsidian to
   facilitate note export.

### Manual Installation

1. Install [Node.js(LTS or v23)](https://nodejs.org/en)
2. Install [Redis Stack](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/)
3. Clone the Repository
   ```shell
   git clone git@github.com:LucasJi/Jade.git
   cd Jade
   ```
4. Install Dependencies
   ```shell
   pnpm install
   ```
5. Create `.env` file
   ```shell
   cp .env.example .env
   ```
6. Edit `.env` to setup required environment variables
    - **NEXT_PUBLIC_BASE_URL**: The base url of your Jade server
    - **ACCESS_TOKEN**: Used to protect synchronize related APIs
    - **REDIS_HOST**: Redis stack server host
    - **REDIS_PORT**: Redis stack server port
    - **REDIS_PASS**: Redis stack server password
7. Build & Run
   ```sh
   pnpm run build
   pnpm start
   ```

### Docker Installation

1. Clone the Repository
   ```sh
   git clone git@github.com:LucasJi/Jade.git
   cd Jade
   ```
2. Create `.env` file
   ```shell
   cp .env.example .env
   ```
3. Edit `.env` to setup required environment variables
    - **NEXT_PUBLIC_BASE_URL**: The base url of your Jade server
    - **ACCESS_TOKEN**: Used to protect synchronize related APIs
    - **REDIS_PASS**: Redis stack server password
4. Build & Run
   ```sh
   docker-compose up -d
   ```

## Usage

1. Run your Jade server
2. Config the Obsidian2Jade plugin in your Obsidian vault
3. Synchronize your vault to Jade server
4. Visit `NEXT_PUBLIC_BASE_URL` to enjoy your vault online

## Contribution

We welcome contributions! Feel free to submit issues, feature requests, or pull requests
on [GitHub](https://github.com/LucasJi/Jade).
