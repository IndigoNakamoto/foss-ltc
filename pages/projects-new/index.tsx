// pages/projects/index.tsx
import type { NextPage } from 'next'

import Head from 'next/head'
import PaymentModal from '@/components/PaymentModal'
import ProjectCard from '@/components/ProjectCard'
import { ProjectItem, ProjectCategory, BountyStatus } from '../../utils/types'
import VerticalSocialIcons from '@/components/VerticalSocialIcons'
// import faqData from '../../data/pages/faq.json'
import { FAQSection } from '@/components/FAQSection'
import React, { useEffect, useState, useRef } from 'react'
import { useDonation } from '../../contexts/DonationContext'
import Link from 'next/link'
import TypingScroll from '@/components/TypingScroll'
import { useRouter } from 'next/router'
import axios from 'axios'
import { useCallback, useMemo } from 'react'
import SectionProjects from '@/components/SectionProjects'
// TODO: Fix scroll bar. Return to default

const project = {
  slug: 'projects-fund',
  title: 'Projects Fund',
  summary: '',
  coverImage: '/static/images/projects/projects2.png',
  telegramLink: '',
  redditLink: '',
  facebookLink: '',
  type: ProjectCategory.BOUNTY,
  isRecurring: false,
}

function useIsLgScreen() {
  const [isLgScreen, setIsLgScreen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')

    const handleResize = () => {
      setIsLgScreen(mediaQuery.matches)
    }

    handleResize() // Set initial value
    mediaQuery.addEventListener('change', handleResize)

    return () => {
      mediaQuery.removeEventListener('change', handleResize)
    }
  }, [])

  return isLgScreen
}

