"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/components/post";
import axios from "axios";
import Link from "next/link";

interface FeedProps {
  baseUrl: string;
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
  comments: any[];
}

export function Feed({ baseUrl }: FeedProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<PostType[]>([]);

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. User might not be authenticated.");
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/posts/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };



  useEffect(() => {
    fetchPosts();
  }, [baseUrl]);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. User might not be authenticated.");
      return;
    }
    try {
      const response = await axios.post(
        `${baseUrl}/posts/new`,
        { content: newPostContent },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("New post created:", response.data);
      setNewPostContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error posting new post:", error);
    }
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Link href="/profile">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="@user" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Link>
            <div className="grid w-full gap-1.5">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                </div>
                <Button onClick={handlePostSubmit} disabled={!newPostContent.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {posts.map((post: PostType) => (
          <Post key={post.id} post={post} baseUrl={baseUrl} onDelete={handleDeletePost}/>
        ))}
      </div>
    </div>
  );
}
