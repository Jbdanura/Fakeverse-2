"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Home, User, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { users } from "@/lib/api"
import { useAuth } from "@/context/auth-context"

export function Sidebar() {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  // Add a ref to track if we already fetched data
  const dataFetched = useRef(false)
  
  useEffect(() => {
    // Use auth user data if available
    if (authUser) {
      setProfile(authUser)
      setLoading(false)
      return
    }
    
    // If we already fetched data or don't have a token, don't fetch again
    if (dataFetched.current || (typeof window !== 'undefined' && !localStorage.getItem('token'))) {
      setLoading(false);
      return
    }
    
    const fetchProfile = async () => {
      try {
        setLoading(true)
        
        // Force reload user data from server instead of using cached data
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Fetch directly from validateToken endpoint to get fresh data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to validate token');
        }
        
        const data = await response.json();
        console.log("Fresh profile data:", data.user);
        
        if (data.user) {
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(data.user));
          setProfile(data.user);
        }
        
        dataFetched.current = true;
      } catch (error) {
        console.error("Failed to load profile:", error)
        
        // Use stored user as fallback
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('user')
          if (storedUser) {
            setProfile(JSON.parse(storedUser))
          }
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [authUser])
  
  // Show loading state or get user from localStorage as fallback
  const user = profile || (() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    }
    return null
  })()

  return (
    <div className="space-y-4 sticky top-20">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {user ? (
            <>
              <Link href="/profile" className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profile_pic || "/placeholder.svg?height=48&width=48"} alt={user.username} />
                  <AvatarFallback>{user.username ? user.username.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </Link>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-medium">{user.post_count || 0}</p>
                  <p className="text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="font-medium">{user.follower_count || 0}</p>
                  <p className="text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="font-medium">{user.following_count || 0}</p>
                  <p className="text-muted-foreground">Following</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-2 text-sm text-muted-foreground">
              {loading ? "Loading profile..." : "Profile not available"}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid gap-1">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Suggested Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2 text-sm text-muted-foreground">
            Follow people to customize your experience
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

