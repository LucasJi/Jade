const repo = 'obsidian-chinese-help';
const branch = 'master';
const token = '';

const base64Decode = (text) => {
  return Buffer.from(text, 'base64').toString();
};

const treeApi = () =>
    fetch(
        `https://api.github.com/repos/LucasJi/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
    )
    .then(resp => resp.json())
    .then(data => {
      const {tree} = data;
      console.log(data);
      // const treeObj = buildTree(tree);
      // console.log(JSON.stringify(treeObj));
    });

// treeApi();

const id = 'MDkg56KO6K6wLzIwMjAxMDAxMTUzNeS9v+eUqHF1aWNrZXLlkox6b3Rlcm/lvJXnlKhQREYgYnkgQW9uLm1k'
const path = base64Decode(id)
console.log('path:', path);

const contentApi = () =>
    fetch(
        `https://api.github.com/repos/LucasJi/${repo}/contents/${path}`,
        {
          headers: {
            Accept: 'application/vnd.github.object+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        },
    )
    .then(async resp => {
      if (resp.status !== 200) {
        const msg = await resp.text();
        console.error('github api request failed', resp.status, msg);
        throw new Error('github api request failed: ' + msg);
      }

      const data = await resp.text();
      console.log('data', data);
    });

contentApi();
