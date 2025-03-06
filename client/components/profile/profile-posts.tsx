"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Post } from "@/components/post"
import { posts } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

export function ProfilePosts() {
  const params = useParams()
  const username = typeof params?.username === 'string' ? params.username : undefined
  const { user: authUser } = useAuth()
  
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Add a ref to track if we already fetched data
  const dataFetched = useRef(false)
  
  useEffect(() => {
    // If we already fetched data, don't fetch again
    if (dataFetched.current) return
    
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Before fetching, check if we have token
        const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')
        
        // If viewing own profile without auth, show empty state
        if ((username === 'me' || !username) && !hasToken) {
          setUserPosts([])
          setError('Login required to view your posts')
          dataFetched.current = true
          return
        }
        
        // Fetch posts by username
        const postsData = await posts.getAll({ 
          username: username || 'me',
          limit: 10
        })
        
        setUserPosts(postsData)
        dataFetched.current = true
      } catch (err) {
        console.error('Failed to fetch posts:', err)
        
        // Don't show authentication errors directly
        if (err.message?.includes('Authentication required')) {
          setError('Login required to view posts')
        } else {
          setError('Failed to load posts')
        }
        
        // Show empty posts list rather than error state
        setUserPosts([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [username])

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="media">Media</TabsTrigger>
        <TabsTrigger value="likes">Likes</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-6 space-y-4">
        {loading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : userPosts.length > 0 ? (
          userPosts.map((post) => <Post key={post.id} post={post} />)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {error ? error : "No posts yet"}
          </div>
        )}
      </TabsContent>
      <TabsContent value="media" className="mt-6">
        <div className="text-center py-8 text-muted-foreground">No media posts yet</div>
      </TabsContent>
      <TabsContent value="likes" className="mt-6">
        <div className="text-center py-8 text-muted-foreground">No liked posts yet</div>
      </TabsContent>
    </Tabs>
  )
}

