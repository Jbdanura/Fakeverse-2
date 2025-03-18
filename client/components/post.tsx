"use client"

import { useState } from "react"
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
  }
}

export function Post({ post }: PostProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showLikesDialog, setShowLikesDialog] = useState(false)
  const [showCommentLikesDialog, setShowCommentLikesDialog] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)

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
    ],
  )

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
        name: "Alex Morgan",
        username: "alexm",
        avatar: "/placeholder.svg?height=100&width=100&text=AM",
        isFollowing: false,
      },
    ],
  })

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleComment = () => {
    setShowComments(!showComments)
  }

  const submitComment = () => {
    if (commentText.trim()) {
      // In a real app, you would add the comment to your state or send to an API
      console.log("New comment:", commentText)
      setCommentText("")
    }
  }

  const openLikesDialog = () => {
    setShowLikesDialog(true)
  }

  const openCommentLikesDialog = (commentId: number) => {
    setSelectedCommentId(commentId)
    setShowCommentLikesDialog(true)
  }

  const getSelectedCommentLikes = (): User[] => {
    if (!selectedCommentId) return []
    return commentLikedByUsers[selectedCommentId] || []
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Link href="/profile" className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>yp</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{post.user.name}</div>
              <div className="text-xs text-muted-foreground">
                @{post.user.username} · {post.timestamp}
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
              <DropdownMenuItem>Follow {post.user.name}</DropdownMenuItem>
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
            <Heart className="h-4 w-4 fill-primary text-primary" />
            <span>{likeCount} likes</span>
          </button>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span> comments</span>
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

            {post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2 pt-3">
                <Link href="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="bg-muted p-2 rounded-md">
                    <Link href="/profile" className="font-semibold text-sm">
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
                    <span>{comment.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

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
  )
}

