"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookmarkIcon, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react"
import Link from "next/link"
import { LikesDialog } from "@/components/likes-dialog"
import { Textarea } from "@/components/ui/textarea"
import { posts as postsApi } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface User {
  id: number
  name: string
  username: string
  avatar: string
  isFollowing: boolean
}

interface Comment {
  id: number
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  likedBy?: User[]
}

interface PostProps {
  post: {
    id: number
    user: {
      name: string
      username: string
      avatar: string
    }
    content: string
    image?: string
    timestamp: string
    likes: number
    comments: Comment[]
    likedBy?: User[]
    isLiked?: boolean
    created_at?: string
    username?: string
    profile_pic?: string
  }
}

export function Post({ post }: PostProps) {
  const [liked, setLiked] = useState(post.isLiked || false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [likeCount, setLikeCount] = useState(post.like_count || post.likes || 0)
  const [showLikesDialog, setShowLikesDialog] = useState(false)
  const [showCommentLikesDialog, setShowCommentLikesDialog] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState(null)
  const [comments, setComments] = useState(post.comments || [])
  const [likedByUsers, setLikedByUsers] = useState<User[]>([])
  const [loadingLikes, setLoadingLikes] = useState(false)

  // Console.log to debug the actual structure
  console.log("Post data:", post);
  
  // Based on the server route, we should have username and profile_pic directly on the post
  // This adapts to either structure
  const postUsername = post.username || (post.user && post.user.username) || "unknown";
  const postUserAvatar = post.profile_pic || (post.user && (post.user.avatar || post.user.profile_pic)) || "/placeholder.svg?height=40&width=40";
  
  // For display name, we'll use username if no name is available
  const displayName = (post.user && post.user.name) || post.username || "User";

  // Function to fetch likes 
  const fetchLikes = async () => {
    try {
      setLoadingLikes(true);
      const likesData = await postsApi.getLikes(post.id);
      
      // Format the likes data for the LikesDialog component
      const formattedLikes = likesData.map(user => ({
        id: user.id,
        name: user.name || user.username, // Use username if name isn't available
        username: user.username,
        avatar: user.profile_pic || "/placeholder.svg?height=100&width=100",
        isFollowing: false // We won't know this without another API call
      }));
      
      setLikedByUsers(formattedLikes);
    } catch (error) {
      console.error("Failed to fetch likes:", error);
      toast.error("Failed to load likes");
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await postsApi.unlike(post.id)
        setLikeCount(prevCount => prevCount - 1)
      } else {
        await postsApi.like(post.id)
        setLikeCount(prevCount => prevCount + 1)
      }
      setLiked(!liked)
    } catch (error) {
      console.error("Failed to like/unlike post:", error)
      toast.error("Failed to update like")
    }
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleComment = async () => {
    if (commentText.trim()) {
      try {
        const response = await postsApi.comment(post.id, commentText)
        setComments(prev => [...prev, response])
        setCommentText("")
      } catch (error) {
        console.error("Failed to add comment:", error)
        toast.error("Failed to add comment")
      }
    }
  }

  const openLikesDialog = async () => {
    try {
      setShowLikesDialog(true)
      // Here you would normally fetch likes data, but since you mentioned API issues
      // we'll use an empty array or minimal mock data as a temporary solution
      setLikedByUsers([])
      // Later implement: const likes = await posts.getLikes(post.id)
      // setLikedByUsers(likes)
    } catch (error) {
      console.error("Failed to load likes", error)
    }
  }

  const openCommentLikesDialog = (commentId) => {
    // This would need a similar API endpoint for comment likes
    setSelectedCommentId(commentId)
    setShowCommentLikesDialog(true)
  }

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    
    // If timestamp is already a string in readable format, return it
    if (typeof timestamp === 'string' && !timestamp.includes('T')) {
      return timestamp
    }
    
    try {
      const date = new Date(timestamp)
      
      // Check if the date is today
      const today = new Date()
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      // Check if the date is yesterday
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      }
      
      // Otherwise show date
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return timestamp
    }
  }

  // For debugging - log the post structure to console
  console.log("Post data structure:", post)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Link href={`/profile/${postUsername}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={postUserAvatar} alt={postUsername} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.username || "Unknown User"}</div>
              <div className="text-xs text-muted-foreground">@{post.username || "unknown"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatTimestamp(post.created_at || post.timestamp)}
              </div>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem>Hide post</DropdownMenuItem>
              <DropdownMenuItem>Follow {displayName}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Report post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <Heart className={cn("h-4 w-4", liked ? "fill-primary text-primary" : "")} />
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
            <Heart className={cn("h-4 w-4", liked ? "fill-primary text-primary" : "")} />
            Like
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
            <BookmarkIcon className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            Save
          </Button>
        </div>

        {showComments && (
          <div className="w-full mt-3 space-y-3">
            <Separator />

            {comments.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2 pt-3">
                  <Link href={`/profile/${comment.user.username}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar || "/placeholder.svg?height=32&width=32"} alt={comment.user.username} />
                      <AvatarFallback>{comment.user.name ? comment.user.name.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="bg-muted p-2 rounded-md">
                      <Link href={`/profile/${comment.user.username}`} className="font-semibold text-sm">
                        {comment.user.name}
                      </Link>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <button className="hover:text-foreground">Like</button>
                      <button className="hover:text-foreground">Reply</button>
                      <button
                        className="hover:text-foreground hover:underline"
                        onClick={() => openCommentLikesDialog(comment.id)}
                      >
                        {comment.likes} likes
                      </button>
                      <span>{formatTimestamp(comment.timestamp || comment.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="flex items-center gap-2 pt-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@you" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={handleComment} disabled={!commentText.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send comment</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardFooter>

      {/* Post Likes Dialog */}
      <LikesDialog
        open={showLikesDialog}
        onOpenChange={setShowLikesDialog}
        title="Liked by"
        users={likedByUsers}
        loading={loadingLikes}
      />

      {/* Comment Likes Dialog */}
      {/* <LikesDialog
        open={showCommentLikesDialog}
        onOpenChange={setShowCommentLikesDialog}
        title="Comment Likes"
        users={getSelectedCommentLikes()}
      /> */}
    </Card>
  )
}

