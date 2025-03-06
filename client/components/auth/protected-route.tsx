"use client"

import { ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // List of public routes that don't require authentication
    const publicRoutes = ["/login", "/register"]
    
    // Check if token exists regardless of authentication state
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')
    
    // Only redirect if:
    // 1. Not loading AND
    // 2. Not authenticated AND
    // 3. No token exists AND
    // 4. Not on a public route
    if (!isLoading && !isAuthenticated && !hasToken && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // List of public routes that don't require authentication
  const publicRoutes = ["/login", "/register"]
  
  // Check if token exists regardless of authentication state
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')
  
  // If not authenticated, no token, and not on a public route, don't render children
  if (!isAuthenticated && !hasToken && !publicRoutes.includes(pathname)) {
    return null
  }

  // Render children otherwise
  return <>{children}</>
} 