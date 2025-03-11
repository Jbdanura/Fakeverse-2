"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Feed } from "@/components/feed"
import { useState,useEffect } from "react"

export default function HomePage() {

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token")
      if (storedToken) {
        setToken(storedToken)
      } else {
        console.warn("No token found in localStorage. The user might need to log in.")
      }
    }
  }, [])

  const baseUrl = "http://localhost:5000"
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="md:col-span-2">
          <Feed baseUrl={baseUrl}/>
        </div>
      </div>
    </div>
  )
}

