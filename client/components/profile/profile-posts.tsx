"use client";

import { Post } from "@/components/post";
import { useState, useEffect } from "react";
import axios from "axios";

interface ProfilePostsProps {
  baseUrl: string;
  username: string;
}

export interface PostType {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  likedBy: any[];
  Comments: any[];
}

export function ProfilePosts({ baseUrl, username }: ProfilePostsProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  const handleDeletePost = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    axios
      .get(`${baseUrl}/users/user/${username}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        const data = response.data;
        const profile = data.dataValues ? data.dataValues : data;
        setPosts(profile.posts || []);
        console.log(data)
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });
  }, [baseUrl, username]);

  if (loading) return <p>Loading posts...</p>;
  if (posts.length === 0) return <p>No posts available.</p>;

  return (
    <div className="space-y-4 max-w-3xl">
      {posts.map((post: PostType) => (
        <Post key={post.id} post={post} baseUrl={baseUrl} onDelete={handleDeletePost} />
      ))}
    </div>
  );
}
