"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Post } from "@/components/post"
import Link from "next/link"
import { toast } from "sonner"
import { posts } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

export function Feed() {
  const { user } = useAuth()
  const [postContent, setPostContent] = useState("")
  const [feedPosts, setFeedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const postsData = await posts.getAll()
      setFeedPosts(postsData)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      toast.error("Failed to load posts")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!postContent.trim()) return
    
    try {
      const newPost = await posts.create({ content: postContent })
      
      // Add the new post to the feed
      setFeedPosts(prev => [newPost, ...prev])
      
      // Clear the textarea
      setPostContent("")
      
      toast.success("Post created successfully")
    } catch (error) {
      console.error("Failed to create post:", error)
      toast.error("Failed to create post")
    }
  }

  const handleLikeUpdate = (postId, newLikeStatus, newLikeCount) => {
    // Update the post in the feed
    setFeedPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: newLikeStatus, like_count: newLikeCount } 
          : post
      )
    )
  }

  const handleCommentUpdate = (postId, newCommentCount) => {
    // Update the post in the feed
    setFeedPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comment_count: newCommentCount } 
          : post
      )
    )
  }

  return (
    <div className="space-y-4">
      {user && (
        <Card>
          <CardHeader className="font-medium">Create Post</CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="resize-none"
              />
              <Button onClick={handleCreatePost} disabled={!postContent.trim()}>
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="py-8 text-center">Loading posts...</div>
      ) : feedPosts.length > 0 ? (
        feedPosts.map((post) => (
          <Post 
            key={post.id} 
            post={post} 
            onLikeUpdate={handleLikeUpdate}
            onCommentUpdate={handleCommentUpdate}
          />
        ))
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          No posts yet. Be the first to post!
        </div>
      )}
    </div>
  )
}

