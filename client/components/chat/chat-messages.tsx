"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, Info, Paperclip, Phone, Send, Smile, Video } from "lucide-react"
import Link from "next/link"

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
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Generate some sample messages when conversation changes
  useEffect(() => {
    const sampleMessages: Message[] = [
      {
        id: 1,
        text: "Hey there! How's it going?",
        timestamp: "10:30 AM",
        isOwn: false,
      },
      {
        id: 2,
        text: "I'm doing well, thanks for asking! Just working on some new projects.",
        timestamp: "10:32 AM",
        isOwn: true,
        status: "read",
      },
      {
        id: 3,
        text: "That sounds interesting! What kind of projects are you working on?",
        timestamp: "10:33 AM",
        isOwn: false,
      },
      {
        id: 4,
        text: "I'm building a new social media app with React and Next.js. It's coming along really well!",
        timestamp: "10:35 AM",
        isOwn: true,
        status: "read",
      },
      {
        id: 5,
        text: "That's awesome! I'd love to see it when you're ready to share.",
        timestamp: "10:36 AM",
        isOwn: false,
      },
      {
        id: 6,
        text: "Definitely! I'll send you a link once I have a demo ready.",
        timestamp: "10:38 AM",
        isOwn: true,
        status: "read",
      },
      {
        id: 7,
        text: "Looking forward to it! Are you using any specific UI libraries?",
        timestamp: "10:40 AM",
        isOwn: false,
      },
      {
        id: 8,
        text: conversation.lastMessage.isOwn
          ? "Yes, I'm using Tailwind CSS and shadcn/ui components. They make building a nice UI so much faster."
          : "That sounds great! I'll check it out.",
        timestamp: conversation.lastMessage.timestamp,
        isOwn: conversation.lastMessage.isOwn,
        status: "read",
      },
    ]

    setMessages(sampleMessages)
  }, [conversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOwn: true,
        status: "sent",
      }

      setMessages([...messages, newMessage])
      setMessageText("")
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

          <Link href="/profile" className="flex items-center gap-3">
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

