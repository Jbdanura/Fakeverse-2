import { Button } from "@/components/ui/button"
import { ChevronLeft, MessageSquare } from "lucide-react"

interface ChatEmptyProps {
  onOpenSidebar: () => void
}

export function ChatEmpty({ onOpenSidebar }: ChatEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <Button variant="ghost" size="icon" className="md:hidden mb-4" onClick={onOpenSidebar}>
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Open conversations</span>
      </Button>

      <div className="flex flex-col items-center max-w-md">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
        <p className="text-muted-foreground mb-4">
          Select a conversation from the sidebar or start a new chat to begin messaging.
        </p>
        <Button>Start a new conversation</Button>
      </div>
    </div>
  )
}

