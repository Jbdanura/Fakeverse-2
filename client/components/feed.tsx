// components/Feed.tsx
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
  const [messageErr,setMessageErr] = useState(null)

  const me =
    typeof window !== "undefined"
      ? localStorage.getItem("username") || ""
      : "";

  const cloudName = "dchytnqhl";

  const myAvatar =
    me && cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${me}.png`
      : "/placeholder.svg";

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const url =
      view === "all"
        ? `${baseUrl}/posts/all`
        : `${baseUrl}/posts/all/following/${me}`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // map each post to inject the Cloudinary avatar URL
      const mapped: PostType[] = response.data.map((p: any) => ({
        ...p,
        user: {
          ...p.user,
          avatar:
            cloudName && p.user.username
              ? `https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${p.user.username}.png`
              : "/placeholder.svg",
        },
      }));

      setPosts(mapped);
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
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewPostContent("");
      fetchPosts();
    } catch (error:any) {
      setMessageErr(error.response.data)
      setInterval(()=>{
        setMessageErr(null)
      },2500)
    }
  };

  const handleDeletePost = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-4">
      {messageErr && (
        <div
          className={`fixed top-4 left-1/2 bg-red-500 transform -translate-x-1/2 px-4 py-2 text-white rounded shadow-lg z-50`}>
        {messageErr}
        </div>
      )}

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

      {/* New Post Input */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Link href={`/profile/${me}`}>
              <Avatar>
                <AvatarImage src={myAvatar} key={myAvatar} alt={`@${me}`} />
                <AvatarFallback>{me.charAt(0).toUpperCase()}</AvatarFallback>
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
                <Button
                  onClick={handlePostSubmit}
                  disabled={!newPostContent.trim()}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts List */}
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
