import { ReactNode } from 'react'
import React from 'react'

interface Props {
  children: ReactNode
  bgColor?: string
  style?: string
}

export default function SectionProjects({
  children,
  bgColor = '#f0f0f0',
}: Props) {
  return (
    <div className={`bg-[${bgColor}]`}>
      <div className="mx-auto w-[1300px] max-w-full p-6 pb-16">{children}</div>
    </div>
  )
}
