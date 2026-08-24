'use client'

import { useState } from 'react'

export default function RoomGallery({
  images,
  roomName,
}: {
  images: string[]
  roomName: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  function showPrevious() {
    setCurrentIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    )
  }

  function showNext() {
    setCurrentIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    )
  }

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl bg-stone-900">
      <img
        src={images[currentIndex]}
        alt={`${roomName} 圖片 ${currentIndex + 1}`}
        className="h-[320px] w-full object-cover md:h-[560px]"
      />

      <button
        type="button"
        onClick={showPrevious}
        aria-label="上一張圖片"
        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/75"
      >
        ←
      </button>

      <button
        type="button"
        onClick={showNext}
        aria-label="下一張圖片"
        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/75"
      >
        →
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            aria-label={`顯示第 ${index + 1} 張圖片`}
            className={`h-2.5 rounded-full transition ${
              index === currentIndex
                ? 'w-7 bg-amber-400'
                : 'w-2.5 bg-white/60 hover:bg-white'
            }`}
          />
        ))}
      </div>

      <p className="absolute bottom-4 right-5 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
        {currentIndex + 1} / {images.length}
      </p>
    </div>
  )
}