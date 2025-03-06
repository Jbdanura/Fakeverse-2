"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { auth } from "@/lib/api"
import { toast } from "sonner"

interface User {
  id: number
  username: string
  email: string
  profile_pic?: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (userData: { username: string; email: string; password: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // Add a ref to track whether initial auth check is complete
  const initialAuthCheckComplete = useRef(false)
  // Add a ref to track last refresh time
  const lastRefreshTime = useRef(0)

  // Get user data from localStorage
  const getUserFromStorage = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem("user")
      if (userData) {
        try {
          return JSON.parse(userData)
        } catch (e) {
          console.error("Failed to parse user data:", e)
        }
      }
    }
    return null
  }

  const refreshUser = async () => {
    // Prevent excessive refreshes - only refresh once every 5 minutes
    const now = Date.now()
    if (now - lastRefreshTime.current < 5 * 60 * 1000) {
      return user || getUserFromStorage()
    }
    
    // Only attempt if we have a token
    if (typeof window !== 'undefined' && localStorage.getItem("token")) {
      try {
        const response = await auth.validateToken()
        if (response && response.user) {
          // Make sure user data has all required fields
          const updatedUser = {
            ...response.user,
            post_count: response.user.post_count || 0,
            follower_count: response.user.follower_count || 0,
            following_count: response.user.following_count || 0
          };
          
          localStorage.setItem("user", JSON.stringify(updatedUser))
          setUser(updatedUser)
          lastRefreshTime.current = now
          return updatedUser
        }
      } catch (error) {
        console.warn("Failed to refresh user:", error)
      }
    }
    
    // Return current stored user as fallback
    return user || getUserFromStorage()
  }

  // Check if user is already logged in on mount - ONCE ONLY
  useEffect(() => {
    // Skip if initial auth check is already complete
    if (initialAuthCheckComplete.current) return
    
    const checkAuth = async () => {
      setIsLoading(true)
      
      try {
        // Get token from local storage
        const token = localStorage.getItem("token")
        
        if (!token) {
          // No token found, user is not authenticated
          setUser(null)
          
          // Only redirect if on a protected route
          const publicRoutes = ["/login", "/register"]
          if (!publicRoutes.includes(pathname)) {
            router.push("/login")
          }
          return
        }
        
        // If we have a token, get user from localStorage first
        const storedUser = getUserFromStorage()
        if (storedUser) {
          setUser(storedUser)
        }
        
        // Try to validate token, but don't log out if it fails
        try {
          await refreshUser()
        } catch (error) {
          console.warn("Token validation failed, but continuing with stored user:", error)
        }
      } finally {
        setIsLoading(false)
        initialAuthCheckComplete.current = true
      }
    }
    
    checkAuth()
  }, [pathname, router])

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    
    try {
      const response = await auth.login(credentials)
      
      // Store token and user info
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      
      setUser(response.user)
      toast.success("Successfully logged in!")
      
      // Use window.location for a complete page refresh to ensure clean state
      window.location.href = "/"
      return true
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("Login failed. Please check your credentials.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: { username: string; email: string; password: string }) => {
    setIsLoading(true)
    
    try {
      await auth.register(userData)
      toast.success("Registration successful! Please log in.")
      router.push("/login")
    } catch (error) {
      console.error("Registration failed:", error)
      toast.error("Registration failed. Please try again.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  
  return context
} 