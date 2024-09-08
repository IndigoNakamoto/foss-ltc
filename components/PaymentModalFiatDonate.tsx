/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react'
import { FaRegCreditCard } from 'react-icons/fa'
import { useDonation } from '../contexts/DonationContext'
import Notification from './Notification' // Import your Notification component

// TODO: add shift 4 logo: https://dev.shift4.com/checkout/img/matterhorn/powered-by.svg

function PaymentModalFiatDonate() {
  const { state, dispatch } = useDonation()
  const [cardToken, setCardToken] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const shift4Initialized = useRef(false)
  const [notification, setNotification] = useState<string | null>(null) // State for notification

  useEffect(() => {
    const initializeShift4 = () => {
      if (shift4Initialized.current) return

      const Shift4 = (window as any).Shift4
      if (Shift4) {
        console.log('Initializing Shift4...')
        const shift4 = new Shift4('pk_test_jRGmbvC4Y1m54rNqCJ2JLBWU') // Replace with your actual Shift4 public key

        const components = shift4
          .createComponentGroup()
          .automount(formRef.current)

        shift4Initialized.current = true

        formRef.current?.addEventListener('submit', (e: Event) => {
          e.preventDefault()

          const submitButton = (e.target as HTMLFormElement).querySelector(
            'button'
          )
          submitButton?.setAttribute('disabled', 'true')

          const amountInDollars = parseFloat(
            state.selectedCurrencyPledged || '0'
          )
          const amountInCents = Math.round(amountInDollars * 100)

          if (isNaN(amountInCents) || amountInCents <= 0) {
            console.error('Invalid amount:', amountInCents)
            submitButton?.removeAttribute('disabled')
            return
          }

          shift4
            .createToken(components)
            .then((token: { id: string }) => {
              console.log('Token created:', token)
              return shift4.verifyThreeDSecure({
                amount: amountInCents,
                currency: 'USD',
                card: token.id,
              })
            })
            .then((secureToken: any) => {
              console.log('3D Secure verification successful:', secureToken)
              setCardToken(secureToken.id)
              submitButton?.removeAttribute('disabled')

              handleSubmit(secureToken.id)
            })
            .catch(
              (error: { type: string; code?: string; message?: string }) => {
                console.error('Shift4 error:', error)
                displayShift4Error(error)
                submitButton?.removeAttribute('disabled')
              }
            )
        })
      } else {
        console.error('Shift4 is not available on window')
      }
    }

    const loadShift4Script = () => {
      if (!shift4Initialized.current) {
        const script = document.createElement('script')
        script.src = 'https://js.dev.shift4.com/shift4.js'
        script.async = true
        script.onload = initializeShift4
        script.onerror = () => console.error('Failed to load Shift4 script.')
        document.body.appendChild(script)

        return () => {
          document.body.removeChild(script)
          if (formRef.current) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            formRef.current.removeEventListener('submit', () => {})
          }
        }
      }
    }

    loadShift4Script()

    // Correcting empty arrow function
    return () => {
      if (formRef.current) {
        formRef.current.removeEventListener('submit', initializeShift4)
      }
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cardToken) {
      console.error('Card token is missing.')
      return
    }

    try {
      const response = await fetch('/api/chargeFiatDonationPledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pledgeId: state.donationData.pledgeId,
          cardToken: cardToken,
          amount: state.selectedCurrencyPledged,
        }),
      })

      if (response.ok) {
        console.log('Donation successful')
        dispatch({ type: 'SET_STEP', payload: 'complete' })
      } else {
        const errorData = await response.json()
        console.error('Donation failed', errorData)
        displayError(errorData.errorMessage)
      }
    } catch (error) {
      console.error('handle submit in payment modal fiat donate')
      console.error('Error charging donation:', error)
    }
  }

  const displayError = (errorMessage: string) => {
    setNotification(errorMessage) // Set the notification message
  }

  // Function to display Shift4 errors based on the error type and code
  const displayShift4Error = (error: any) => {
    const errorElement = document.getElementById('payment-error')
    if (errorElement) {
      errorElement.classList.remove('hidden')
      let errorMessage = 'An error occurred. Please try again later.'

      switch (error.type) {
        case 'invalid_request':
          errorMessage = 'Invalid request. Please check your card details.'
          break
        case 'card_error':
          switch (error.code) {
            case 'invalid_number':
              errorMessage = 'Invalid card number.'
              break
            case 'invalid_expiry_month':
              errorMessage = 'Invalid expiry month.'
              break
            case 'invalid_expiry_year':
              errorMessage = 'Invalid expiry year.'
              break
            case 'invalid_cvc':
              errorMessage = 'Invalid CVC code.'
              break
            case 'incorrect_zip':
              errorMessage = 'Incorrect ZIP code.'
              break
            case 'expired_card':
              errorMessage = 'Your card has expired.'
              break
            case 'insufficient_funds':
              errorMessage = 'Insufficient funds.'
              break
            // ... handle other card_error codes ...
            default:
              errorMessage =
                error.message || 'An error occurred while processing your card.'
              break
          }
          break
        case 'gateway_error':
          errorMessage = 'An error occurred on our end. Please try again later.'
          break
        // ... handle other error types ...
        default:
          errorMessage = error.message || 'An unknown error occurred.'
          break
      }

      errorElement.textContent = errorMessage
    }
  }

  // Format the amount to display as currency
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(state.selectedCurrencyPledged || '0'))

  return (
    <>
      <div className="flex flex-col space-y-4 rounded-lg  p-8">
        <h2 className="mb-4 font-space-grotesk text-2xl font-bold text-[#222222]">
          Complete Your Donation
        </h2>
        {/* Display the amount at the top */}
        <div className="mb-4 text-lg font-semibold text-[#222222]">
          Amount to Donate: {formattedAmount}
        </div>
        {notification && (
          <Notification
            message={notification}
            delay={5000}
            onClose={() => setNotification(null)} // Hide notification after 3 seconds
          />
        )}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          id="payment-form"
          className="space-y-4"
        >
          <div className="relative mb-4 w-full">
            <FaRegCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 transform text-[#222222]" />
            <div
              data-shift4="number"
              className="w-full rounded-lg border-white bg-white p-3 font-space-grotesk text-[#222222]"
              style={{ minHeight: '40px' }}
            ></div>
          </div>
          <div className="mb-4 flex flex-row space-x-3">
            <div
              data-shift4="expiry"
              className="w-full rounded-lg border-white bg-white p-3 font-space-grotesk text-[#222222]"
              style={{ minHeight: '40px' }}
            ></div>
            <div
              data-shift4="cvc"
              className="w-full rounded-lg border-white bg-white p-3 font-space-grotesk text-[#222222]"
              style={{ minHeight: '40px' }}
            ></div>
          </div>

          <button
            type="submit"
            className="!important w-full rounded-2xl border border-white bg-[#222222] py-2 text-2xl font-semibold text-[#222222] transition hover:bg-gray-600"
          >
            Donate
          </button>
        </form>
      </div>
    </>
  )
}

export default PaymentModalFiatDonate
