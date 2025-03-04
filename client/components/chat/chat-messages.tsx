"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Info, Paperclip, Phone, Send, Smile, Video } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Message {
  id: number
  text: string
  timestamp: string
  isOwn: boolean
  status?: "sent" | "delivered" | "read"
}

interface Conversation {
  id: number
  user: {
    id: number
    name: string
    username: string
    avatar: string
    isOnline: boolean
  }
  lastMessage: {
    text: string
    timestamp: string
    isRead: boolean
    isOwn: boolean
  }
  unreadCount: number
}

interface ChatMessagesProps {
  conversation: Conversation
  onOpenSidebar: () => void
}

export function ChatMessages({ conversation, onOpenSidebar }: ChatMessagesProps) {
  const [messageText, setMessageText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Fetch messages for this conversation
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true)
        // Replace with your actual API call
        const response = await fetch(`/api/conversations/${conversation.id}/messages`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
        setMessages([]) // Reset to empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    if (conversation.id) {
      fetchMessages()
    }
  }, [conversation.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      try {
        // Create a temporary message to show immediately
        const tempMessage: Message = {
          id: Date.now(), // Temporary ID
          text: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isOwn: true,
          status: "sent",
        }

        // Add to UI immediately for better UX
        setMessages(prev => [...prev, tempMessage])
        setMessageText("")
        
        // Send to API
        const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: messageText }),
        })
        
        if (!response.ok) throw new Error('Failed to send message')
        
        // Get the real message with server ID
        const realMessage = await response.json()
        
        // Replace the temporary message with the real one
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? realMessage : msg
        ))
      } catch (error) {
        console.error('Error sending message:', error)
        toast.error('Failed to send message')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back to conversations</span>
          </Button>

          <Link href={`/profile/${conversation.user.username}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
              <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div>
              <div className="font-medium">{conversation.user.name}</div>
              <div className="text-xs text-muted-foreground">{conversation.user.isOnline ? "Online" : "Offline"}</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
            <span className="sr-only">Call</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
            <span className="sr-only">Video call</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
            <span className="sr-only">Info</span>
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                <div className="flex gap-2 max-w-[80%]">
                  {!message.isOwn && (
                    <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                      <AvatarImage src={conversation.user.avatar} alt={conversation.user.name} />
                      <AvatarFallback>{conversation.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>

                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>{message.timestamp}</span>
                      {message.isOwn && message.status && (
                        <span className="ml-2">
                          {message.status === "sent" && "✓"}
                          {message.status === "delivered" && "✓✓"}
                          {message.status === "read" && "✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>

          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />

          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Smile className="h-5 w-5" />
            <span className="sr-only">Emoji</span>
          </Button>

          <Button size="icon" className="flex-shrink-0" onClick={handleSendMessage} disabled={!messageText.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

