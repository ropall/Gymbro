import { useState, useRef } from 'react'
import { useMetricsStore } from '../../stores/metricsStore'
import { formatDate } from '../../utils/calculations'

export function PhotosSection() {
  const photoEntries = useMetricsStore((state) => state.photoEntries)
  const addPhoto = useMetricsStore((state) => state.addPhoto)
  const removePhoto = useMetricsStore((state) => state.removePhoto)

  const [fecha, setFecha] = useState('')
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        addPhoto(reader.result, fecha || undefined)
        setFecha('')
        if (inputRef.current) inputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="bg-brand-card rounded-lg p-4 border border-brand-border mt-4">
      <h3 className="text-brand-lightAccent font-semibold mb-3 font-heading">
        Fotos de progreso
      </h3>

      <div className="flex flex-col gap-2 mb-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="photo-upload"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-primaryText min-h-[48px]"
          />
          <label
            htmlFor="photo-upload"
            className="flex-1 bg-brand-accent text-white rounded px-4 py-2 font-medium text-center min-h-[48px] flex items-center justify-center active:bg-brand-lightAccent transition-colors cursor-pointer"
          >
            Subir foto
          </label>
        </div>
      </div>

      {photoEntries.length === 0 ? (
        <p className="text-brand-mutedText text-sm">Aún no hay fotos de progreso.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photoEntries.map((photo) => (
            <div key={photo.id} className="relative group">
              <button
                onClick={() => setViewerUrl(photo.url)}
                className="w-full aspect-square rounded overflow-hidden border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-lightAccent"
              >
                <img
                  src={photo.url}
                  alt={`Foto del ${formatDate(photo.fecha)}`}
                  className="w-full h-full object-cover"
                />
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                {formatDate(photo.fecha)}
              </span>
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 bg-brand-dangerBg text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Eliminar foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {viewerUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewerUrl(null)}
        >
          <img
            src={viewerUrl}
            alt="Foto de progreso"
            className="max-w-full max-h-full rounded"
          />
        </div>
      )}
    </div>
  )
}
