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
    
    // If not loading and not authenticated and not on a public route
    if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
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
  
  // If not authenticated and not on a public route, don't render children
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null
  }

  // Render children for authenticated users or on public routes
  return <>{children}</>
} 