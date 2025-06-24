"use client";

import { useState } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookmarkIcon, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react";
import Link from "next/link";
import { LikesDialog } from "@/components/likes-dialog";

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
}

interface Comment {
  id: number;
  user: {
    username: string;
  };
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  postId: number;
}

interface Like{
  createdAt: string;
  updatedAt: string;
  id: number;
  postId: number;
  userId: number;
  user:{
    username: string;
  }
}

interface PostProps {
  post: {
    id: number;
    username:string,
    user: {
      name: string;
      username: string;
      avatar: string;
    };
    content: string;
    image?: string;
    updatedAt: string;
    likes: Like[];
    comments: Comment[];
    likedBy?: User[];
  };
  baseUrl: string;
  onDelete: (postId: number) => void;
}

export function Post({ post, baseUrl, onDelete }: PostProps) {
  const loggedInUsername = localStorage.getItem("username");
  const initialLiked =
    post.likes && loggedInUsername
      ? post.likes.some((like: any) => like.user.username === loggedInUsername)
      : false;
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [showCommentLikesDialog, setShowCommentLikesDialog] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [likedByUsers, setLikedByUsers] = useState<Like[]>(post.likes);
  const [messageErr,setMessageErr] = useState("")
  const cloudName = "dchytnqhl";

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/posts/like/${post.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json()
        if (liked) {
          setLikeCount(likeCount - 1);
          setLikedByUsers((likedByUsers) => likedByUsers.filter((like) => like.user.username !== loggedInUsername));
        } else {
          setLikeCount(likeCount + 1);
          setLikedByUsers([...likedByUsers, data])
        }
      } else {
        console.error("Failed to like post"); 
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
    setLiked(!liked);
  }
  

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/posts/comment/${post.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: commentText.trim() }),
      });
      if (res.ok) {
        const newComment: Comment = await res.json();
        newComment.user = { username: localStorage.getItem("username") || "Unknown" };
        setComments((prevComments) => [...prevComments, newComment]);
        setCommentText("");
      } else {
        setMessageErr("Comment too short/long");
        setInterval(()=>{
          setMessageErr("")
        },2000)
      }
    } catch (error:any) {
      console.error("Error posting comment:", error);
    }
  };

  const openLikesDialog = () => {
    setShowLikesDialog(true);
  };

  const deletePost = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/posts/${post.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setDeleteMessage("Post deleted");
        setTimeout(() => {
          onDelete(post.id);
        }, 2000);
      } else {
        setDeleteMessage("Failed to delete post");
        setTimeout(() => {
          setDeleteMessage(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      setDeleteMessage("Failed to delete post");
      setTimeout(() => {
        setDeleteMessage(null);
      }, 2000);
    }
  };

  const deleteComment = async (commentId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${baseUrl}/posts/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submitComment();
    }
  };

  return (
    <Card className="relative">
      {messageErr && (
        <div
          className={`fixed top-4 left-1/2 bg-red-500 transform -translate-x-1/2 px-4 py-2 text-white rounded shadow-lg z-50`}>
        {messageErr}
        </div>
      )}
      {deleteMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold z-10">
          {deleteMessage}
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Link href={`/profile/${post.username}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage key={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${post.username}.png`} src={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${post.username}.png`} alt={post.username} />
              <AvatarFallback>{post.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{post.username}</div>
              <div className="text-xs text-muted-foreground">
                @{post.username} · {post.updatedAt.slice(0,10)}
              </div>
            </div>
          </Link>
          {localStorage.getItem("username") === post.username && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-destructive" onClick={deletePost}>
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="mb-3">{post.content}</p>
        {post.image && (
          <div className="relative rounded-md overflow-hidden mb-3">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col pt-0">
        <div className="flex items-center justify-between w-full">
          <button
            className="flex items-center gap-1 text-muted-foreground text-sm hover:underline"
            onClick={openLikesDialog}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`} />
            <span>{likeCount} likes</span>
          </button>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span onClick={handleComment}>{comments.length} comments</span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-around w-full">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground"
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground"
            onClick={handleComment}
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-3 space-y-3">
            <Separator />
            {comments.map((comment) => {
            const commentDisplayName =
              comment.user?.username || localStorage.getItem("username") || "Unknown";
            const commentAvatarInitial = comment.user?.username
              ? comment.user.username.charAt(0).toUpperCase()
              : "U";
            return (
              <div key={comment.id} className="flex items-start gap-2 pt-3 relative">
                <Link href={`/profile/${comment.user.username}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      key={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${comment.user.username}.png`}
                      src={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${comment.user.username}.png`}
                      alt={commentDisplayName}
                    />
                    <AvatarFallback>{commentAvatarInitial}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="bg-muted p-2 rounded-md relative">

                    {localStorage.getItem("username") === comment.user?.username && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="absolute top-1 right-1 text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                    <Link href={`/profile/${comment.user.username}`} className="font-semibold text-sm">
                      {commentDisplayName}
                    </Link>
                    <p className="text-sm">{comment.description}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{comment.createdAt.slice(0, 10)}</span>
                  </div>
                </div>
              </div>
            );
          })}

            <div className="flex items-center gap-2 pt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage key={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${localStorage.getItem("username")}.png`} src={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${localStorage.getItem("username")}.png`} alt="@user" />
                <AvatarFallback>{localStorage.getItem("username")?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                  onKeyDown={handleKeyDown}
                />
                <Button size="icon" variant="ghost" onClick={submitComment} disabled={!commentText.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send comment</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardFooter>

      {/* Post Likes Dialog */}
      <LikesDialog open={showLikesDialog} onOpenChange={setShowLikesDialog} title="Likes" likes={likedByUsers} />
    </Card>
  );
}
