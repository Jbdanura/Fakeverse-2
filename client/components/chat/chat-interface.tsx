"use client"

import { useState, useEffect } from "react"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { ChatMessages } from "@/components/chat/chat-messages"
import { ChatEmpty } from "@/components/chat/chat-empty"
import { toast } from "sonner"

// Sample conversations data
export const conversations = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      isOnline: true,
    },
    lastMessage: {
      text: "That sounds great! I'll check it out.",
      timestamp: "10:42 AM",
      isRead: true,
      isOwn: false,
    },
    unreadCount: 0,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Mike Peters",
      username: "mikepeters",
      avatar: "/placeholder.svg?height=40&width=40&text=MP",
      isOnline: true,
    },
    lastMessage: {
      text: "Hey, are you going to the event tomorrow?",
      timestamp: "Yesterday",
      isRead: false,
      isOwn: false,
    },
    unreadCount: 3,
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=40&width=40&text=EW",
      isOnline: false,
    },
    lastMessage: {
      text: "Thanks for sharing those photos!",
      timestamp: "Yesterday",
      isRead: true,
      isOwn: true,
    },
    unreadCount: 0,
  },
  {
    id: 4,
    user: {
      id: 4,
      name: "Alex Morgan",
      username: "alexm",
      avatar: "/placeholder.svg?height=40&width=40&text=AM",
      isOnline: false,
    },
    lastMessage: {
      text: "I'll send you the details later today.",
      timestamp: "Monday",
      isRead: true,
      isOwn: false,
    },
    unreadCount: 0,
  },
  {
    id: 5,
    user: {
      id: 5,
      name: "Taylor Swift",
      username: "tswift",
      avatar: "/placeholder.svg?height=40&width=40&text=TS",
      isOnline: true,
    },
    lastMessage: {
      text: "Did you see the new coffee shop that opened downtown?",
      timestamp: "Monday",
      isRead: true,
      isOwn: false,
    },
    unreadCount: 0,
  },
]

export function ChatInterface() {
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true)
        // Replace with your actual API call
        const response = await fetch('/api/conversations')
        if (!response.ok) throw new Error('Failed to fetch conversations')
        
        const data = await response.json()
        setConversations(data)
      } catch (error) {
        console.error('Error fetching conversations:', error)
        toast.error('Failed to load conversations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const handleConversationSelect = (conversationId) => {
    setActiveConversation(conversationId)
    setIsMobileSidebarOpen(false)
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const selectedConversation = conversations.find((conv) => conv.id === activeConversation)

  return (
    <div className="flex h-full rounded-lg overflow-hidden border bg-background">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p>Loading conversations...</p>
        </div>
      ) : (
        <>
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversation}
            onSelectConversation={handleConversationSelect}
            isMobileOpen={isMobileSidebarOpen}
            className="w-full md:w-80 lg:w-96 border-r md:flex"
          />

          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatMessages 
                conversation={selectedConversation} 
                onOpenSidebar={toggleMobileSidebar} 
              />
            ) : (
              <ChatEmpty onOpenSidebar={toggleMobileSidebar} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

