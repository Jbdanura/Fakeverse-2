import { Navbar } from "@/components/navbar"
import { ChatInterface } from "@/components/chat/chat-interface"

export default function ChatPage() {
  const baseUrl = "http://localhost:5000"
  /*const baseUrl = "https://fakeverse-2.onrender.com"*/
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-0 md:px-4 py-0 md:py-6 h-[calc(100vh-64px)]">
        <ChatInterface baseUrl={baseUrl}/>
      </div>
    </div>
  )
}

