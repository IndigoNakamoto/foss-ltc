import '@/css/tailwind.css'
import '@/css/prism.css'
import 'katex/dist/katex.css'
// import '@/css/docsearch.css' // Uncomment if using algolia docsearch
// import '@docsearch/css' // Uncomment if using algolia docsearch
import 'styles/globals.css'

import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { SessionProvider } from 'next-auth/react' // <-- Import here

import siteMetadata from '@/data/siteMetadata'
// import { Analytics } from 'pliny/analytics'
import { Analytics } from '@vercel/analytics/react'
import { SearchProvider } from 'pliny/search'
import LayoutWrapper from '@/components/LayoutWrapper'
import localFont from 'next/font/local'

const barlowSemiCondensed = localFont({
  src: [
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-ThinItalic.ttf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../public/fonts/Barlow_Semi_Condensed/BarlowSemiCondensed-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
})

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme}>
      <SessionProvider session={session}>
        {' '}
        {/* <-- Wrap your components here */}
        <Head>
          <meta content="width=device-width, initial-scale=1" name="viewport" />
        </Head>
        {/* @ts-ignore */}
        <Analytics analyticsConfig={...pageProps} />
        <LayoutWrapper>
          <div className={barlowSemiCondensed.className}>
            {/* @ts-ignore */}
            <SearchProvider searchConfig={siteMetadata.search}>
              <Component {...pageProps} />
            </SearchProvider>
          </div>
        </LayoutWrapper>
      </SessionProvider>{' '}
      {/* <-- Close the wrapper here */}
    </ThemeProvider>
  )
}
