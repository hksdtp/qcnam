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
  appName = "BÁO CÁO CHI TIÊU",
  logoColor = "white",
  backgroundColor = "#E51A22",
  onLoadingComplete,
}: LoadingScreenProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [isRemoved, setIsRemoved] = useState(false)

  useEffect(() => {
    // Lắng nghe sự kiện khi animation 'wipe-effect' kết thúc
    const wipeOverlay = document.querySelector(`.${styles.wipeOverlay}`)

    const handleAnimationEnd = () => {
      // Thêm class 'hidden' để bắt đầu hiệu ứng fade-out
      setIsHidden(true)

      // Sau khi hiệu ứng fade-out kết thúc, ẩn hẳn loading screen
      setTimeout(() => {
        setIsRemoved(true)
        if (onLoadingComplete) {
          onLoadingComplete()
        }
      }, 1000) // Increased from 600ms to 1000ms
    }

    if (wipeOverlay) {
      wipeOverlay.addEventListener("animationend", handleAnimationEnd)
    }

    // Fallback: Nếu có lỗi gì đó với event 'animationend',
    // vẫn ẩn loading screen sau một khoảng thời gian tổng
    const fallbackTimer = setTimeout(() => {
      if (!isHidden) {
        setIsHidden(true)
        setTimeout(() => {
          setIsRemoved(true)
          if (onLoadingComplete) {
            onLoadingComplete()
          }
        }, 1000) // Increased from 600ms to 1000ms
      }
    }, 7000) // Increased from 4500ms to 7000ms to account for much longer animation sequence

    return () => {
      if (wipeOverlay) {
        wipeOverlay.removeEventListener("animationend", handleAnimationEnd)
      }
      clearTimeout(fallbackTimer)
    }
  }, [isHidden, onLoadingComplete])

  if (isRemoved) {
    return null
  }

  return (
    <div className={`${styles.loadingScreen} ${isHidden ? styles.hidden : ""}`} style={{ backgroundColor }}>
      <div className={styles.logoContainer}>
        <div className={styles.logoText}>{appName}</div>
      </div>
      <div className={styles.wipeOverlay} />
    </div>
  )
}
