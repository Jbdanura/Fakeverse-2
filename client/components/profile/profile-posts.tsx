"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Post } from "@/components/post"
import { posts as postsApi } from "@/lib/api"
import { toast } from "sonner"

export function ProfilePosts() {
  const params = useParams()
  const username = typeof params?.username === 'string' ? params.username : undefined
  
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setIsLoading(true)
        
        // Fetch posts for the specific user - we need to update the API to support this
        const response = await postsApi.getAll({ username: username });
        setPosts(response)
      } catch (err) {
        console.error("Failed to fetch user posts:", err)
        setError("Failed to load posts. Please try again later.")
        toast.error("Failed to load posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserPosts()
  }, [username])

  if (isLoading) {
    return <div className="text-center py-10">Loading posts...</div>
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (posts.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">No posts yet</div>
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

