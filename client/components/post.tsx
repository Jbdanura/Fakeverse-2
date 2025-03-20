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
    name: string;
    username: string;
    avatar: string;
  };
  description: string;
  timestamp: string;
  likes: number;
  likedBy?: User[];
}

interface PostProps {
  post: {
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
    Comments: Comment[];
    likedBy?: User[];
  };
  baseUrl: string;
  onDelete: (postId: number) => void;
}

export function Post({ post, baseUrl, onDelete }: PostProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showLikesDialog, setShowLikesDialog] = useState(false);
  const [showCommentLikesDialog, setShowCommentLikesDialog] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  // Use local state for comments so we can update them on new submission.
  const [comments, setComments] = useState<Comment[]>(post.Comments);

  // Sample users who liked the post
  const [likedByUsers] = useState<User[]>(
    post.likedBy || [
      {
        id: 1,
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "/placeholder.svg?height=100&width=100&text=SJ",
        isFollowing: true,
      },
      {
        id: 2,
        name: "Mike Peters",
        username: "mikepeters",
        avatar: "/placeholder.svg?height=100&width=100&text=MP",
        isFollowing: false,
      },
      {
        id: 3,
        name: "Emma Wilson",
        username: "emmaw",
        avatar: "/placeholder.svg?height=100&width=100&text=EW",
        isFollowing: true,
      },
      {
        id: 4,
        name: "Alex Morgan",
        username: "alexm",
        avatar: "/placeholder.svg?height=100&width=100&text=AM",
        isFollowing: false,
      },
      {
        id: 5,
        name: "Taylor Swift",
        username: "tswift",
        avatar: "/placeholder.svg?height=100&width=100&text=TS",
        isFollowing: true,
      },
    ]
  );

  // Sample users who liked comments
  const [commentLikedByUsers] = useState<Record<number, User[]>>({
    1: [
      {
        id: 1,
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "/placeholder.svg?height=100&width=100&text=SJ",
        isFollowing: true,
      },
      {
        id: 3,
        name: "Emma Wilson",
        username: "emmaw",
        avatar: "/placeholder.svg?height=100&width=100&text=EW",
        isFollowing: true,
      },
      {
        id: 5,
        name: "Taylor Swift",
        username: "tswift",
        avatar: "/placeholder.svg?height=100&width=100&text=TS",
        isFollowing: true,
      },
    ],
    2: [
      {
        id: 2,
        name: "Mike Peters",
        username: "mikepeters",
        avatar: "/placeholder.svg?height=100&width=100&text=MP",
        isFollowing: false,
      },
      {
        id: 4,
        name: "Arthur Morgan",
        username: "arthurm",
        avatar: "/placeholder.svg?height=100&width=100&text=AM",
        isFollowing: false,
      },
    ],
  });

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  // New: Submit comment via API and update local comments state.
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
        // Append new comment to local comments state.
        setComments((prevComments) => [...prevComments, newComment]);
        setCommentText("");
      } else {
        console.error("Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const openLikesDialog = () => {
    setShowLikesDialog(true);
  };

  const openCommentLikesDialog = (commentId: number) => {
    setSelectedCommentId(commentId);
    setShowCommentLikesDialog(true);
  };

  const getSelectedCommentLikes = (): User[] => {
    if (!selectedCommentId) return [];
    return commentLikedByUsers[selectedCommentId] || [];
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
  console.log(comments)
  return (
    <Card className="relative">
      {deleteMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold z-10">
          {deleteMessage}
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Link href="/profile" className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{post.user.name}</div>
              <div className="text-xs text-muted-foreground">
                @{post.user.username} · {post.timestamp}
              </div>
            </div>
          </Link>
          {localStorage.getItem("username") === post.user.username && (
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
            <span>{comments.length} comments</span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between w-full">
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
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground"
            onClick={handleSave}
          >
            <BookmarkIcon className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            Save
          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-3 space-y-3">
            <Separator />
            {comments.map((comment) => {
            // Use optional chaining and fallback for display name.
            const commentDisplayName = comment.user?.name || comment.user?.username || localStorage.getItem("username");
            const commentAvatarInitial = comment.user?.username ? comment.user.username.charAt(0).toUpperCase() : "U";
            return (
              <div key={comment.id} className="flex items-start gap-2 pt-3">
                <Link href="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatar || "/placeholder.svg"} alt={commentDisplayName} />
                    <AvatarFallback>{commentAvatarInitial}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="bg-muted p-2 rounded-md">
                    <Link href="/profile" className="font-semibold text-sm">
                      {commentDisplayName}
                    </Link>
                    <p className="text-sm">{comment.description}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{comment.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

            <div className="flex items-center gap-2 pt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@user" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
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
      <LikesDialog open={showLikesDialog} onOpenChange={setShowLikesDialog} title="Likes" users={likedByUsers} />

      {/* Comment Likes Dialog */}
      <LikesDialog
        open={showCommentLikesDialog}
        onOpenChange={setShowCommentLikesDialog}
        title="Comment Likes"
        users={getSelectedCommentLikes()}
      />
    </Card>
  );
}
