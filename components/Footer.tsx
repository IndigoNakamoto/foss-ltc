// import Link from './Link'
// import siteMetadata from '@/data/siteMetadata'
// import SocialIcon from '@/components/social-icons'
import Image from 'next/image'

export default function Footer() {
  return (
    // TODO: Footer
    <footer className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[600px] w-screen bg-[#222222] bg-cover bg-center">
      {/* Full-width section with bg-[#222222] */}
      <div className="mx-auto w-[1300px] max-w-[90%] pb-20 pt-10">
        {/* background */}
        <div className=" bg-[#222222] bg-cover bg-center">
          {/* Overlay on top */}
          <div className="mx-auto ">
            <div className="flex flex-col space-x-0 text-[#c6d3d6] lg:flex-row">
              <Image
                src="/static/images/design/Group 5.svg"
                alt="Black Logo"
                width={260} // Fixed width
                height={0} // This will allow the height to auto-adjust based on aspect ratio
                style={{
                  height: 'auto', // Maintain aspect ratio
                  opacity: 1,
                }}
                className="min-h-max max-w-min pr-16 pt-[-6]"
              />
              {/*
               */}
              <div className="flex w-full flex-row justify-between pt-10 xl:pl-36 xl:pt-0">
                <div className="  w-full">
                  <h1 className="font-space-grotesk text-[16px] font-bold">
                    ADDRESS
                  </h1>
                  <p className="pt-4 text-xs">Litecoin Foundation Ltd.</p>
                  <p className="text-xs">111 North Bridge Rd</p>
                  <p className="text-xs">#08-11 Peninsula Plaza</p>
                  <p className="text-xs">Singapore 179098</p>
                </div>
                <div className="  w-full">
                  <h1 className="font-space-grotesk text-[16px] font-bold">
                    CONTACT
                  </h1>
                  <p className="pt-4 text-xs">contact@litecoin.net</p>
                </div>
                <div className="  w-full">
                  <h1 className="font-space-grotesk text-[16px] font-bold">
                    SOCIAL
                  </h1>
                  <p className="pt-4 text-xs">twitter</p>
                  <p className="text-xs">reddit</p>
                  <p className="text-xs">facebook</p>
                  <p className="text-xs">github</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="m-auto flex h-[52px] items-center bg-[black] bg-cover bg-center">
        {/* TODO: Link privacy and terms */}
        <div
          className="mx-auto flex w-[1300px] max-w-[90%] items-center bg-black text-left text-[13px] text-[#767e7f]"
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
          }}
        >
          Copyright © 2024 Litecoin Foundation. | Privacy Policy | Terms &
          Conditions
          <br />
        </div>
      </div>
    </footer>
  )
}
