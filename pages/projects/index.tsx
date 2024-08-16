import type { NextPage } from 'next'
import Head from 'next/head'
// import { useEffect, useState } from 'react'
import PaymentModal from '@/components/PaymentModal'
import ProjectCard from '@/components/ProjectCard'
import { ProjectItem, ProjectCategory, BountyStatus } from '../../utils/types'
import { getAllPosts } from '../../utils/md'
import LitecoinIcon from '@/components/litecoin-icons'
import VerticalSocialIcons from '@/components/VerticalSocialIcons'
import faqData from '../../data/pages/faq.json'
import { FAQSection } from '@/components/FAQSection'
import React, { useEffect, useState, useRef } from 'react'

// TODO: Fix scroll bar. Return to default

const AllProjects: NextPage<{ projects: ProjectItem[] }> = ({ projects }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectItem>()
  const [openSourceProjects, setOpenSourceProjects] = useState<ProjectItem[]>()
  const [DevOpsProjects, setDevOpsProjects] = useState<ProjectItem[]>()
  const [bountyProjects, setBountyProjects] = useState<ProjectItem[]>()
  const [completedProjects, setCompletedProjects] = useState<ProjectItem[]>()
  const [scrollPosition, setScrollPosition] = useState(0)
  const outerSpinnerRef = useRef(null)
  const innerSpinnerRef = useRef(null)

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

  function closeModal() {
    setModalOpen(false)
  }

  useEffect(() => {
    const desiredOrder = [
      'General Fund',
      'Litecoin Core',
      'MWEB',
      'Ordinals Lite',
      'Litewallet',
      'Litecoin Development Kit',
      'Litecoin Mempool Explorer',
    ]

    setOpenSourceProjects(
      projects.filter(isProject).sort((a, b) => {
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

    setDevOpsProjects(
      projects
        .filter(isDevelopment)
        .sort((a, b) => a.title.localeCompare(b.title))
    )
    setBountyProjects(projects.filter(isBounty))
    setCompletedProjects(
      projects.filter(isCompletedBounty).sort(() => 0.5 - Math.random())
    )
  }, [projects])

  function openPaymentModal(project: ProjectItem) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  const bgColors = ['bg-[#EEEEEE]', 'bg-[#c6d3d6]', 'bg-[#f3ccc4]']

  return (
    <>
      <Head>
        <title>Projects</title>
      </Head>
      <VerticalSocialIcons />

      {/* Hero section */}
      <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-[60vh] w-screen max-w-none bg-cover bg-center"
        style={{
          backgroundImage: "url('/static/images/design/Mask-Group-19.webp')",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
      >
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col-reverse justify-center justify-between gap-y-40  pt-40 lg:flex-row lg:items-center lg:pt-10 ">
          <div className=" py-20 lg:py-40 ">
            {/* Column 1 */}
            <h1 className="font-space-grotesk text-4xl text-[41px] font-bold leading-[32px] tracking-wide text-black">
              Litecoin Projects
            </h1>
            <p className="max-w-prose pt-6 text-[19px]">
              The Litecoin Foundation is dedicated to consistently improving the
              Litecoin network, whilst supporting the development of exciting
              projects on the Litecoin blockchain. Below are a handful of
              initiatives that demonstrate Litecoin's commitment to innovation
              and improving the experience of its users.
            </p>
            <div className="my-8 flex max-w-[508px] flex-col gap-4">
              <div className="text-md rounded-3xl bg-[#222222] px-6 py-3 text-center font-medium ">
                <p className="text-white">DONATE NOW</p>
              </div>
              <div className="flex w-full flex-row justify-center gap-2">
                <div className="text-md w-full rounded-3xl bg-[#222222] px-6 py-3 text-center font-medium ">
                  <p className="text-white">VIEW PROJECTS</p>
                </div>
                <div className="text-md w-full rounded-3xl bg-[#222222] px-6 py-3 text-center font-medium ">
                  <p className="text-white">VIEW BOUNTIES</p>
                </div>
              </div>
            </div>
          </div>
          {/* Column 2 */}
          <div className="relative w-1/2   pt-40 lg:w-[full] lg:pb-0 lg:pl-20 lg:pt-0">
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
                className="absolute w-[full] lg:w-[full]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* OPEN SOURCE PROJECTS */}
      <section
        className="relative left-1/2 right-1/2 my-20 -ml-[50vw] -mr-[50vw] w-screen max-w-none  bg-[#333333] bg-cover bg-center"
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        }}
      >
        <div className="m-auto  flex h-full w-[1300px] max-w-[90%] flex-col items-center justify-center">
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-medium leading-[32px] tracking-wide text-white">
            Open-Source Projects
          </h1>
          <ul className="grid max-w-full gap-6 md:grid-cols-2 xl:grid-cols-3">
            {openSourceProjects &&
              openSourceProjects.map((p, i) => (
                <li key={i}>
                  <ProjectCard
                    project={p}
                    openPaymentModal={openPaymentModal}
                    bgColor={bgColors[i % bgColors.length]}
                  />
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[600px] w-screen max-w-none bg-[#C5D3D6] bg-cover bg-center">
        {/* TODO: APPLY SECTION */}
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] items-center justify-center p-8">
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-medium leading-[32px] tracking-wide text-black">
            Apply
          </h1>
        </div>
      </section>

      {/* OPEN BOUNTY PROJECTS */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-none bg-white  bg-cover bg-center pb-20">
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col items-center justify-center">
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-semibold leading-[32px] tracking-wide text-black">
            Open Bounties
          </h1>
          <ul className="grid max-w-full">
            {bountyProjects &&
              bountyProjects.map((p, i) => (
                <li key={i}>
                  <ProjectCard
                    project={p}
                    openPaymentModal={openPaymentModal}
                    bgColor={'bg-[#f3ccc4]'}
                  />
                </li>
              ))}
          </ul>
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-semibold leading-[32px] tracking-wide text-black">
            Closed Bounties
          </h1>
          <ul className="grid max-w-full gap-6 md:grid-cols-2 xl:grid-cols-3">
            {completedProjects &&
              completedProjects.map((p, i) => (
                <li key={i}>
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
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-none bg-[#F0F0F0] bg-cover bg-center py-20 pt-16">
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] flex-col md:flex-row md:justify-between">
          {/* Left Column: Static h1 */}
          <div className="md:sticky md:top-32 md:w-1/3 md:pr-8">
            <h1 className="font-space-grotesk text-4xl text-[41px] font-medium leading-[32px] tracking-wide text-black">
              Frequently Asked Questions:
            </h1>
          </div>

          {/* Right Column: FAQ Section */}
          <div className="w-full md:w-2/3">
            <div className="mt-8 w-full rounded-xl bg-gradient-to-r from-gray-100 to-gray-300 p-4 md:mt-0 md:px-4 lg:px-8">
              <FAQSection faqCategories={faqData.questionsAndAnswers} />
            </div>
          </div>
        </div>
      </section>

      {/* TODO: CONTRIBUTORS SECTION */}
      {/* <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[600px] w-screen max-w-none  bg-[#F3CBC4] bg-cover bg-center">
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] items-center justify-center p-8">
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-medium leading-[32px] tracking-wide text-black">
            Contributors
          </h1>
        </div>
      </section> */}

      {/* TODO: SUPPORTERS SECTION */}
      {/* <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[600px] w-screen max-w-none bg-white bg-cover bg-center">
        <div className="m-auto flex h-full w-[1300px] max-w-[90%] items-center justify-center p-8">
          <h1 className="m-8 font-space-grotesk text-4xl text-[41px] font-medium leading-[32px] tracking-wide text-black">
            Supporters
          </h1>
        </div>
      </section> */}

      <PaymentModal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        project={selectedProject}
      />
    </>
  )
}

export default AllProjects

export async function getStaticProps({ params }: { params: any }) {
  const projects = getAllPosts()

  return {
    props: {
      projects,
    },
  }
}

export function isOpenSatsProject(project: ProjectItem): boolean {
  return project.nym === 'Litecoin Foundation'
}

export function isNotOpenSatsProject(project: ProjectItem): boolean {
  return !isOpenSatsProject(project)
}

export function isBounty(project: ProjectItem): boolean {
  return (
    project.type === ProjectCategory.BOUNTY &&
    project.bountyStatus === BountyStatus.OPEN
  )
}

export function isCompletedBounty(project: ProjectItem): boolean {
  return project.bountyStatus === BountyStatus.COMPLETED
}

export function isOpenBounty(project: ProjectItem): boolean {
  return project.bountyStatus === BountyStatus.OPEN
}

export function isDevelopment(project: ProjectItem): boolean {
  return project.type === ProjectCategory.DEVELOPMENT
}
export function isProject(project: ProjectItem): boolean {
  return project.type === ProjectCategory.PROJECT
}
