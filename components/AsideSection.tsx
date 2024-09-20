// components/AsideSection.tsx
import React from 'react'
import DonationStats from './DonationStats'
import Image from 'next/legacy/image'
import { BountyStatus, AddressStats } from '../utils/types' // Adjust the path as necessary

type AsideSectionProps = {
  title: string
  coverImage: string
  addressStats: AddressStats
  isMatching: boolean
  isBitcoinOlympics2024: boolean
  isRecurring: boolean
  matchingTotal: number
  serviceFeeCollected: number
  totalPaid: number
  formatLits: (value: any) => string
  monthlyTotal?: number
  recurringAmountGoal?: number
  monthlyDonorCount?: number
  timeLeftInMonth?: number
  bountyStatus: BountyStatus
  openPaymentModal: () => void
}

const AsideSection: React.FC<AsideSectionProps> = ({
  title,
  coverImage,
  addressStats,
  isMatching,
  isBitcoinOlympics2024,
  isRecurring,
  matchingTotal,
  serviceFeeCollected,
  totalPaid,
  formatLits,
  monthlyTotal,
  recurringAmountGoal,
  monthlyDonorCount,
  timeLeftInMonth,
  bountyStatus,
  openPaymentModal,
}) => (
  <aside className="top-32 mb-8 flex min-w-[20rem] flex-col space-y-4 bg-[#dddddd] p-4 lg:sticky lg:flex-col lg:space-x-4 lg:space-y-0">
    {/* Cover Image */}
    <div className="relative max-h-max min-h-[10rem] min-w-[150px] max-w-[300px] lg:m-4 lg:w-1/3">
      <Image
        alt={title}
        src={coverImage}
        layout="fill"
        objectFit="cover"
        objectPosition="50% 50%"
        className=""
        priority={true}
      />
    </div>

    {/* Donation Stats and Donate Button */}
    <div className="flex w-full flex-col">
      <DonationStats
        addressStats={addressStats}
        isMatching={isMatching}
        isBitcoinOlympics2024={isBitcoinOlympics2024}
        isRecurring={isRecurring}
        matchingTotal={matchingTotal}
        serviceFeeCollected={serviceFeeCollected}
        totalPaid={totalPaid}
        formatLits={formatLits}
        monthlyTotal={monthlyTotal}
        recurringAmountGoal={recurringAmountGoal}
        monthlyDonorCount={monthlyDonorCount}
        timeLeftInMonth={timeLeftInMonth}
      />

      <div className="pb-4 pr-0 pt-8 lg:pr-8">
        <button
          onClick={openPaymentModal}
          className={`block w-full rounded-none rounded-xl bg-[#222222] font-space-grotesk text-xl font-semibold text-white transition-colors duration-200 hover:border-transparent hover:bg-[#363636] ${
            bountyStatus === 'completed' ? 'disabled' : ''
          }`}
          disabled={bountyStatus === 'completed'}
        >
          {bountyStatus === 'completed' ? 'Project Completed' : 'Donate'}
        </button>
      </div>
    </div>
  </aside>
)

export default AsideSection
