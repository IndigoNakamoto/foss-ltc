import React from 'react'
import DonationStats from './DonationStats'
import Image from 'next/image'
import { AddressStats, BountyStatus } from '../utils/types'
import { defaultAddressStats } from '../utils/defaultValues'
import { customImageLoader } from '../utils/customImageLoader'
import { isButtonDisabled, getButtonText } from '../utils/statusHelpers'

type AsideSectionProps = {
  title: string
  coverImage: string
  addressStats?: AddressStats
  formatUSD?: any
  isMatching?: boolean
  isBitcoinOlympics2024?: boolean
  isRecurring?: boolean
  matchingDonors?: any[]
  matchingTotal?: number
  monthlyTotal?: number
  recurringAmountGoal?: number
  monthlyDonorCount?: number
  timeLeftInMonth?: number
  serviceFeeCollected?: number
  bountyStatus?: BountyStatus
  totalPaid?: number
  openPaymentModal: () => void
}

const AsideSection: React.FC<AsideSectionProps> = ({
  title,
  coverImage,
  addressStats = defaultAddressStats,
  formatUSD,
  bountyStatus,
  isMatching,
  isBitcoinOlympics2024,
  isRecurring,
  matchingDonors,
  matchingTotal,
  recurringAmountGoal,
  monthlyDonorCount,
  timeLeftInMonth,
  openPaymentModal,
}) => {
  return (
    <aside className="top-32 mb-8 flex min-w-[20rem] flex-col space-y-4 bg-[#dddddd] p-4 lg:sticky lg:flex-col lg:space-x-4 lg:space-y-0">
      {/* Image and Donate Button Wrapper */}
      <div className="relative w-full max-w-full">
        {/* Cover Image */}
        <div className="relative max-h-max min-h-[150px] min-w-[150px] max-w-full">
          <Image
            loader={customImageLoader}
            src={coverImage}
            alt={title}
            fill
            style={{ objectFit: 'cover', objectPosition: '50% 50%' }}
            className=""
            priority={true}
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 50vw,
                   33vw"
          />
        </div>

        {/* Donation Stats */}
        <div className="flex w-full flex-col pt-4">
          <DonationStats
            addressStats={addressStats}
            formatUSD={formatUSD}
            isMatching={isMatching}
            isBitcoinOlympics2024={isBitcoinOlympics2024}
            isRecurring={isRecurring}
            matchingDonors={matchingDonors}
            matchingTotal={matchingTotal}
            recurringAmountGoal={recurringAmountGoal}
            monthlyDonorCount={monthlyDonorCount}
            timeLeftInMonth={timeLeftInMonth}
          />
        </div>

        {/* Donate Button */}
        <div className="relative w-full pt-6">
          <button
            onClick={openPaymentModal}
            className={`block w-full rounded-none bg-[#222222] font-space-grotesk text-xl font-semibold text-white transition-colors duration-200 hover:border-transparent hover:bg-[#363636] ${
              isButtonDisabled(bountyStatus) ? 'disabled' : ''
            }`}
            disabled={isButtonDisabled(bountyStatus)}
          >
            {getButtonText(bountyStatus)}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AsideSection
