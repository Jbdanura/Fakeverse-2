"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      try {
        // Get token from local storage
        const token = localStorage.getItem("token")
        
        if (!token) {
          // No token found, user is not authenticated
          handleUnauthenticated()
          return
        }
        
        // Validate token with backend
        try {
          await auth.validateToken()
          
          // Token is valid, get user data
          const userData = localStorage.getItem("user")
          if (userData) {
            setUser(JSON.parse(userData))
          }
        } catch (error) {
          // Token is invalid or expired
          console.error("Token validation failed:", error)
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          handleUnauthenticated()
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Handle unauthenticated state
  const handleUnauthenticated = () => {
    setUser(null)
    
    // Check if current route is protected
    const publicRoutes = ["/login", "/register"]
    if (!publicRoutes.includes(pathname)) {
      // Redirect to login if on a protected route
      router.push("/login")
    }
  }

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
      
      // Use window.location for a complete page refresh
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