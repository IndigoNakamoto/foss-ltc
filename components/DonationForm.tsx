//components/DonationForm.tsx
import { useEffect, useRef, useState } from 'react'
import { fetchPostJSON } from '../utils/api-helpers'
import Spinner from './Spinner'

// Font Awesome
import { config } from '@fortawesome/fontawesome-svg-core'
import Image from 'next/legacy/image'

import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false
const EMAIL_REGEX = /^$|^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TWITTER_USERNAME_REGEX = /^(?:[a-zA-Z0-9_]+)?$/

type DonationStepsProps = {
  projectNamePretty: string
  projectSlug: string
}
const DonationSteps: React.FC<DonationStepsProps> = ({
  // projectNamePretty,
  projectSlug,
}) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [twitter, setTwitter] = useState('')

  const [deductable, setDeductable] = useState('no')

  const [isHovered, setIsHovered] = useState(false)

  const [readyToPayBTC, setReadyToPayBTC] = useState(false)

  const [btcPayLoading, setBtcpayLoading] = useState(false)

  const formRef = useRef<HTMLFormElement | null>(null)

  // States for input validation
  const [emailError, setEmailError] = useState('')
  const [twitterError, setTwitterError] = useState('')

  // Email validation
  const validateEmail = (value: string) => {
    if (!EMAIL_REGEX.test(value)) {
      setEmailError('Invalid email address')
      return false
    }
    setEmailError('')
    return true
  }

  // Twitter validation
  const validateTwitter = (value: string) => {
    if (!TWITTER_USERNAME_REGEX.test(value)) {
      setTwitterError('Invalid username. Only a-z, 0-9 and _ are allowed.')
      return false
    }
    setTwitterError('')
    return true
  }

  useEffect(() => {
    let btcValid: boolean
    if (deductable === 'no' || (name && email)) {
      btcValid = true
    } else {
      btcValid = false
    }
    setReadyToPayBTC(btcValid)
  }, [deductable, twitter, email, name])

  async function handleBtcPay() {
    const validity = formRef.current?.checkValidity()
    if (!validity) {
      return
    }
    setBtcpayLoading(true)
    try {
      const payload = {
        project_slug: projectSlug,
      }

      if (name) {
        Object.assign(payload, { name })
      }

      if (email) {
        Object.assign(payload, { email })
      }

      if (twitter) {
        Object.assign(payload, { twitter: `www.twitter.com/${twitter}` })
      }

      const data = await fetchPostJSON(`/api/btcpay`, payload)
      if (data.checkoutLink) {
        window.location.assign(data.checkoutLink)
      } else if (data.message) {
        throw new Error(data.message)
      } else {
        throw new Error('Something went wrong with BtcPay Server checkout.')
      }
    } catch (e) {
      console.error(e)
    }
    setBtcpayLoading(false)
  }

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <section className="flex flex-col gap-1">
        <div className="mb-4">
          <h3>
            Name <span className="font-light text-gray-400">(Optional)</span>
          </h3>
          <input
            type="text"
            placeholder={'Satoshi Nakamoto'}
            required={deductable === 'yes'}
            onChange={(e) => setName(e.target.value)}
            className=" mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          ></input>
        </div>
        <div className="mb-4">
          <h3>
            X{' '}
            <span className="font-light text-gray-400">
              (Optional: Your profile picture and X account will be publicaly
              shared)
            </span>{' '}
            {/* Changed Twitter to X */}
          </h3>
          <div className="relative">
            <span className="absolute left-2 top-2 text-gray-400">@</span>
            <input
              type="text"
              placeholder={'username'} // Placeholder changed
              required={deductable === 'yes'}
              onChange={(e) => {
                setTwitter(e.target.value)
                validateTwitter(e.target.value)
              }}
              className={` mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
                twitterError ? 'border-red-500' : ''
              }`}
              style={{ paddingLeft: '24px' }}
            ></input>
          </div>
          {twitterError && (
            <div className="mt-0">
              <small className="text-red-500">{twitterError}</small>
            </div>
          )}
        </div>
        <div className="mb-4">
          <h3>
            Email <span className="font-light text-gray-400">(Optional)</span>
          </h3>
          <input
            type="email"
            placeholder={`support@ltcfoundation.com`}
            className={`mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
              emailError ? 'border-red-500' : ''
            }`}
            required={deductable === 'yes'}
            onChange={(e) => {
              setEmail(e.target.value.trim())
              validateEmail(e.target.value)
            }}
          ></input>
          {emailError && (
            <div className="mt-0">
              <small className="text-red-500">{emailError}</small>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          name="btcpay"
          onClick={handleBtcPay}
          className="pay"
          disabled={!readyToPayBTC || btcPayLoading}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {btcPayLoading ? (
            <Spinner />
          ) : (
            <Image
              src={
                isHovered
                  ? '/litecoin-svg/coin-white.svg'
                  : '/litecoin-svg/coin-blue.svg'
              }
              alt="Litecoin"
              width={32}
              height={32}
            />
          )}
          <span className="whitespace-nowrap">Donate with Litecoin</span>
        </button>
      </div>
    </form>
  )
}

export default DonationSteps
