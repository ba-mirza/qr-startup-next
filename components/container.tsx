"use client"

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  'data-id'?: string
}

export const Container = ({
  children,
  className = '',
  'data-id': dataId,
}: ContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y: 8,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.1,
          ease: 'power2.out',
        },
      )
    }
  }, [])
  return (
    <div
      ref={containerRef}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      data-id={dataId}
    >
      {children}
    </div>
  )
}
