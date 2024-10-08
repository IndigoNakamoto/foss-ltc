// services/matching.ts

import {
  getActiveMatchingDonors,
  getMatchingTypeLabelForDonor,
  getSupportedProjectsForDonor,
} from '../utils/webflow'
import {
  prisma,
  getUnprocessedDonations,
  getDonorsMatchedAmounts,
} from '../lib/prisma'

interface MatchingDonor {
  id: string
  slug: string
  isDraft: boolean
  isArchived: boolean
  fieldData: MatchingDonorFieldData
}

interface MatchingDonorFieldData {
  name: string
  'matching-type': string // Option field, returns option ID
  'total-matching-amount': number
  'remaining-matching-amount': number
  'supported-projects'?: string[]
  'start-date': string
  'end-date': string
  multiplier?: number
  status: string // Option field, returns option ID
  contributor?: string
  // other fields...
}

export const processDonationMatching = async () => {
  try {
    console.log('Starting processDonationMatching')

    const donations = await getUnprocessedDonations()
    const matchingDonors = await getActiveMatchingDonors()

    // Get donor IDs
    const donorIds = matchingDonors.map((donor) => donor.id)

    // Get already matched amounts for donors
    const donorMatchedAmountMap = await getDonorsMatchedAmounts(donorIds)

    for (const donation of donations) {
      const donationAmount = Number(donation.amount)
      const projectSlug = donation.projectSlug

      console.log(
        `Processing donation ID ${donation.id}, amount: ${donationAmount}, projectSlug: ${projectSlug}`
      )

      // Find eligible matching donors for the project
      const eligibleDonorsResults = await Promise.all(
        matchingDonors.map(async (donor) => {
          const matchingTypeLabel = await getMatchingTypeLabelForDonor(donor)
          if (matchingTypeLabel === 'All Projects') {
            console.log(
              `Donor ID ${donor.id} (All Projects) is eligible for projectSlug ${projectSlug}`
            )
            return donor
          } else if (matchingTypeLabel === 'Per Project') {
            // Get the supported project slugs for the donor
            const supportedProjectSlugs = await getSupportedProjectsForDonor(
              donor
            )
            console.log(
              `Donor ID ${donor.id} - Supported Projects (Slugs): ${supportedProjectSlugs}, Project Slug: ${projectSlug}`
            )
            if (supportedProjectSlugs.includes(projectSlug)) {
              console.log(
                `Donor ID ${donor.id} (Per Project) supports projectSlug ${projectSlug}`
              )
              return donor
            } else {
              console.log(
                `Donor ID ${donor.id} (Per Project) does not support projectSlug ${projectSlug}`
              )
            }
          }
          return null
        })
      )

      const filteredEligibleDonors = eligibleDonorsResults.filter(
        (donor): donor is MatchingDonor => donor !== null
      )

      console.log(
        `Found ${filteredEligibleDonors.length} eligible donors for donation ID ${donation.id}`
      )

      // Apply matching logic
      for (const donor of filteredEligibleDonors) {
        console.log(
          `Evaluating donor ID ${donor.id} for donation ID ${donation.id}`
        )
        const totalMatchingAmount = Number(
          donor.fieldData['total-matching-amount']
        )

        // Get already matched amount
        const alreadyMatchedAmount = donorMatchedAmountMap.get(donor.id) || 0
        console.log(
          `Donor ID ${donor.id} - Total Matching Amount: ${totalMatchingAmount}, Already Matched Amount: ${alreadyMatchedAmount}`
        )

        // Calculate remaining matching amount
        const remainingAmountDecimal =
          totalMatchingAmount - alreadyMatchedAmount
        console.log(
          `Donor ID ${donor.id} - Remaining Matching Amount: ${remainingAmountDecimal}`
        )

        if (remainingAmountDecimal <= 0) {
          console.log(`Donor ID ${donor.id} has no remaining matching amount.`)
          continue
        }

        // Determine the amount to match
        const multiplier = donor.fieldData['multiplier'] || 1
        const maxMatchableAmount = remainingAmountDecimal / multiplier
        const matchAmount = Math.min(donationAmount, maxMatchableAmount)

        console.log(
          `Donor ID ${donor.id} - Multiplier: ${multiplier}, Max Matchable Amount: ${maxMatchableAmount}, Match Amount: ${matchAmount}`
        )

        if (matchAmount <= 0) {
          console.log(`Donor ID ${donor.id} cannot match the donation amount.`)
          continue
        }

        console.log(
          `Donor ID ${donor.id} is matching donation ID ${
            donation.id
          } for amount ${matchAmount * multiplier}`
        )

        // Log the matching donation in PostgreSQL
        const logData = {
          donorId: donor.id,
          donationId: donation.id,
          matchedAmount: matchAmount * multiplier,
          date: new Date().toISOString(),
          projectId: projectSlug,
        }
        const logResult = await prisma.matchingDonationLog.create({
          data: {
            donorId: logData.donorId,
            donationId: logData.donationId,
            matchedAmount: logData.matchedAmount,
            date: new Date(logData.date),
            projectSlug: logData.projectId,
          },
        })
        console.log(`Logged matching donation: ${JSON.stringify(logResult)}`)

        // Update the donorMatchedAmountMap
        donorMatchedAmountMap.set(
          donor.id,
          alreadyMatchedAmount + matchAmount * multiplier
        )
        console.log(
          `Updated donorMatchedAmountMap for donor ID ${donor.id} to ${
            alreadyMatchedAmount + matchAmount * multiplier
          }`
        )
      }

      // After processing all matching donors for this donation, mark it as processed
      await prisma.donation.update({
        where: { id: donation.id },
        data: { processed: true },
      })
      console.log(`Donation ID ${donation.id} marked as processed.`)
    }

    console.log('Donation matching process completed')
  } catch (error: any) {
    console.error('Error in processDonationMatching:', error)
    throw error
  }
}

// Main function to trigger the donation matching process
if (require.main === module) {
  processDonationMatching()
    .then(() => {
      console.log('Process completed successfully.')
    })
    .catch((error) => {
      console.error('An error occurred during processing:', error)
    })
}