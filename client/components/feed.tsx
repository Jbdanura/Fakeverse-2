"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Post } from "@/components/post"
import Link from "next/link"
import { toast } from "sonner"
import { posts as postsApi } from "@/lib/api"

export function Feed() {
  const [newPostContent, setNewPostContent] = useState("")
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch posts from the API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const response = await postsApi.getAll()
        setPosts(response)
      } catch (err) {
        console.error("Failed to fetch posts:", err)
        setError("Failed to load posts. Please try again later.")
        toast.error("Failed to load posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handlePostSubmit = async () => {
    if (newPostContent.trim()) {
      try {
        // Create a new post
        const newPost = await postsApi.create({ content: newPostContent })
        
        // Add the new post to the beginning of the posts array
        setPosts(prevPosts => [newPost, ...prevPosts])
        
        // Clear the textarea
        setNewPostContent("")
        
        toast.success("Post created successfully!")
      } catch (error) {
        console.error("Failed to create post:", error)
        toast.error("Failed to create post")
      }
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

      {isLoading ? (
        <div className="text-center py-10">Loading posts...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-10">No posts yet. Be the first to post!</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

