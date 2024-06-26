import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'

const DEFAULT_LAYOUT = 'ApplyLayout'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'submitted')
  return { props: { page: page } }
}

export default function Mission({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!page) {
    return <div>Error: Submitted page content not found.</div>
  }
  return (
    <MDXLayoutRenderer
      layout={'ApplyLayout'}
      content={page}
      MDXComponents={MDXComponents}
    />
  )
}
