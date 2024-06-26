import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { MDXComponents } from '@/components/MDXComponents'
import React from 'react'

const DEFAULT_LAYOUT = 'PageLayout'

export const getStaticProps = async () => {
  //   console.log(
  //     'allPages: ',
  //     allPages.map((page) => page.slug)
  //   )
  const page = allPages.find((p) => p.slug === 'grant-policy')
  return { props: { page: page } }
}

export default function FAQ({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!page) {
    return <div>Error: FAQ page content not found.</div>
  }

  return (
    <MDXLayoutRenderer
      layout={page.layout || DEFAULT_LAYOUT}
      content={page}
      MDXComponents={MDXComponents}
    />
  )
}
