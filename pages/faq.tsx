//pages/faq.tsx

import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import faqData from '../data/pages/faq.json'
import { FAQSection } from '@/components/FAQSection'
import { PageSEO } from '@/components/SEO'

export const getStaticProps = async () => {
  const page = allPages.find((p) => p.slug === 'faq')
  return { props: { page, faqDataModule: faqData } }
}

export default function FAQ({
  page,
  faqDataModule,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!page) {
    return <div>Error: FAQ page content not found.</div>
  }

  return (
    <>
      <PageSEO title={`Lite.Space | FAQ`} description={`${page.summary}`} />
      <h1 className="pl-4 pt-10 font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 xs:text-6xl sm:leading-10 md:text-7xl md:leading-14 xl:col-span-2">
        FAQ
      </h1>
      <div className="mt-0 rounded-xl bg-gradient-to-b from-gray-200 to-white pt-0 dark:from-gray-800 dark:to-gray-900 dark:text-gray-300 xs:px-1 md:px-4 lg:px-8">
        <FAQSection faqCategories={faqDataModule.questionsAndAnswers} />
      </div>
    </>
  )
}