const AllProjects: NextPage = () => {
  const router = useRouter()
  const { dispatch } = useDonation()
  const [modalOpen, setModalOpen] = useState(false)
  const [openSourceProjects, setOpenSourceProjects] = useState<ProjectItem[]>()
  const [completedProjects, setCompletedProjects] = useState<ProjectItem[]>()
  const [openBounties, setOpenBounties] = useState<ProjectItem[]>()

  const outerSpinnerRef = useRef(null)
  const innerSpinnerRef = useRef(null)
  const isLgScreen = useIsLgScreen()

  useEffect(() => {
    // Open modal if 'modal=true' is in the URL
    if (router.query.modal === 'true') {
      setModalOpen(true)
    } else {
      setModalOpen(false)
    }
  }, [router.query])

  useEffect(() => {
    let previousScrollY = window.scrollY
    let rotationAngle = 0

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - previousScrollY

      rotationAngle += scrollDelta * 0.08 // Adjust factor for desired speed
      if (outerSpinnerRef.current) {
        ;(
          outerSpinnerRef.current as HTMLElement
        ).style.transform = `rotate(${rotationAngle}deg)`
      }

      previousScrollY = currentScrollY
    }

    let requestId: number

    const animate = () => {
      requestId = requestAnimationFrame(animate)
      handleScroll()
    }

    animate()
    return () => {
      cancelAnimationFrame(requestId)
    }
  }, [])

  useEffect(() => {
    if (innerSpinnerRef.current) {
      const element = innerSpinnerRef.current as HTMLElement
      element.style.width = '80%' // Reduce the size of the inner element
      element.style.height = '80%'
    }
  }, [])

  function determineProjectType(status: string): ProjectCategory {
    if (status === 'Open') {
      return ProjectCategory.PROJECT
    } else if (status === 'Bounty Open' || status === 'Bounty Closed') {
      return ProjectCategory.BOUNTY
    } else {
      return ProjectCategory.OTHER // You can define 'OTHER' in your enum or handle it accordingly
    }
  }

  function determineProjectStatus(status: string): BountyStatus | undefined {
    switch (status) {
      case 'Bounty Open':
        return BountyStatus.OPEN
      case 'Closed':
        return BountyStatus.CLOSED
      case 'Bounty Closed':
        return BountyStatus.BOUNTY_CLOSED
      case 'Completed':
        return BountyStatus.COMPLETED
      case 'Bounty Completed':
        return BountyStatus.BOUNTY_COMPLETED
      default:
        return undefined
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/webflow/projects')

        const projects = response.data.projects

        const transformedProjects: ProjectItem[] = projects.map(
          (project: any) => {
            const status = project.fieldData.status
            const projectType = determineProjectType(status)
            const bountyStatus = determineProjectStatus(status)

            return {
              slug: project.fieldData.slug,
              title: project.fieldData.name,
              summary: project.fieldData.summary,
              coverImage: project.fieldData['cover-image'].url,
              telegramLink: project.fieldData['telegram-link'] || '',
              redditLink: project.fieldData['reddit-link'] || '',
              facebookLink: project.fieldData['facebook-link'] || '',
              type: projectType,
              bountyStatus: bountyStatus,
              status: status, // Add status here
              isRecurring: false,
              nym: 'Litecoin Foundation',
            }
          }
        )

        const desiredOrder = [
          'Projects Fund',
          'Litecoin Core',
          'MWEB',
          'Ordinals Lite',
          'Litewallet',
          'Litecoin Development Kit',
          'Litecoin Mempool Explorer',
        ]

        setOpenSourceProjects(
          transformedProjects.filter(isProject).sort((a, b) => {
            const indexA = desiredOrder.indexOf(a.title)
            const indexB = desiredOrder.indexOf(b.title)

            if (indexA !== -1 && indexB !== -1) {
              return indexA - indexB
            }

            if (indexA !== -1) {
              return -1
            }
            if (indexB !== -1) {
              return 1
            }

            return a.title.localeCompare(b.title)
          })
        )

        setOpenBounties(transformedProjects.filter(isOpenBounty))

        setCompletedProjects(transformedProjects.filter(isPastProject))
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    }

    fetchProjects()
  }, [])

  function closeModal() {
    setModalOpen(false)
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, modal: 'false' },
      },
      undefined,
      { shallow: true }
    )
  }

  const openPaymentModal = useCallback(() => {
    setModalOpen(true)
    dispatch({
      type: 'SET_PROJECT_DETAILS',
      payload: {
        slug: project.slug,
        title: project.title,
        image: project.coverImage,
      },
    })

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, modal: 'true' },
      },
      undefined,
      { shallow: true }
    )
  }, [project.slug, project.title, project.coverImage, dispatch, router])

  const projectsRef = useRef<HTMLDivElement>(null)
  const bountiesRef = useRef<HTMLDivElement>(null)

  const scrollToProjects = () => {
    const yOffset = -64 // Offset by the height of the sticky menu
    const yPosition =
      (projectsRef.current?.getBoundingClientRect().top ?? 0) +
      window.scrollY +
      yOffset
    window.scrollTo({ top: yPosition, behavior: 'smooth' })
  }

  const scrollToBounties = () => {
    const yOffset = -64 // Offset by the height of the sticky menu
    const yPosition =
      (bountiesRef.current?.getBoundingClientRect().top ?? 0) +
      window.scrollY +
      yOffset
    window.scrollTo({ top: yPosition, behavior: 'smooth' })
  }

  const bgColors = useMemo(() => ['bg-[#EEEEEE]', 'bg-[#c6d3d6]'], [])

  return (
    <div className="w-screen">
      <Head>
        <title>Projects</title>
      </Head>
      <VerticalSocialIcons />
      <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex max-h-fit min-h-[62vh] w-full items-center bg-cover bg-center lg:py-24"
        style={{
          backgroundImage: "url('/static/images/design/Mask-Group-20.webp')",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
      >
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col-reverse justify-center gap-y-40 lg:flex-row lg:items-center">
          <div className="lg:py-30 py-20 lg:w-1/2">
            <h1 className="font-space-grotesk text-4xl text-[41px] font-bold leading-[32px] tracking-wide text-black">
              Litecoin Projects
            </h1>
            <p className="w-11/12 pt-6 text-[19px]">
              The Litecoin Foundation is dedicated to consistently improving the
              Litecoin network, whilst supporting the development of exciting
              projects on the Litecoin blockchain. Below are a handful of
              initiatives that demonstrate Litecoin's commitment to innovation
              and improving the experience of its users.
            </p>
            <div className="my-8 flex w-11/12 max-w-[508px] flex-col gap-4">
              <div className="text-md rounded-3xl bg-[#222222] px-6 py-1 text-center font-medium">
                <button
                  className="text-md w-full cursor-pointer rounded-3xl bg-[#222222] text-center font-medium"
                  onClick={() => openPaymentModal()}
                >
                  DONATE NOW
                </button>
              </div>

              <div className="flex w-full flex-row justify-center gap-2">
                <button
                  className="text-md w-full cursor-pointer rounded-3xl bg-[#222222] px-6 py-3 text-center font-medium"
                  onClick={scrollToProjects}
                >
                  <span className="text-white">VIEW PROJECTS</span>
                </button>
                <button
                  className="text-md w-full cursor-pointer rounded-3xl bg-[#222222] px-6 py-3 text-center font-medium"
                  onClick={scrollToBounties}
                >
                  <span className="text-white">VIEW PAST PROJECTS</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-7/12 pt-80 lg:w-1/2 lg:pb-0 lg:pl-20 lg:pt-0">
            <div className="relative flex items-center justify-center">
              <img
                src="/static/images/design/outline-litecoin-spinner-inner.svg"
                alt="Litecoin Spinner Inner"
                className="absolute w-1/2 max-w-[160px] pb-8 lg:max-w-[full]"
              />
              <img
                src="/static/images/design/outline-litecoin-spinner-outer.svg"
                alt="Litecoin Spinner Outer"
                ref={outerSpinnerRef}
                className="absolute w-full lg:w-full"
              />
            </div>
          </div>
        </div>
      </section>
      <SectionProjects bgColor={'#f2f2f2'}>
        {/* Matching Donations Section */}

        <div className="mx-auto max-w-4xl p-4 py-16 text-center">
          <h1 className="mb-4 font-space-grotesk text-4xl font-bold text-[#222222]">
            Double Your Impact with Charlie Lee’s Matching Donations!
          </h1>
          <p className="mb-6 font-space-grotesk text-lg  text-[#333333]">
            In an exciting announcement at the Litecoin Summit in Nashville,
            Charlie Lee has pledged to match donations up to{' '}
            <strong>$250,000 annually</strong> for the next five years, totaling{' '}
            <strong>$1.25 million</strong>! This means your donation will have
            double the impact.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <div className="flex-1">
              <h3 className="mb-2 font-space-grotesk text-2xl font-semibold  text-[#222222]">
                Allocation of Funds:
              </h3>
              <ul className="list-inside list-disc font-space-grotesk  text-lg text-[#555555]">
                <li>
                  <strong>$50,000</strong> dedicated to the projects and bounty
                  program.
                </li>
                <li>
                  <strong>$200,000</strong> for direct support of the Litecoin
                  Foundation.
                </li>
              </ul>
            </div>
            <div className="flex-1 font-space-grotesk ">
              <h3 className="mb-2 text-2xl font-semibold text-[#222222]">
                Why It Matters:
              </h3>
              <p className="markdown text-lg text-[#555555]">
                "Because Litecoin was launched fairly, as you all know, we
                didn’t print money for ourselves. So because of that the
                Litecoin Foundation is very lean. Most projects that come to us
                we have to turn down because we don’t have the funding. I want
                to change that." - <em>Charlie Lee</em>
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#777777]">
            *Charlie Lee will match your donations dollar for dollar up to the
            specified amounts each year.
          </p>
        </div>
      </SectionProjects>
      {/* OPEN SOURCE PROJECTS */}
      <section
        ref={projectsRef}
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-20 flex max-h-fit min-h-[62vh] w-full items-center bg-cover bg-center"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
      >
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col items-center justify-center">
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-medium leading-tight tracking-wide text-white">
            Open-Source Projects
          </h1>
          <ul className="grid max-w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {openSourceProjects &&
              openSourceProjects.map((p, i) => {
                const bgColor = bgColors[i % bgColors.length]

                return (
                  <li key={i} className="flex">
                    <ProjectCard
                      project={p}
                      openPaymentModal={openPaymentModal}
                      bgColor={bgColor}
                    />
                  </li>
                )
              })}
          </ul>
        </div>
      </section>
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[300px] w-full bg-white bg-cover bg-center">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <h2 className="font-space-grotesk text-5xl font-semibold tracking-tight text-gray-800 lg:text-7xl">
            We Help Advance
          </h2>
          <h3 className="font-space-grotesk text-3xl font-semibold text-gray-800 lg:text-4xl">
            <TypingScroll />
          </h3>
          <p className="pt-2 font-space-grotesk text-2xl text-gray-600">
            Unite. Fund. Advance. - The Litecoin Project Development Portal
          </p>
        </div>
      </section>
      {/* OPEN BOUNTIES */}
      {openBounties && openBounties.length > 0 ? (
        <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[30vh]  w-full bg-[#f3ccc4] bg-cover bg-center pb-20">
          <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col items-center justify-center">
            <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-medium leading-tight tracking-wide text-black">
              Open Bounties
            </h1>
            <ul className="grid max-w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {openSourceProjects &&
                openSourceProjects.map((p, i) => {
                  const bgColor = bgColors[i % bgColors.length]

                  return (
                    <li key={i} className="flex">
                      <ProjectCard
                        project={p}
                        openPaymentModal={openPaymentModal}
                        bgColor={bgColor}
                      />
                    </li>
                  )
                })}
            </ul>
          </div>
        </section>
      ) : (
        <></>
      )}
      {/* SUBMIT PROJECT SECTION */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[600px] w-full bg-[#C5D3D6] bg-cover bg-center">
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col-reverse justify-center gap-y-40 lg:flex-row lg:items-center">
          <div className="flex h-4/6 min-h-fit w-full flex-col justify-center border border-[#222222] p-16">
            <h1 className="m-auto py-4 font-space-grotesk text-4xl text-[41px] font-medium leading-[32px]  text-black">
              Submit a Project
            </h1>
            <p className="m-auto max-w-3xl text-lg  text-[#222222] ">
              We are looking to support talented individuals and teams who share
              our commitment to decentralized open-source solutions and the
              future of Litecoin.
            </p>
            <Link href="/projects-new/submit" className="m-auto pt-4">
              <button className="w-48 rounded-none border border-[#222222] font-semibold text-[#222222]">
                Submit Project
              </button>
            </Link>
          </div>
        </div>
      </section>
      {/* PAST PROJECTS */}
      <section
        ref={bountiesRef}
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-full bg-white bg-cover bg-center pb-20"
      >
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col items-center justify-center">
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-semibold leading-[32px] tracking-wide text-black">
            Past Projects
          </h1>
          <ul className="grid max-w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {completedProjects &&
              completedProjects.map((p, i) => (
                <li key={i} className="flex">
                  <ProjectCard
                    project={p}
                    openPaymentModal={openPaymentModal}
                    bgColor={'bg-[#f3ccc4]'}
                  />
                </li>
              ))}
          </ul>
        </div>
      </section>
      {/* FAQ SECTION */}
      {/* <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-full bg-[#C5D3D6] bg-cover bg-center py-20 pt-16"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
      >
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col md:justify-between lg:flex-row"> */}
      {/* Left Column: Static h1 */}
      {/* <div
            className="w-full pb-8 xl:w-[40%]"
            style={
              isLgScreen
                ? {
                    position: 'sticky',
                    top: '6rem',
                    alignSelf: 'start',
                  }
                : {}
            }
          >
            <h1 className="font-space-grotesk text-4xl text-[41px] font-semibold leading-[50px] text-black">
              Frequently Asked Questions:
            </h1>
            <p className="font-[15px]">
              To learn more about Litecoin, take a look at our FAQs:
            </p>
          </div> */}
      {/* Right Column: FAQ Section */}
      {/* <div className="w-full xl:w-[60%]">
            <div className="rounded-x mt-8 w-full md:mt-0">
              <FAQSection faqs={faqData.questionsAndAnswers} />
            </div>
          </div>
        </div>
      </section> */}
      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={project}
      />
    </div>
  )
}

export default AllProjects

export function isProject(project: ProjectItem): boolean {
  return ['Open'].includes(project.status || '')
}

export function isOpenBounty(project: ProjectItem): boolean {
  return ['Bounty Open'].includes(project.status || '')
}

export function isPastProject(project: ProjectItem): boolean {
  return ['Bounty Closed', 'Bounty Completed', 'Closed', 'Completed'].includes(
    project.status || ''
  )
}