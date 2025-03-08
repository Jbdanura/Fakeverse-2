import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Feed } from "@/components/feed"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="md:col-span-2">
          <Feed />
        </div>
      </div>
    </div>
  )
}

