import { useRef, useState } from 'react'
import { ImagePlus, X, UploadCloud } from 'lucide-react'
import { cn } from '../../../shared/utils/cn'
import type { EmailImageAsset } from '../schemas'

const MAX_IMAGES = 6
const MAX_FILE_SIZE = 2 * 1024 * 1024

type ImageUploaderProps = {
  images: EmailImageAsset[]
  onChange: (images: EmailImageAsset[]) => void
}

export const ImageUploader = ({ images, onChange }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleSelectFiles = (files: FileList | null) => {
    if (!files?.length) return

    const nextImages = [...images]
    for (const file of Array.from(files)) {
      if (nextImages.length >= MAX_IMAGES) break
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_FILE_SIZE) continue

      // Generate a temporary browser-only object URL for local rendering
      const blobUrl = URL.createObjectURL(file)
      nextImages.push({
        id: crypto.randomUUID(),
        alt_text: file.name.replace(/\.[^.]+$/, ''),
        data_url: blobUrl,
      })
    }
    onChange(nextImages)
  }

  const handleRemove = (id: string) => {
    // Revoke the blob URL to free memory if it was a local object URL
    const removedImage = images.find((image) => image.id === id)
    if (removedImage && removedImage.data_url.startsWith('blob:')) {
      URL.revokeObjectURL(removedImage.data_url)
    }
    onChange(images.filter((image) => image.id !== id))
  }

  const handleUpdateAltText = (id: string, newAltText: string) => {
    onChange(
      images.map((image) => {
        if (image.id !== id) return image

        let dataUrl = image.data_url
        // If it was already sanitized to a placeholder, sync the text in the placeholder URL
        if (dataUrl.startsWith('https://placehold.co/')) {
          dataUrl = `https://placehold.co/600x400?text=${encodeURIComponent(newAltText)}`
        }

        return {
          ...image,
          alt_text: newAltText,
          data_url: dataUrl,
        }
      }),
    )
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleSelectFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          handleSelectFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {images.length === 0 ? (
        /* Large Drag & Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-150 h-36',
            isDragging
              ? 'border-accent bg-accent-soft/20 scale-[0.98]'
              : 'border-border-strong bg-surface-muted hover:bg-surface-muted/60 hover:border-border-strong',
          )}
        >
          <UploadCloud className="size-8 text-accent animate-bounce" />
          <p className="text-xs font-semibold text-text mt-2">
            Bilder hierhin ziehen oder klicken
          </p>
          <p className="text-[10px] text-muted mt-1">
            Max. 6 Bilder (JPG, PNG), je bis zu 2 MB
          </p>
        </div>
      ) : (
        /* Image Grid with Small Uploader Card */
        <ul className="grid grid-cols-2 gap-3">
          {images.map((image) => (
            <li
              key={image.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface shadow-soft flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="relative h-24 w-full bg-field overflow-hidden">
                <img
                  src={image.data_url}
                  alt={image.alt_text}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md bg-canvas/80 text-muted-soft backdrop-blur-sm transition-colors duration-150 hover:bg-error-soft hover:text-error cursor-pointer"
                  onClick={() => handleRemove(image.id)}
                  aria-label={`Bild „${image.alt_text}" entfernen`}
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden />
                </button>
              </div>

              {/* Alt Text Input field */}
              <div className="p-2 border-t border-border bg-surface-elevated">
                <input
                  type="text"
                  value={image.alt_text}
                  onChange={(e) => handleUpdateAltText(image.id, e.target.value)}
                  placeholder="Alt-Text (z.B. Produktfoto)"
                  className="w-full rounded bg-field border border-border px-1.5 py-1 text-[10px] text-text placeholder:text-muted-soft outline-none focus:border-accent"
                  title="Bildbeschreibung bearbeiten (Alt-Text)"
                />
              </div>
            </li>
          ))}

          {/* Inline Upload Card */}
          {images.length < MAX_IMAGES && (
            <li
              onClick={() => inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-[134px] cursor-pointer transition-all text-muted-soft hover:text-accent',
                isDragging
                  ? 'border-accent bg-accent-soft/20 scale-[0.98]'
                  : 'border-border bg-surface-muted hover:bg-surface-muted/60 hover:border-border-strong',
              )}
            >
              <ImagePlus className="size-6 mb-1 text-muted" />
              <span className="text-[11px] font-semibold">Bild hinzufügen</span>
              <span className="text-[9px] text-muted-soft mt-0.5">
                ({images.length}/{MAX_IMAGES})
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
