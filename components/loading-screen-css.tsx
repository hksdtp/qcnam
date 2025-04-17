"use client"

import { useEffect, useState } from "react"
import styles from "./loading-screen.module.css"

interface LoadingScreenProps {
  appName?: string
  logoColor?: string
  backgroundColor?: string
  onLoadingComplete?: () => void
}

export function LoadingScreen({
  appName = "TÊN WEB CỦA BẠN",
  logoColor = "white",
  backgroundColor = "#E51A22",
  onLoadingComplete,
}: LoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  useEffect(() => {
    const handleWipeAnimationEnd = () => {
      setIsHidden(true)

      // Sau khi hiệu ứng fade-out (0.5s) kết thúc, ẩn hẳn loading screen
      setTimeout(() => {
        setIsRemoved(true)
        if (onLoadingComplete) {
          onLoadingComplete()
        }
      }, 500)
    }

    // Lắng nghe sự kiện khi animation 'wipe-effect' kết thúc
    const wipeOverlay = document.querySelector(`.${styles.wipeOverlay}`)
    if (wipeOverlay) {
      wipeOverlay.addEventListener("animationend", handleWipeAnimationEnd)
    }

    // Fallback: Nếu có lỗi gì đó với event 'animationend',
    // vẫn ẩn loading screen sau một khoảng thời gian tổng
    const fallbackTimer = setTimeout(() => {
      setIsHidden(true)
      setTimeout(() => {
        setIsRemoved(true)
        if (onLoadingComplete) {
          onLoadingComplete()
        }
      }, 500)
    }, 2000)

    return () => {
      if (wipeOverlay) {
        wipeOverlay.removeEventListener("animationend", handleWipeAnimationEnd)
      }
      clearTimeout(fallbackTimer)
    }
  }, [onLoadingComplete])

  if (isRemoved) {
    return null
  }

  return (
    <div className={`${styles.loadingScreen} ${isHidden ? styles.hidden : ""}`} style={{ backgroundColor }}>
      <div className={styles.logoContainer}>
        <svg className={styles.logoIcon} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,0 75,50 50,100 25,50" fill={logoColor} />
        </svg>
        <div className={styles.logoText}>{appName}</div>
      </div>
      <div className={styles.wipeOverlay} />
    </div>
  )
}
