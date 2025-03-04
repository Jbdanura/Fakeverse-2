"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Post } from "@/components/post"
import Link from "next/link"

interface User {
  id: number
  name: string
  username: string
  avatar: string
  isFollowing: boolean
}

export function Feed() {
  const [newPostContent, setNewPostContent] = useState("")

  // Sample users who liked posts
  const sampleUsers: User[] = [
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

  // Sample posts data with likedBy information
  const posts = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      },
      content:
        "Just finished my latest photography project! Here's one of my favorite shots from the series. What do you think?",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "2 hours ago",
      likes: 124,
      likedBy: sampleUsers.slice(0, 5),
      comments: [
        {
          id: 1,
          user: {
            name: "Mike Peters",
            username: "mikepeters",
            avatar: "/placeholder.svg?height=32&width=32&text=MP",
          },
          content: "This is absolutely stunning! The lighting is perfect.",
          timestamp: "1 hour ago",
          likes: 8,
          likedBy: sampleUsers.slice(0, 3),
        },
        {
          id: 2,
          user: {
            name: "Emma Wilson",
            username: "emmaw",
            avatar: "/placeholder.svg?height=32&width=32&text=EW",
          },
          content: "Love the composition! What camera did you use?",
          timestamp: "45 minutes ago",
          likes: 3,
          likedBy: sampleUsers.slice(2, 4),
        },
      ],
    },
    {
      id: 2,
      user: {
        name: "Alex Morgan",
        username: "alexm",
        avatar: "/placeholder.svg?height=40&width=40&text=AM",
      },
      content: "Working from my favorite coffee shop today. The productivity is real! ☕️💻",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "4 hours ago",
      likes: 87,
      likedBy: sampleUsers.slice(1, 4),
      comments: [
        {
          id: 1,
          user: {
            name: "Taylor Swift",
            username: "tswift",
            avatar: "/placeholder.svg?height=32&width=32&text=TS",
          },
          content: "That place has the best lattes!",
          timestamp: "3 hours ago",
          likes: 12,
          likedBy: sampleUsers.slice(0, 5),
        },
      ],
    },
    {
      id: 3,
      user: {
        name: "John Doe",
        username: "johndoe",
        avatar: "/placeholder.svg?height=40&width=40&text=JD",
      },
      content:
        "Just published my new article on web development trends in 2023. Check it out and let me know your thoughts!",
      timestamp: "6 hours ago",
      likes: 56,
      likedBy: sampleUsers.slice(0, 2),
      comments: [],
    },
  ]

  const handlePostSubmit = () => {
    if (newPostContent.trim()) {
      // In a real app, you would add the post to your state or send to an API
      console.log("New post:", newPostContent)
      setNewPostContent("")
    }
  }

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
                <div className="flex items-center gap-2">{/* Add image, video, etc. buttons here */}</div>
                <Button onClick={handlePostSubmit} disabled={!newPostContent.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

