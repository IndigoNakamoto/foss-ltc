//components/PaymentModalCryptoDonate

import React, { useState, useCallback } from 'react'
import { useDonation } from '../contexts/DonationContext'
import { QRCodeSVG } from 'qrcode.react'
import { FaRegCopy } from 'react-icons/fa6'
import Image from 'next/image'

interface PaymentModalCryptoDonateProps {
  onRequestClose: () => void
}

const PaymentModalCryptoDonate: React.FC<PaymentModalCryptoDonateProps> = ({
  onRequestClose,
}) => {
  const { state, dispatch } = useDonation()

  const depositAddress = state.donationData?.depositAddress || ''
  const pledgeAmount = state.formData?.pledgeAmount || ''
  const pledgeCurrency = state.formData?.assetName || ''
  const qrCode = state.donationData?.qrCode || ''

  const [copied, setCopied] = useState<{ address: boolean; amount: boolean }>({
    address: false,
    amount: false,
  })

  const handleDone = useCallback(() => {
    dispatch({ type: 'RESET_DONATION_STATE' })
    onRequestClose()
  }, [dispatch, onRequestClose])

  const handleCopy = useCallback(
    (type: 'address' | 'amount') => {
      const textToCopy = type === 'address' ? depositAddress : pledgeAmount
      navigator.clipboard.writeText(textToCopy)
      setCopied((prev) => ({ ...prev, [type]: true }))

      setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 3000)
    },
    [depositAddress, pledgeAmount]
  )

  const qrCodeCurrencies = ['bitcoin', 'litecoin', 'dogecoin']

  let qrValue = depositAddress
  if (qrCodeCurrencies.includes(pledgeCurrency.toLowerCase())) {
    qrValue = `${pledgeCurrency.toLowerCase()}:${depositAddress}?amount=${pledgeAmount}`
  }

  const CopyableField = ({
    text,
    copiedText,
    isCopied,
    onCopy,
  }: {
    text: string
    copiedText: string
    isCopied: boolean
    onCopy: () => void
  }) => (
    <div
      className="flex w-full cursor-pointer flex-row justify-between rounded-lg border border-[#222222] bg-[#f2f2f2] p-4"
      role="button"
      tabIndex={0}
      onClick={onCopy}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCopy()
        }
      }}
    >
      <p
        className={`text-md break-all font-semibold text-[#222222] transition-opacity duration-300 ${
          isCopied ? 'opacity-100' : 'opacity-100'
        }`}
      >
        {isCopied ? copiedText : text}
      </p>
      <span>
        <FaRegCopy />
      </span>
    </div>
  )

  return (
    <div className="flex items-center justify-center">
      <div className="my-auto flex flex-col items-center justify-center space-y-4 p-8">
        <h2 className="font-space-grotesk text-2xl font-bold text-[#222222]">
          Complete Your Donation
        </h2>
        <p className="text-[#222222]">
          Please send your donation to the following address:
        </p>

        {qrCodeCurrencies.includes(pledgeCurrency.toLowerCase()) ? (
          <>
            <QRCodeSVG
              value={qrValue}
              size={256}
              bgColor="#222222"
              fgColor="#f2f2f2"
            />
            <p className="text-[#222222]">
              Scan the QR code above to donate {pledgeAmount} {pledgeCurrency}.
            </p>
          </>
        ) : qrCode ? (
          <>
            <Image
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code"
              width={256}
              height={256}
            />
            <p className="text-[#222222]">
              Scan the QR code above to donate {pledgeAmount} {pledgeCurrency}.
            </p>
          </>
        ) : null}

        <CopyableField
          text={depositAddress}
          copiedText="Address copied to clipboard!"
          isCopied={copied.address}
          onCopy={() => handleCopy('address')}
        />
        <CopyableField
          text={pledgeAmount}
          copiedText="Amount copied to clipboard!"
          isCopied={copied.amount}
          onCopy={() => handleCopy('amount')}
        />

        <button
          onClick={handleDone}
          className="mt-4 w-full rounded-2xl bg-[#222222] text-2xl font-semibold text-[#f0f0f0]"
        >
          Done
        </button>
        <p className="mt-4 text-center text-base text-[#222222]">
          You will receive an email confirmation once your transaction is
          settled. Thank you for your generous support!
        </p>
      </div>
    </div>
  )
}

export default PaymentModalCryptoDonate
