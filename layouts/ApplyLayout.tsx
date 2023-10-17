import { ReactNode } from 'react'
import type { Pages } from 'contentlayer/generated'
import { PageSEO } from '@/components/SEO'
import ApplySection from '@/components/ApplySection'
import { CoreContent } from 'pliny/utils/contentlayer'

interface Props {
  children: ReactNode
  content: CoreContent<Pages>
}

export default function ApplyLayout({ children, content }: Props) {
  const { title = '', summary = '' } = content

  return (
    <>
      <PageSEO title={`Lite.Space | ${title}`} description={`${summary}`} />
      <ApplySection title={title}>{children}</ApplySection>
    </>
  )
}
