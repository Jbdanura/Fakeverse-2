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
  Likes: any[];      
  Comments: any[];
}

export function Feed({ baseUrl }: FeedProps) {
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState<PostType[]>([]);
  const [view, setView] = useState<"all" | "following">("all");
  const username = localStorage.getItem("username") || "";

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const url =
      view === "all"
        ? `${baseUrl}/posts/all`
        : `${baseUrl}/posts/all/following/${username}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
      console.log(posts)
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [baseUrl, view]);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${baseUrl}/posts/new`,
        { content: newPostContent },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      setNewPostContent("");
      fetchPosts();
    } catch (error) {
      console.error("Error posting new post:", error);
    }
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={view === "all" ? "default" : "outline"}
          onClick={() => setView("all")}
        >
          All Posts
        </Button>
        <Button
          variant={view === "following" ? "default" : "outline"}
          onClick={() => setView("following")}
        >
          Following
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Link href={`/profile/${username}`}>
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
              <div className="flex justify-end">
                <Button onClick={handlePostSubmit} disabled={!newPostContent.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* === POSTS LIST === */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            baseUrl={baseUrl}
            onDelete={handleDeletePost}
          />
        ))}
      </div>
    </div>
  );
}
