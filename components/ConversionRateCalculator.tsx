// components/ConversionRateCalculator.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { useDonation } from '../contexts/DonationContext'
import axios from 'axios'
import Image from 'next/legacy/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchange } from '@fortawesome/free-solid-svg-icons'

interface ConversionRateCalculatorProps {
  selectedCurrencyCode: string | undefined
  selectedCurrencyName: string | undefined
  onCurrencySelect: (
    currencyCode: string,
    amount: number,
    rateInfo: { rate: number }
  ) => void
}

const ConversionRateCalculator: React.FC<ConversionRateCalculatorProps> = ({
  selectedCurrencyCode,
  selectedCurrencyName,
  onCurrencySelect,
}) => {
  const { state, dispatch } = useDonation()
  const { usdInput, cryptoInput, currencyList } = state

  // Local State Variables
  const [cryptoRate, setCryptoRate] = useState<number | null>(null)
  const [usdValue, setUsdValue] = useState<string>(usdInput || '100') // Calculated USD value
  const [cryptoValue, setCryptoValue] = useState<string>(cryptoInput || '') // Calculated crypto value
  const [minDonation, setMinDonation] = useState<number>(0.001)
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false) // Loading state for fetching rate
  const [error, setError] = useState<string | null>(null)
  const [minError, setMinError] = useState<string | null>(null) // New state for min donation error

  // Utility functions to calculate values
  const calculateCryptoValue = useCallback((usd: number, rate: number) => {
    return (usd / rate).toFixed(8).replace(/\.?0+$/, '') || '0'
  }, [])

  const calculateUsdValue = useCallback((crypto: number, rate: number) => {
    return (crypto * rate).toFixed(2).replace(/\.?0+$/, '') || '0'
  }, [])

  // Fetch Crypto Rate when selectedCurrencyCode changes
  useEffect(() => {
    const fetchCryptoRate = async (currencyCode: string) => {
      try {
        setIsLoadingRate(true)
        setError(null)
        const response = await axios.get(
          `/api/getCryptoRate?currency=${currencyCode}`
        )
        const rate = response.data.data.rate
        if (rate) {
          setCryptoRate(rate)
          setMinDonation(2.5 / rate) // Update min donation based on rate

          // Update values based on existing inputs
          if (usdInput) {
            const numericUsd = parseFloat(usdInput)
            if (!isNaN(numericUsd)) {
              const newCryptoValue = calculateCryptoValue(numericUsd, rate)
              setCryptoValue(newCryptoValue)
              dispatch({
                type: 'SET_FORM_DATA',
                payload: {
                  pledgeAmount: newCryptoValue,
                  pledgeCurrency: selectedCurrencyCode || '',
                  assetName: selectedCurrencyName || '',
                },
              })
              onCurrencySelect(
                selectedCurrencyCode || '',
                parseFloat(newCryptoValue),
                {
                  rate,
                }
              )
            }
          } else if (cryptoInput) {
            const numericCrypto = parseFloat(cryptoInput)
            if (!isNaN(numericCrypto)) {
              const newUsdValue = calculateUsdValue(numericCrypto, rate)
              setUsdValue(newUsdValue)
              dispatch({
                type: 'SET_FORM_DATA',
                payload: {
                  pledgeAmount: cryptoInput,
                  pledgeCurrency: selectedCurrencyCode || '',
                  assetName: selectedCurrencyName || '',
                },
              })
              onCurrencySelect(selectedCurrencyCode!, numericCrypto, {
                rate,
              })
            }
          }
        } else {
          throw new Error('Invalid rate data')
        }
      } catch (error) {
        console.error('Error fetching crypto rate:', error)
        setError('Failed to load the cryptocurrency rate.')
        setCryptoRate(null)
      } finally {
        setIsLoadingRate(false)
      }
    }

    if (selectedCurrencyCode) {
      fetchCryptoRate(selectedCurrencyCode.toLowerCase())
    }
  }, [selectedCurrencyCode]) // Only depend on selectedCurrencyCode

  // Update cryptoValue when usdInput changes
  useEffect(() => {
    if (usdInput && cryptoRate) {
      const numericUsd = parseFloat(usdInput)
      if (!isNaN(numericUsd)) {
        const newCryptoValue = calculateCryptoValue(numericUsd, cryptoRate)
        setCryptoValue(newCryptoValue)
        dispatch({
          type: 'SET_FORM_DATA',
          payload: {
            pledgeAmount: newCryptoValue,
            pledgeCurrency: selectedCurrencyCode || undefined,
            assetName: selectedCurrencyName || '',
          },
        })
        // Validate USD input against minimum
        if (numericUsd < 2.5) {
          dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: true }) // Disable if below min
        } else {
          dispatch({ type: 'SET_DONATE_BUTTON_DISABLED', payload: false }) // Enable if valid
        }
      } else {
        setCryptoValue('')
      }
    } else if (usdInput === '') {
      setCryptoValue('')
    }
  }, [
    usdInput,
    cryptoRate,
    calculateCryptoValue,
    dispatch,
    selectedCurrencyCode,
    selectedCurrencyName,
    minDonation,
  ])

  // Update usdValue when cryptoInput changes
  useEffect(() => {
    if (cryptoInput && cryptoRate) {
      const numericCrypto = parseFloat(cryptoInput)
      if (!isNaN(numericCrypto)) {
        const newUsdValue = calculateUsdValue(numericCrypto, cryptoRate)
        setUsdValue(newUsdValue)
        dispatch({
          type: 'SET_FORM_DATA',
          payload: {
            pledgeAmount: cryptoInput,
            pledgeCurrency: selectedCurrencyCode || '',
            assetName: selectedCurrencyName || '',
          },
        })
      } else {
        setUsdValue('')
      }
    } else if (cryptoInput === '') {
      setUsdValue('')
    }
  }, [
    cryptoInput,
    cryptoRate,
    calculateUsdValue,
    dispatch,
    selectedCurrencyCode,
    selectedCurrencyName,
    minDonation,
  ])

  // Handle USD input changes
  const handleUsdChange = (usd: string) => {
    // Validation regex for up to 2 decimal places and max 10,000,000
    const regex = /^\d{0,10}(\.\d{0,2})?$/
    if (regex.test(usd) || usd === '') {
      dispatch({ type: 'SET_USD_INPUT', payload: usd })
      dispatch({ type: 'SET_CRYPTO_INPUT', payload: '' }) // Clear crypto input when user is typing in USD
      setCryptoValue('') // Clear local cryptoValue to allow manual input
      setError(null)
    }
  }

  // Handle Crypto input changes
  const handleCryptoChange = (crypto: string) => {
    const regex = /^(\d+)?(\.\d{0,9})?$/

    if (regex.test(crypto) || crypto === '') {
      dispatch({ type: 'SET_CRYPTO_INPUT', payload: crypto })
      dispatch({ type: 'SET_USD_INPUT', payload: '' })
      setUsdValue('')
      setError(null) // Clear format error when input is valid
    } else {
      setError('Invalid format. Please enter a valid number.')
    }
  }

  // Find selected currency data for display
  const selectedCurrencyData = currencyList.find(
    (currency) => currency.code === selectedCurrencyCode
  )

  // Determine if cryptoInput is below minDonation
  const isBelowMin =
    cryptoInput !== '' &&
    !isNaN(parseFloat(cryptoInput)) &&
    parseFloat(cryptoInput) < minDonation

  // Determine if usdInput is below minimum donation
  const isUsdBelowMin =
    usdInput !== '' &&
    !isNaN(parseFloat(usdInput)) &&
    parseFloat(usdInput) < 2.5

  return (
    <div className="flex flex-col justify-between pt-4">
      {/* Crypto Input */}
      <div className="flex items-center overflow-hidden rounded-3xl border border-[#222222] bg-[#222222]">
        <div className=" flex h-12 w-36 items-center justify-center bg-[#222222]">
          {selectedCurrencyData && (
            <Image
              src={selectedCurrencyData.imageUrl}
              alt={selectedCurrencyData.name}
              width={36}
              height={36}
              objectFit="contain"
              style={{ zIndex: 5 }}
            />
          )}

          <h1 className="px-2 font-space-grotesk text-lg font-semibold text-white">
            {selectedCurrencyCode}
          </h1>
        </div>
        <input
          type="text"
          name="cryptoInput"
          className={`h-12 w-full border-none pl-8 font-space-grotesk text-lg font-black ${
            isLoadingRate
              ? 'loading-gradient'
              : isBelowMin
              ? 'border-red-500 ring-1 ring-red-500'
              : 'bg-[#c6d3d6]'
          } rounded-r-3xl transition-colors duration-300`}
          value={cryptoInput !== '' ? cryptoInput : cryptoValue}
          onChange={(e) => handleCryptoChange(e.target.value)}
          min={minDonation}
          step={minDonation}
          disabled={isLoadingRate}
        />
      </div>

      {/* Display min donation error */}
      {isBelowMin && (
        <p className="mt-1 font-space-grotesk text-sm font-semibold text-red-500">
          Minimum donation is {minDonation.toFixed(8)} {selectedCurrencyCode}
        </p>
      )}

      {/* Exchange Icon */}
      <FontAwesomeIcon
        icon={faExchange}
        className="m-auto my-1 h-5 rotate-90 text-gray-500"
      />

      {/* USD Input */}
      <div className="flex overflow-hidden rounded-3xl border border-[#222222]">
        <div className="flex h-12 w-36 items-center justify-center bg-[#222222]">
          <h1 className="font-space-grotesk text-lg font-semibold text-[#f2f2f2]">
            USD
          </h1>
        </div>
        <input
          type="text"
          name="usdInput"
          className={`w-full border-none pl-8 font-space-grotesk text-lg font-black ${
            isUsdBelowMin ? '' : 'bg-[#c6d3d6]'
          } rounded-r-3xl transition-colors duration-300`}
          value={usdInput !== '' ? usdInput : usdValue}
          onChange={(e) => handleUsdChange(e.target.value)}
          disabled={isLoadingRate}
        />
      </div>

      {/* Display USD min donation error or static message */}
      {isUsdBelowMin ? (
        <p className="mt-1 font-space-grotesk text-sm font-semibold text-red-500">
          Minimum donation is $2.50
        </p>
      ) : (
        <p className="mt-1 font-space-grotesk text-sm text-gray-600">
          Minimum donation is $2.50
        </p>
      )}

      {/* Existing error messages */}
      {error && (
        <p className="mt-1 font-space-grotesk text-sm font-semibold text-red-500">
          {error}
        </p>
      )}

      {/* Styles for Gradient Animation */}
      <style jsx>{`
        @keyframes gradient-animation {
          0% {
            background-position: 200% 0%;
          }
          100% {
            background-position: -200% 0%;
          }
        }
      `}</style>

      <style jsx>{`
        .loading-gradient {
          background: linear-gradient(
            70deg,
            #c6d3d6,
            #c6d3d6,
            #c6d3d6,
            #c6d3d6,
            #c6d3d6,
            #ffffff,
            #ffffff,
            #ffffff,
            #ffffff,
            #ffffff,
            #c6d3d6,
            #c6d3d6
          );
          background-size: 200% 100%;
          animation: gradient-animation 7s infinite;
        }
      `}</style>
    </div>
  )
}

export default ConversionRateCalculator