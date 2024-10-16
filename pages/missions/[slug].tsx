//pages/missions/[slug].tsx
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import { getPostBySlug, getAllPosts, getAllPostUpdates } from '../../utils/md'
import markdownToHtml from '../../utils/markdownToHtml'
import Image from 'next/legacy/image'
// import ProjectList from '@/components/ProjectList'
// import BackToProjects from '@/components/BackToProjects'
import { ProjectItem, AddressStats, Donation } from '../../utils/types'
import { NextPage } from 'next/types'
import { useEffect, useState } from 'react'
import PaymentModal from '@/components/PaymentModal'
import ThankYouModal from '@/components/ThankYouModal'
// import Link from 'next/link'
import { fetchGetJSON } from '../../utils/api-helpers'
import TwitterUsers from '@/components/TwitterUsers'
import {
  TwitterUser,
  BountyStatus,
  BugSeverity,
  BugStatus,
  FundingStatus,
  RecurringPeriod,
} from '../../utils/types'
import Head from 'next/head'
import ProjectMenu from '@/components/ProjectMenu'
import TwitterFeed from '@/components/TwitterFeed'
import SocialMediaShare from '@/components/SocialMediaShare'
import tweetsData from '../../data/tweets.json'
import { FAQSection } from '@/components/FAQSection'
import ProjectUpdate from '@/components/ProjectUpdate'
import React from 'react'
import ProjectSocialLinks from '@/components/ProjectSocialLinks'
import { isCompletedBounty } from '.'

type SingleProjectPageProps = {
  project: ProjectItem
  projects: ProjectItem[]
}

