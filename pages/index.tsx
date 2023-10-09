import { InferGetStaticPropsType } from 'next'
import { allPages } from 'contentlayer/generated'
import Image from 'next/image'

// const DEFAULT_LAYOUT = 'ListLayout'
const FULL_SCREEN_IMAGE = '/static/images/lite-space-bg.jpg'
const COIN = '/litecoin-svg/L-white.png'

export const getStaticProps = async () => {
  // const page = allPages.find((p) => p.slug === 'mission')
  const page = true
  return { props: { page: page } }
}

export default function Mission({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!page) {
    return <div>Error: Mission page content not found.</div>
  }

  return (
    <>
      <div className="absolute inset-x-0 bottom-0 top-24 z-0">
        <Image
          src={FULL_SCREEN_IMAGE}
          alt="Mission - Promote the adoption, education & development of Litecoin (LTC)"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="relative inset-x-0 bottom-0 top-[200px] z-10 flex flex-col items-center justify-center  md:absolute md:bottom-20 lg:bottom-24 xl:bottom-32">
        <Image
          src={COIN}
          alt=""
          width={300}
          height={300}
          objectFit="cover"
          className="mb-36"
        />
        <div className="container px-6">
          <h1 className="text-center text-6xl font-extrabold leading-9 tracking-tight text-gray-100 sm:text-6xl sm:leading-10 md:text-6xl md:leading-14 lg:text-7xl xl:col-span-2">
            Mission
          </h1>
          <h2 className="mb-4 text-center text-3xl font-bold leading-normal text-gray-100 md:text-4xl lg:text-4xl">
            Promote the adoption, education & development of Litecoin (LTC)
          </h2>
        </div>
      </div>
    </>
  )
}
