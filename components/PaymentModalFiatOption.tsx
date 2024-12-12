// components/PaymentModalFiatOption.js
import React, { useState, useRef, useEffect } from 'react'
import { useDonation } from '../contexts/DonationContext'

export default function PaymentModalFiatOption() {
  const { state, dispatch } = useDonation()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100) // Default amount
  const [customAmount, setCustomAmount] = useState('')
  const [coverFees, setCoverFees] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const minDonation = 10 // Minimum donation amount in USD
  const buttonValues = [50, 100, 250, 500, 1000, 2500]

  // Check if the current amount is below the minimum donation
  const isBelowMin =
    (selectedAmount !== null && selectedAmount < minDonation) ||
    (customAmount !== '' && parseFloat(customAmount) < minDonation)

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setCoverFees(false)
    // Update the formData with the correct pledgeAmount and selectedCurrency
    dispatch({
      type: 'SET_FORM_DATA',
      payload: { pledgeAmount: amount.toString(), pledgeCurrency: 'USD' },
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Allow empty input
    if (value === '') {
      setCustomAmount('')
      setSelectedAmount(null)
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: '', pledgeCurrency: 'USD' },
      })
      return
    }

    // Validate input as a number with up to two decimal places
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      const numericValue = parseFloat(value)

      // Check if the entered amount matches any predefined button value
      if (buttonValues.includes(numericValue)) {
        setSelectedAmount(numericValue)
        setCustomAmount('')
        dispatch({
          type: 'SET_FORM_DATA',
          payload: {
            pledgeAmount: numericValue.toString(),
            pledgeCurrency: 'USD',
          },
        })
      } else {
        setCustomAmount(value)
        setSelectedAmount(null)
        dispatch({
          type: 'SET_FORM_DATA',
          payload: { pledgeAmount: value, pledgeCurrency: 'USD' },
        })
      }
    }
  }

  const handleInputBlur = () => {
    if (customAmount !== '') {
      const formattedAmount = parseFloat(customAmount).toFixed(2)
      const numericAmount = parseFloat(formattedAmount)

      if (buttonValues.includes(numericAmount)) {
        setSelectedAmount(numericAmount)
        setCustomAmount('')
        dispatch({
          type: 'SET_FORM_DATA',
          payload: {
            pledgeAmount: numericAmount.toString(),
            pledgeCurrency: 'USD',
          },
        })
      } else {
        setCustomAmount(formattedAmount)
        dispatch({
          type: 'SET_FORM_DATA',
          payload: { pledgeAmount: formattedAmount, pledgeCurrency: 'USD' },
        })
      }
    }
  }

  const handleCoverFeesChange = () => {
    setCoverFees((prev) => !prev)
    if (!coverFees && inputRef.current) {
      const baseAmount = parseFloat(customAmount) || selectedAmount || 0
      const totalAmount = (baseAmount * 1.030928).toFixed(2)
      setCustomAmount(totalAmount)
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: totalAmount, pledgeCurrency: 'USD' },
      }) // Adjust for fees
    } else if (coverFees && inputRef.current) {
      const baseAmount = parseFloat(customAmount) / 1.030928
      setCustomAmount(baseAmount.toFixed(2))
      dispatch({
        type: 'SET_FORM_DATA',
        payload: { pledgeAmount: baseAmount.toFixed(2), pledgeCurrency: 'USD' },
      }) // Revert fees
    }
  }

  // Add useEffect to dispatch initial pledgeAmount
  useEffect(() => {
    if (selectedAmount !== null) {
      dispatch({
        type: 'SET_FORM_DATA',
        payload: {
          pledgeAmount: selectedAmount.toString(),
          pledgeCurrency: 'USD',
        },
      })
    }
  }, [selectedAmount, dispatch])

  const displayAmount =
    customAmount || (selectedAmount ? selectedAmount.toFixed(2) : '')

  const isCustomAmount =
    !buttonValues.includes(Number(displayAmount)) && customAmount !== ''

  // **New useEffect to handle Donate button disabled state**
  useEffect(() => {
    dispatch({
      type: 'SET_DONATE_BUTTON_DISABLED',
      payload: isBelowMin, // Disable if below min
    })
  }, [isBelowMin, dispatch])

  return (
    <div className="flex w-full flex-col gap-4 pt-5">
      <div className="flex h-full w-full justify-between space-x-6 pt-6 font-space-grotesk">
        {buttonValues.slice(0, 3).map((value) => (
          <button
            key={value}
            className={`w-[24vw] rounded-3xl border border-[#222222] ${
              selectedAmount === value
                ? 'bg-[#222222] text-[#f0f0f0]'
                : 'bg-[#f0f0f0] text-[#222222]'
            } text-lg font-semibold`}
            onClick={() => handleAmountClick(value)}
          >
            ${value}
          </button>
        ))}
      </div>
      <div className="flex h-full w-full justify-between space-x-6 font-space-grotesk">
        {buttonValues.slice(3).map((value) => (
          <button
            key={value}
            className={`w-[24vw] rounded-3xl border border-[#222222] ${
              selectedAmount === value
                ? 'bg-[#222222] text-[#f0f0f0]'
                : 'bg-[#f0f0f0] text-[#222222]'
            } text-lg font-semibold`}
            onClick={() => handleAmountClick(value)}
          >
            ${value}
          </button>
        ))}
      </div>
      <div className="relative w-full">
        <span
          className={`absolute left-4 top-1/2 -translate-y-1/2 font-space-grotesk text-lg font-semibold ${
            isCustomAmount
              ? !isBelowMin
                ? 'text-[#f0f0f0]'
                : 'text-gray-600'
              : 'text-[#222222]'
          }`}
        >
          $
        </span>
        <input
          type="number"
          ref={inputRef}
          className={`w-full appearance-none rounded-3xl border pl-8 pr-4 font-space-grotesk text-lg font-semibold 
    ${
      isCustomAmount
        ? !isBelowMin
          ? 'border-[#222222] bg-[#222222] text-[#f0f0f0]' // Valid custom input
          : 'border-gray-400 bg-[#f0f0f0] text-gray-600' // Below minimum or invalid input
        : 'border-[#222222] bg-[#f0f0f0] text-[#222222]' // Default predefined styles
    }`}
          value={displayAmount}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          step="0.01"
          min="0"
          style={{ paddingLeft: '2rem' }}
        />
      </div>
      {isBelowMin ? (
        <p className="-mt-3 font-space-grotesk text-sm font-semibold text-red-500">
          Minimum donation is {minDonation.toFixed(2)} USD
        </p>
      ) : (
        <p className="-mt-3 font-space-grotesk text-sm text-gray-600">
          Minimum donation is {minDonation.toFixed(2)} USD
        </p>
      )}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={coverFees}
          onChange={handleCoverFeesChange}
          className="h-4 w-4 border border-[#222222] bg-[#f0f0f0]"
          id="cover-transaction-fees"
        />
        <label
          htmlFor="cover-transaction-fees"
          className="flex items-center text-[#222222]"
        >
          Cover transaction fees
          <span className="group relative ml-1">
            (?)
            <span className="absolute z-10 mt-2 w-64 rounded border border-white bg-gray-700 px-2 py-1 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Make your impact go even further by covering the processing fees
              of this donation
            </span>
          </span>
        </label>
      </div>
    </div>
  )
}
