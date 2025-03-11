"use client"

import { useState,useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Post } from "@/components/post"
import axios from "axios"
import Link from "next/link"

interface User {
  id: number
  name: string
  username: string
  avatar: string
  isFollowing: boolean
}

interface FeedProps {
  baseUrl: string
}

interface PostType {
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
  likedBy: any[]
  comments: any[]
}


export function Feed({baseUrl}: FeedProps) {
  const [newPostContent, setNewPostContent] = useState("")
  const [posts, setPosts] = useState<[]>([])
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

  useEffect(() => {
    async function fetchPosts() {
      const token = localStorage.getItem("token")
      if (!token) {
        console.warn("No token found. User might not be authenticated.")
        return
      }

      try {
        const response = await axios.get(`${baseUrl}/posts/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setPosts(response.data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      }
    }
    fetchPosts()
  }, [baseUrl])

  const handlePostSubmit = () => {
    if (newPostContent.trim()) {
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
        {posts.map((post: PostType) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

