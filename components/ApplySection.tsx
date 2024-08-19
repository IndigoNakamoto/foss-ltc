import { ReactNode } from 'react'
import PageHeading from '@/components/PageHeading'
import React from 'react'

interface Props {
  children: ReactNode
  title: string
  style?: string
}

export default function ApplySection({
  title,
  children,
  style = 'markdown',
}: Props) {
  return (
    <div className="bg-white">
      <div className=" m-auto my-auto w-[1300px] max-w-[90%] bg-white py-32">
        <h1 className="markdown m-auto items-center font-space-grotesk text-4xl font-semibold">
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}
