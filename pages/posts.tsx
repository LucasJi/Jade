import { useEffect, useState } from 'react';
import httpClient from '@utils/axios';
import { Post } from 'types';
import { AxiosResponse } from 'axios';

function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    httpClient.get('api/posts').then((res: AxiosResponse<Post[]>) => {
      const posts = res.data;
      if (posts !== null) {
        setPosts([...posts]);
      }
    });
  }, []);
  return (
    <div>
      <h1>Posts</h1>
      {posts.map(post => (
        <div key={post.wikilink}>{post.title}</div>
      ))}
    </div>
  );
}

export default Posts;
