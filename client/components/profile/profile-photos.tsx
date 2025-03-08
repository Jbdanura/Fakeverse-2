import Image from "next/image"
import { Card } from "@/components/ui/card"

export function ProfilePhotos() {
  // Sample photos data
  const photos = [
    { id: 1, src: "/placeholder.svg?height=300&width=300&text=Photo+1", alt: "Photo 1" },
    { id: 2, src: "/placeholder.svg?height=300&width=300&text=Photo+2", alt: "Photo 2" },
    { id: 3, src: "/placeholder.svg?height=300&width=300&text=Photo+3", alt: "Photo 3" },
    { id: 4, src: "/placeholder.svg?height=300&width=300&text=Photo+4", alt: "Photo 4" },
    { id: 5, src: "/placeholder.svg?height=300&width=300&text=Photo+5", alt: "Photo 5" },
    { id: 6, src: "/placeholder.svg?height=300&width=300&text=Photo+6", alt: "Photo 6" },
    { id: 7, src: "/placeholder.svg?height=300&width=300&text=Photo+7", alt: "Photo 7" },
    { id: 8, src: "/placeholder.svg?height=300&width=300&text=Photo+8", alt: "Photo 8" },
    { id: 9, src: "/placeholder.svg?height=300&width=300&text=Photo+9", alt: "Photo 9" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={photo.src || "/placeholder.svg"}
              alt={photo.alt}
              fill
              className="object-cover transition-all hover:scale-105"
            />
          </div>
        </Card>
      ))}
    </div>
  )
}

