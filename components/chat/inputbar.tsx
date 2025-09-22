"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowUp,
  Paperclip,
  Mic,
  X,
  Upload
} from "lucide-react"

type InputAreaProps = {
  input: string
  setInput: (input: string) => void
  selectedImages: Array<{id: string, url: string, name: string}>
  setSelectedImages: (images: Array<{id: string, url: string, name: string}>) => void
  isLoading: boolean
  isDragOver: boolean
  setIsDragOver: (isDragOver: boolean) => void
  onSendMessage: (content: string) => void
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onStartListening: () => void
  isListening: boolean
  fileToBase64: (file: File) => Promise<string>
}

export function InputArea({
  input,
  setInput,
  selectedImages,
  setSelectedImages,
  isLoading,
  isDragOver,
  setIsDragOver,
  onSendMessage,
  onImageUpload,
  onStartListening,
  isListening,
  fileToBase64
}: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragOverlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      return
    }

    for (const file of imageFiles) {
      try {
        const base64 = await fileToBase64(file)
        const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        setSelectedImages([...selectedImages, {
          id: imageId,
          url: base64,
          name: file.name
        }])
      } catch (error) {
        console.error(`Failed to process ${file.name}`)
      }
    }
  }

  const removeImage = (imageId: string) => {
    setSelectedImages(selectedImages.filter((img: {id: string, url: string, name: string}) => img.id !== imageId))
  }

  return (
    <div className="w-full relative">
      {/* Drag Overlay */}
      {isDragOver && (
        <div
          ref={dragOverlayRef}
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
          <div className="mx-4 max-w-md w-full">
            <div className="text-center px-6 py-8 rounded-xl bg-card/90 border-2 border-dashed border-primary/30 shadow-lg">
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Drop images to upload</h3>
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP • Max 500KB each</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {selectedImages.length > 0 && (
        <div className="mb-3 p-3 bg-card/20 backdrop-blur-md hover:bg-muted/60 border border-border/30 rounded-xl shadow-sm">
          <div className="flex flex-wrap gap-3">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-24 h-24 object-cover rounded-lg border border-border/50 shadow-sm"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  title="Remove image"
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors opacity-0 group-hover:opacity-100 shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/80 to-transparent text-foreground text-[10px] px-2 py-1 rounded-b-lg">
                  <div className="truncate">{image.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="relative flex items-end"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSendMessage(input)
            }
          }}
          placeholder={isDragOver ? "Drop images here..." : "Message Arc"}
          className={cn(
            "w-full bg-background/20 backdrop-blur-md p-4 border-border/50 rounded-2xl pl-4 pr-36 py-4 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none min-h-[56px] max-h-32 border shadow-lg text-foreground placeholder:text-muted-foreground transition-all duration-200",
            isDragOver
              ? "border-primary/40 ring-2 ring-primary/20 bg-primary/5"
              : "border-border/50"
          )}
          style={{ scrollbarWidth: "none" }}
          rows={1}
          disabled={isLoading}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="hidden"
            disabled={isLoading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 flex items-center justify-center rounded-lg p-2 transition-all duration-200 disabled:opacity-50 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            title="Attach images"
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach image</span>
          </Button>
          <Button
            onClick={onStartListening}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-secondary p-2 hover:bg-secondary/80 transition-colors disabled:opacity-50 text-secondary-foreground"
            disabled={isListening || isLoading}
            title="Voice input"
          >
            <Mic className={`h-5 w-5 ${isListening ? "text-red-500" : ""}`} />
            <span className="sr-only">Start voice input</span>
          </Button>
          <Button
            onClick={() => onSendMessage(input)}
            className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary p-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground"
            disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
            title="Send message"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
