//pages/projects/index.tsx

import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/legacy/image' // <-- Import the Image component
import { useEffect, useState } from 'react'
import PaymentModal from '../../components/PaymentModal'
import ProjectCard from '../../components/ProjectCard'
import { ProjectItem, ProjectCategory, BountyStatus } from '../../utils/types'
import { getAllPosts } from '../../utils/md'
// import Link from '@/components/Link'
import Typing from '@/components/Typing'
import siteMetadata from '@/data/siteMetadata'
import LitecoinIcon from '@/components/litecoin-icons'

const AllProjects: NextPage<{ projects: ProjectItem[] }> = ({ projects }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  const [openSourceProjects, setOpenSourceProjects] = useState<ProjectItem[]>()
  const [DevOpsProjects, setDevOpsProjects] = useState<ProjectItem[]>()
  const [bountyProjects, setBountyProjects] = useState<ProjectItem[]>()

  useEffect(() => {
    // setOpenSourceProjects(
    //   projects.filter(isProject).sort((a, b) => a.title.localeCompare(b.title))
    // )

    const desiredOrder = [
      'General Fund',
      'Litecoin Core',
      'MWEB',
      'Ordinals Lite',
      'Litewallet',
      'Litecoin Development Kit',
      'Litecoin Mempool Explorer',
    ] // everything else in order by title

    setOpenSourceProjects(
      projects.filter(isProject).sort((a, b) => {
        const indexA = desiredOrder.indexOf(a.title)
        const indexB = desiredOrder.indexOf(b.title)

        // If both titles are in the desired order array, compare their positions.
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB
        }

        // If only one of the titles is in the desired order array, prioritize it.
        if (indexA !== -1) {
          return -1
        }
        if (indexB !== -1) {
          return 1
        }

        // If neither title is in the desired order array, sort them alphabetically.
        return a.title.localeCompare(b.title)
      })
    )

    setDevOpsProjects(
      projects
        .filter(isDevelopment)
        .sort((a, b) => a.title.localeCompare(b.title))
    )
    setBountyProjects(projects.filter(isBounty))
  }, [projects])

  function closeModal() {
    setModalOpen(false)
  }

  function openPaymentModal(project: ProjectItem) {
    setSelectedProject(project)
    setModalOpen(true)
  }

  return (
    <>
      <Head>
        <title>Lite.Space | Explore</title>
      </Head>

      <section className="mt-8">
        <div className="relative h-96 overflow-hidden rounded-xl border-2 dark:border-gray-700">
          <Image
            src="/static/images/hero.jpg"
            layout="fill"
            objectFit="cover"
            alt="Lite.Space Hero Image"
            priority={true}
            className="absolute left-0 top-0 z-0 h-full w-full"
          />
          {/* Text content */}
          <div className="z-1 absolute left-0 top-0 flex h-full w-full flex-col justify-center  bg-black bg-opacity-40 px-4">
            <div className="flex items-center">
              {' '}
              {/* Add this line to create a flex container */}
              <h1 className="flex-grow text-5xl font-semibold leading-9 tracking-tight text-gray-100 sm:leading-10 md:text-7xl md:leading-14 xl:col-span-2">
                Explore Missions
              </h1>
              {/* Position LitecoinIcon next to the h1 */}
              <div className="flex h-full md:mr-20 xs:mr-4">
                {' '}
                {/* Added styles to vertically center and give spacing */}
                {/* TODO: LitecoinIcon not rendering */}
                <LitecoinIcon kind="coinBlueL" />
              </div>
            </div>
            <div className="space-y-0 pb-0 pt-4 md:space-y-0">
              <h1 className="pb-2 text-2xl font-semibold leading-9 tracking-tight text-gray-100 sm:text-4xl sm:leading-10 md:text-5xl md:leading-14 xs:text-3xl">
                Supporting <Typing />
              </h1>
              <p className="mb-0 pt-32 text-2xl font-medium leading-7 text-gray-100">
                {siteMetadata.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-2 pb-0 pt-10 md:space-y-5 xl:grid xl:grid-cols-3 xl:gap-x-8">
        <h2 className="pl-4 pt-10 text-5xl font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:leading-10 md:text-7xl md:leading-14 xl:col-span-2">
          Open-Source Projects
        </h2>
      </div>
      <section className="flex flex-col rounded-3xl bg-gradient-to-b from-gray-200 to-gray-300 p-4 dark:from-gray-700 dark:to-gray-600 md:p-8">
        <div className="flex w-full items-center justify-between"></div>
        <ul className="grid max-w-5xl gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {openSourceProjects &&
            openSourceProjects.map((p, i) => (
              <li key={i} className="">
                <ProjectCard project={p} openPaymentModal={openPaymentModal} />
              </li>
            ))}
        </ul>
      </section>
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
