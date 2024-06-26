//PAGES/PRIVACY.TSX
import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'privacy')
  return { props: { page: page } }
}

export default function Privacy({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!page) {
    return <div>Error: Privacy page content not found.</div>
  }
  return (
    <MDXLayoutRenderer
      layout={page.layout || DEFAULT_LAYOUT}
      content={page}
      MDXComponents={MDXComponents}
    />
  )
}
