'use client';

import Container from '@mui/material/Container';

import Markdown from '../../../components/markdown';

import { useGetPost } from '../../../api/blog';

export default function PostDetailsView({ title }: { title: string }) {
  const { post } = useGetPost(title);

  const renderPost = post && <Markdown children={post.content} />;
  console.log(post?.content);

  return <Container maxWidth={false}>{renderPost}</Container>;
}