const Project: NextPage<SingleProjectPageProps> = ({ project }) => {
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)
  const [isThankYouModalOpen, setThankYouModalOpen] = useState(false)

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  function closeModal() {
    setModalOpen(false)
    setThankYouModalOpen(false)
    // Check if the 'thankyou' query parameter exists
    if (router.query.thankyou || router.query.name) {
      // Create a shallow copy of the current URL's query parameters
      const newQuery = { ...router.query }
      // Remove the query parameters
      delete newQuery.thankyou
      delete newQuery.name

      // Update the URL with the modified query parameters without reloading the page
      router.push(
        {
          pathname: router.pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      )
    }
  }

  function openPaymentModal() {
    setSelectedProject(project)
    setModalOpen(true)
  }

  function openThankYouModal() {
    setSelectedProject(project)
    setThankYouModalOpen(true)
  }

  useEffect(() => {
    if (router.query.thankyou === 'true') {
      openThankYouModal()
    }
  })

  // useEffect hook to watch for URL changes
  useEffect(() => {
    // Check if the thankyou query param exists and is 'true'
    const isThankYou = router.query.thankyou === 'true'
    setThankYouModalOpen(isThankYou)
  }, [router.query.thankyou]) // Depend on thankyou query param

  function extractUsername(url) {
    // This regex will match any string that ends with a forward slash followed by any sequence of non-slash characters.
    const regex = /\/([^/]+)$/
    const match = url.match(regex)
    return match ? match[1] : url // If the regex matched, return the captured group; otherwise, return the original url.
  }

  async function fetchFAQData(slug: string) {
    try {
      const faqDataModule = await import(`../../data/projects/${slug}/faq.json`)
      return faqDataModule.default
    } catch (error) {
      console.error('Error fetching FAQ data:', error)
      return {} // Return an empty object if there's an error (e.g., file doesn't exist)
    }
  }

  // Markdown Project Data
  const {
    // Main Info
    slug,
    title,
    summary,
    socialSummary,
    coverImage,
    content,

    // Community Interaction
    contributor,
    contributorsBitcoin,
    contributorsLitecoin,
    advocates,
    hashtag,

    // Resources and Metadata
    website,
    tutorials,
    owner,

    //Links
    twitterHandle,
    gitRepository,
    discordLink,
    telegramLink,
    facebookLink,
    redditLink,
    // Categorization and status
    type,
    bugSeverity,
    bugStatus,

    // Funding
    bountyAmount,
    bountyStatus,
    targetFunding,
    fundingDeadline,
    isRecurring,
    isBitcoinOlympics2024,
    isMatching,
    matchingMultiplier,
    recurringAmountGoal,
    recurringPeriod,
    totalPaid,

    // Timelines
    expectedCompletion,
    updates,
  } = project

  const [addressStats, setAddressStats] = useState<AddressStats>()
  const [twitterUsers, setTwitterUsers] = useState<TwitterUser[]>([])
  const [matchingTotal, setMatchingTotal] = useState(0)
  const [twitterContributors, setTwitterContributors] = useState<TwitterUser[]>(
    []
  )
  const [twitterContributorsBitcoin, setTwitterContributorsBitcoin] = useState<
    TwitterUser[]
  >([])
  const [twitterContributorsLitecoin, setTwitterContributorsLitecoin] =
    useState<TwitterUser[]>([])
  const [twitterAdvocates, setTwitterAdvocates] = useState<TwitterUser[]>([])

  const [faq, setFaq] = useState<any>({})
  const [faqCount, setFaqCount] = useState<any>()

  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [monthlyDonorCount, setMonthlyDonorCount] = useState(0)
  const [percentGoalCompleted, setPercentGoalCompleted] = useState(0)
  const [timeLeftInMonth, setTimeLeftInMonth] = useState(0)

  function formatLits(value) {
    const num = Number(value)

    if (isNaN(value) || value === '' || value === null) {
      return '0'
    }

    // Check if the value is zero
    if (num === 0) {
      return '0'
    }

    // Split the number into whole and fractional parts
    let [whole, fraction] = num.toFixed(8).split('.')
    whole += ''
    // Check if the fractional part is all zeros
    if (fraction && /^0+$/.test(fraction)) {
      return whole
    }

    // Format the fractional part with spaces
    if (fraction) {
      fraction =
        fraction.slice(0, 2) +
        ' ' +
        fraction.slice(2, 5) +
        ' ' +
        fraction.slice(5)
    }

    // Combine the whole and fractional parts
    return fraction ? `${whole}.${fraction}` : whole
  }

  // load faq
  useEffect(() => {
    async function loadFAQData() {
      const data = await fetchFAQData(slug)
      const totalItems = data?.questionsAndAnswers?.reduce((acc, category) => {
        return acc + category.items.length
      }, 0)
      setFaqCount(totalItems)
      setFaq(data)
    }

    loadFAQData()
  }, [slug])

  // get donations, contributors, and supporters
  useEffect(() => {
    const fetchData = async () => {
      // Fetch mission info
      setAddressStats(undefined)
      const stats = await fetchGetJSON(`/api/getInfo/?slug=${slug}`)
      setAddressStats(stats)

      // New logic for matching goal calculation
      if (
        isMatching &&
        typeof matchingMultiplier === 'number' &&
        isBitcoinOlympics2024
      ) {
        const matchingTotal =
          stats.funded_txo_sum * matchingMultiplier - stats.funded_txo_sum
        setMatchingTotal(matchingTotal) // returns  matchingTotal
      }

      // New logic for monthly goal calculation
      if (isRecurring && recurringAmountGoal) {
        const currentDate = new Date()
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        )
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        )

        // Filter donations
        const monthlyDonations = stats.donatedCreatedTime.filter((donation) => {
          // Convert donation createdTime to milliseconds by multiplying by 1000
          const donationDate = new Date(donation.createdTime * 1000)
          return donationDate >= startOfMonth && donationDate <= endOfMonth
        })

        setMonthlyDonorCount(monthlyDonations.length)
        const monthlyTotal = monthlyDonations.reduce(
          (total, donation) => total + Number(donation.amount),
          0
        )
        const percentGoalCompleted = (monthlyTotal / recurringAmountGoal) * 100

        // Set state for monthly total and percent completed
        setMonthlyTotal(monthlyTotal)
        setPercentGoalCompleted(percentGoalCompleted)

        // Calculating time left in the month
        const timeLeft = endOfMonth.getTime() - currentDate.getTime()
        const daysLeft = Math.ceil(timeLeft / (1000 * 3600 * 24))
        setTimeLeftInMonth(daysLeft)
      }

      if (contributor) {
        const contributorsArray = contributor.split(',')
        if (contributorsArray.length > 0) {
          const contributorsResponse = await fetch(
            `/api/twitterUsers?usernames=${contributor}` //&clearCache=true
          )
          const twitterContributors = await contributorsResponse.json()
          setTwitterContributors(twitterContributors)
        }
      }

      if (contributorsBitcoin) {
        const contributorsArray = contributorsBitcoin.split(',')
        if (contributorsArray.length > 0) {
          const contributorsResponse = await fetch(
            `/api/twitterUsers?usernames=${contributorsBitcoin}` //&clearCache=true
          )
          const twitterContributorsBitcoin = await contributorsResponse.json()
          setTwitterContributorsBitcoin(twitterContributorsBitcoin)
        }
      }

      if (contributorsLitecoin) {
        const contributorsArray = contributorsLitecoin.split(',')
        if (contributorsArray.length > 0) {
          const contributorsResponse = await fetch(
            `/api/twitterUsers?usernames=${contributorsLitecoin}` //&clearCache=true
          )
          const twitterContributorsLitecoin = await contributorsResponse.json()
          setTwitterContributorsLitecoin(twitterContributorsLitecoin)
        }
      }

      if (advocates) {
        const contributorsArray = advocates.split(',')
        if (contributorsArray.length > 0) {
          const contributorsResponse = await fetch(
            `/api/twitterUsers?usernames=${advocates}` //&clearCache=true
          )
          const twitterAdvocates = await contributorsResponse.json()
          setTwitterAdvocates(twitterAdvocates)
        }
      }

      // Fetch Twitter user details
      if (stats.supporters && stats.supporters.length > 0) {
        const supporters = stats.supporters.map((supporter) => {
          if (typeof supporter === 'string' || supporter instanceof String) {
            return extractUsername(supporter)
          } else {
            return 'anonymous'
          }
        })

        // Convert the array to a Set to remove duplicates
        const uniqueSupportersSet = new Set(supporters)

        // Convert the Set back to an array (if needed)
        const uniqueSupportersArray = Array.from(uniqueSupportersSet)

        // If you want to join the unique supporters into a comma-separated string
        const uniqueSupportersString = uniqueSupportersArray.join(',')
        const response = await fetch(
          `/api/twitterUsers?usernames=${uniqueSupportersString}` //&clearCache=true
        )
        const twitterUsers = await response.json()
        setTwitterUsers(twitterUsers)
      }
    }

    fetchData().catch(console.error)
  }, [contributor, slug])

  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(
    'mission'
  )

  const [selectedUpdateId, setSelectedUpdateId] = useState<number | null>(null)

  useEffect(() => {
    if (selectedUpdateId) {
      const element = document.getElementById(`update-${selectedUpdateId}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [selectedUpdateId])

  useEffect(() => {
    // Function to handle global clicks
    const handleGlobalClick = (event) => {
      // Only proceed if updates is defined
      if (updates) {
        // Logic to check if the click is outside of an update component
        let isOutside = true
        updates.forEach((post) => {
          // Assuming each ProjectUpdate or its wrapper div has an id `update-${post.id}`
          const element = document.getElementById(`update-${post.id}`)
          if (element && element.contains(event.target)) {
            isOutside = false
          }
        })

        // If the click is outside of all ProjectUpdate components, reset selectedUpdateId
        if (isOutside) {
          setSelectedUpdateId(null)
        }
      }
    }

    // Add the global click listener
    document.addEventListener('click', handleGlobalClick)

    // Clean up the event listener
    return () => {
      document.removeEventListener('click', handleGlobalClick)
    }
  }, [updates]) // Depend on updates, if they change, the effect will re-run

  // Define a handler function for menu item changes.
  const handleMenuItemChange = (newMenuItem, updateId = null) => {
    setSelectedMenuItem(newMenuItem)

    const updatedURL = updateId
      ? `/missions/${slug}?menu=${newMenuItem}&updateId=${updateId}`
      : `/missions/${slug}?menu=${newMenuItem}`

    router.push(updatedURL, undefined, { shallow: true })
  }

  // Check for menu query parameter
  useEffect(() => {
    const menu = router.query.menu
    const updateId = router.query.updateId

    // If `menu` is an array, take the first item; otherwise, use `menu` directly.
    const selectedMenu = Array.isArray(menu) ? menu[0] : menu

    if (selectedMenu) {
      setSelectedMenuItem(selectedMenu)
    } else {
      setSelectedMenuItem('mission')
    }

    if (updateId) {
      // Assuming `setSelectedUpdateId` can handle a number correctly.
      setSelectedUpdateId(Number(updateId))
      if (selectedMenu !== 'updates') {
        // Navigate to updates if not already there
        handleMenuItemChange('updates')
      }
    }
  }, [router.query])

  if (!router.isFallback && !slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <>
      <Head>
        <title>Lite.Space | {title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={summary} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@LTCFoundation" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={summary} />
        {/* <meta name="twitter:creator" content="@LTCFoundation" /> */}
        <meta
          name="twitter:image"
          content={`https://www.Lite.Space${coverImage}`}
        />
        <meta
          property="og:image"
          content={`https://www.Lite.Space${coverImage}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <div>
        <article className="mt-10 flex flex-col-reverse xl:flex-row xl:items-start">
          <div className="content rounded-xl bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-gray-100 to-gray-50 p-4 leading-relaxed text-gray-800 dark:from-gray-800 dark:to-gray-800 dark:text-gray-200  xl:mr-5 xl:w-[84ch]">
            {/* ## PROJECT HEADER */}
            <h1 className="pb-4 text-3xl font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
              {title}
            </h1>
            <p className="prose max-w-none pb-0 pt-0 text-xl font-normal dark:prose-dark">
              {summary}
            </p>
            <div className="pt-4">
              <ProjectSocialLinks
                website={website}
                gitRepository={gitRepository}
                twitterHandle={twitterHandle}
                discordLink={discordLink}
                telegramLink={telegramLink}
                facebookLink={facebookLink}
                redditLink={redditLink}
              />
            </div>

            {/* ## PROJECT CONTENT */}

            {/* ##Updates Section */}
            <ProjectMenu
              onMenuItemChange={handleMenuItemChange}
              activeMenu={selectedMenuItem}
              commentCount={
                hashtag && tweetsData[hashtag] ? tweetsData[hashtag].length : 0
              }
              faqCount={faqCount || 0}
              updatesCount={(updates && updates?.length - 1) || 0}
            />
            {/* ### Mission Section */}
            {selectedMenuItem === 'mission' && content && (
              <div
                className="markdown"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
            {/* ### Comments Section */}
            {selectedMenuItem === 'comments' && (
              <div className="markdown">
                <h1>{`${hashtag}`}</h1>
                <TwitterFeed hashtag={hashtag} tweetsData={tweetsData} />
              </div>
            )}
            {/* ### FAQ Section */}
            {selectedMenuItem === 'faq' && (
              <div className="markdown">
                <FAQSection faqCategories={faq.questionsAndAnswers} />
              </div>
            )}
            {/* ### Updates Section */}
            {selectedMenuItem === 'updates' && content && (
              <div className="markdown min-h-full">
                <div>
                  {updates &&
                  updates.filter((post) => post.id > 0).length > 0 ? (
                    updates
                      .filter((post) => post.id > 0)
                      .map((post, index) => (
                        <div key={index} id={`update-${post.id}`}>
                          <ProjectUpdate
                            title={post.title}
                            summary={post.summary}
                            authorTwitterHandle={post.authorTwitterHandle}
                            date={post.date}
                            tags={post.tags || []}
                            content={post.content}
                            id={post.id}
                            highlight={selectedUpdateId === post.id}
                          />
                        </div>
                      ))
                  ) : (
                    <h1>No updates available for this project.</h1>
                  )}
                </div>
              </div>
            )}
            {/* ### Community Section */}
            {selectedMenuItem === 'community' && (
              <>
                <div className="markdown">
                  {twitterContributors.length > 0 && !isBitcoinOlympics2024 ? (
                    <>
                      <h1>
                        {twitterContributors.length > 1
                          ? 'Contributors'
                          : 'Contributor'}
                      </h1>
                      <TwitterUsers users={twitterContributors} />
                    </>
                  ) : null}
                </div>
                <div className="markdown">
                  {twitterContributors.length > 0 && isBitcoinOlympics2024 ? (
                    <>
                      <h1>
                        {twitterContributors.length > 1
                          ? 'BTC Startup Labs'
                          : 'Contributor'}
                      </h1>
                      <TwitterUsers users={twitterContributors} />
                    </>
                  ) : null}
                </div>

                <div className="markdown">
                  {twitterContributorsLitecoin.length > 0 ? (
                    <>
                      <h1>
                        {twitterContributorsLitecoin.length > 1
                          ? 'Litecoin Contributors'
                          : 'Litecoin Contributor'}
                      </h1>
                      <TwitterUsers users={twitterContributorsLitecoin} />
                    </>
                  ) : null}
                </div>
                <div className="markdown">
                  {twitterContributorsBitcoin.length > 0 ? (
                    <>
                      <h1>
                        {twitterContributorsBitcoin.length > 1
                          ? 'Bitcoin Contributors'
                          : 'Bitcoin Contributor'}
                      </h1>
                      <TwitterUsers users={twitterContributorsBitcoin} />
                    </>
                  ) : null}
                </div>
                <div className="markdown">
                  {twitterAdvocates.length > 0 ? (
                    <>
                      <h1>
                        {twitterAdvocates.length > 1 ? 'Advocates' : 'Advocate'}
                      </h1>
                      <TwitterUsers users={twitterAdvocates} />
                    </>
                  ) : null}
                </div>
                <div className="markdown">
                  {twitterUsers.length > 0 ? (
                    <>
                      <h1>
                        {twitterUsers.length > 1 ? 'Supporters' : 'Supporter'}
                      </h1>
                      <TwitterUsers users={twitterUsers} />
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>
          <aside className="top-0 mb-8 flex min-w-[20rem] flex-col space-y-4 rounded-xl bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-gray-100 to-gray-50 p-4 dark:from-gray-800 dark:to-gray-800 lg:items-start xl:sticky ">
            <div className="relative h-[20rem] w-full overflow-hidden rounded-lg xl:h-[14rem] ">
              <Image
                alt={title}
                src={coverImage}
                layout="fill"
                objectFit="cover"
                objectPosition="50% 50%"
                priority={true}
              />
            </div>

            <div className="flex w-full flex-col items-start">
              {addressStats && !isMatching && !isRecurring && (
                <div className="flex w-full flex-col">
                  <div className="">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      Ł {formatLits(addressStats.funded_txo_sum)}
                    </h4>
                    <h4 className="dark:text-gray-100">Litecoin raised</h4>
                  </div>

                  <div className="mt-2">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      Ł {formatLits(totalPaid)}
                    </h4>
                    <h4 className="dark:text-gray-100">
                      Litecoin paid to contributors
                    </h4>
                  </div>

                  <div className="mt-2">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      {addressStats.tx_count || '0'}
                    </h4>
                    <h4 className="dark:text-gray-100">donations</h4>
                  </div>
                </div>
              )}
              {addressStats && isMatching && isBitcoinOlympics2024 && (
                <div className="flex w-full flex-col">
                  <div className="">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      Ł {formatLits(addressStats.funded_txo_sum)}
                    </h4>
                    <h4 className="dark:text-gray-100">
                      The Litecoin Community Raised Prize
                    </h4>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      Ł {formatLits(matchingTotal)}
                    </h4>
                    <h4 className="dark:text-gray-100">
                      Prizes Matched by Charlie Lee & Galal Doss
                    </h4>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      Ł{' '}
                      {formatLits(addressStats.funded_txo_sum + matchingTotal)}{' '}
                      + $8,000
                    </h4>
                    <h4 className="dark:text-gray-100">Total Prize pool</h4>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      Ł {formatLits(totalPaid)}
                    </h4>
                    <h4 className="dark:text-gray-100">
                      Awarded to Bitcoin Olympics 2024 Participants
                    </h4>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                      {addressStats.tx_count || '0'}
                    </h4>
                    <h4 className="dark:text-gray-100">donations</h4>
                  </div>
                </div>
              )}

              {isRecurring && addressStats && (
                <div className="w-full rounded-lg  text-gray-800">
                  <div className="flex w-full flex-row xl:flex-col">
                    <div>
                      <h2>Total Donations:</h2>
                      {addressStats && (
                        <div className="">
                          <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                            Ł {formatLits(addressStats.funded_txo_sum)}{' '}
                          </h4>
                          <h4 className="dark:text-gray-100">
                            Litecoin raised
                          </h4>
                        </div>
                      )}
                      {addressStats && (
                        <div className="mt-4">
                          <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                            {addressStats.tx_count || '0'}
                          </h4>
                          <h4 className="dark:text-gray-100">supporters</h4>
                        </div>
                      )}
                    </div>
                    <div className="pl-16 xl:pl-0 xl:pt-4">
                      <h2>Monthly Goal:</h2>
                      <div>
                        <div>
                          <h4 className="text-3xl font-semibold text-blue-500 dark:text-blue-400">
                            Ł {formatLits(monthlyTotal)}
                          </h4>
                          <h4 className="dark:text-gray-100">
                            donated of Ł{recurringAmountGoal} monthly goal
                          </h4>
                        </div>
                      </div>
                      <div className="flex flex-row">
                        <div className="flex flex-col">
                          <h4 className="mt-4 text-3xl font-semibold text-blue-500 dark:text-blue-400">
                            {monthlyDonorCount}
                          </h4>
                          <h4 className="dark:text-gray-100">supporters</h4>
                        </div>
                        <div className="ml-8 flex flex-col">
                          <h4 className="mt-4 text-3xl font-semibold text-blue-500 dark:text-blue-400">
                            {timeLeftInMonth}
                          </h4>
                          <h4 className="dark:text-gray-100">days to go</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={openPaymentModal}
              className={`hover:white block w-full rounded-lg bg-blue-500 text-xl text-white transition-colors  duration-200 hover:border-transparent hover:bg-blue-400 dark:bg-blue-400 dark:text-gray-100 dark:hover:bg-blue-300 ${
                bountyStatus === 'completed' ? 'disabled' : ''
              }`}
              disabled={bountyStatus === 'completed'}
            >
              {bountyStatus === 'completed'
                ? 'Mission Completed'
                : 'Support this mission'}
            </button>
            <SocialMediaShare
              className="mt-0 flex w-min  space-x-1 rounded-xl bg-blue-100 p-2 px-6 dark:bg-blue-900"
              title={title}
              summary={socialSummary}
            />
          </aside>
        </article>
      </div>

      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
      <ThankYouModal
        isOpen={isThankYouModalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}

export default Project

type ParamsType = {
  slug: string
}

export async function getStaticProps({ params }: { params: ParamsType }) {
  const post = getPostBySlug(params.slug)
  const updates = getAllPostUpdates(params.slug) || []

  const projects = getAllPosts()

  const content = await markdownToHtml(post.content || '')
  return {
    props: {
      project: {
        ...post,
        content,
        updates,
      },
      projects,
    },
  }
}

export async function getStaticPaths() {
  const posts = getAllPosts()

  return {
    paths: posts.map((post) => {
      return {
        params: {
          project: post,
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}
