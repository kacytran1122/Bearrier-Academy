"use client"

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react"

type LazyImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string
  /** Load immediately instead of waiting for the element to scroll into view. */
  eager?: boolean
  /** How early to begin loading before the image enters the viewport. */
  rootMargin?: string
}

// A tiny, dependency-free lazy <img>. The download only starts once the element
// is about to enter the viewport (via IntersectionObserver), then the image
// fades in when its bytes arrive. It degrades gracefully: if IntersectionObserver
// is unavailable (old browsers / SSR), it just loads right away. Cached images
// that are already decoded are detected so they never get stuck invisible.
export default function LazyImage({
  src,
  alt = "",
  className = "",
  eager = false,
  rootMargin = "200px",
  onLoad,
  onError,
  ...rest
}: LazyImageProps) {
  const ref = useRef<HTMLImageElement | null>(null)
  // Start "shown" when eager; otherwise wait for the observer to fire.
  const [show, setShow] = useState(eager)
  const [loaded, setLoaded] = useState(false)

  // A new source means a fresh fade-in. Reset during render (the recommended
  // pattern) rather than in an effect so there's no extra paint of the stale image.
  const [prevSrc, setPrevSrc] = useState(src)
  if (src !== prevSrc) {
    setPrevSrc(src)
    setLoaded(false)
  }

  // Reveal the source once the element scrolls near the viewport.
  useEffect(() => {
    if (show) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      setShow(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [show, rootMargin])

  // If the browser served the image from cache, `onLoad` can fire before React
  // wires up its handler — catch that so the image still fades in.
  useEffect(() => {
    const el = ref.current
    if (show && el?.complete && el.naturalWidth > 0) setLoaded(true)
  }, [show, src])

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional raw <img>: this is a custom lazy loader
    <img
      ref={ref}
      src={show ? src : undefined}
      alt={alt}
      decoding="async"
      className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      onLoad={(e) => {
        setLoaded(true)
        onLoad?.(e)
      }}
      onError={onError}
      {...rest}
    />
  )
}
