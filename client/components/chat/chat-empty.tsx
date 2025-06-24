"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, MessageSquare } from "lucide-react";

interface ChatEmptyProps {
  onOpenSidebar: () => void;
  onStartChat: (username: string,message:string) => void;
}

export function ChatEmpty({ onOpenSidebar, onStartChat }: ChatEmptyProps) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden mb-4"
        onClick={onOpenSidebar}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Open conversations</span>
      </Button>

      <div className="flex flex-col items-center max-w-md">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
        <p className="text-muted-foreground mb-4">
          Start a new chat by entering a username below.
        </p>
        <input
          type="text"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <Button
          onClick={() => {
            if (username.trim()) onStartChat(username.trim(), message);
          }}
        >
          Start Conversation
        </Button>
      </div>
    </div>
  );
}
