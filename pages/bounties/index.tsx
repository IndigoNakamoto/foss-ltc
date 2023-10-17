//pages/bounties/index.tsx

import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import PaymentModal from '../../components/PaymentModal'
import ProjectCard from '../../components/ProjectCard'
import { ProjectItem } from '../../utils/types'
import { getAllPosts } from '../../utils/md'
// import Link from '@/components/Link'
import { isBounty } from 'pages/missions'

const AllProjects: NextPage<{ projects: ProjectItem[] }> = ({ projects }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const [selectedProject, setSelectedProject] = useState<ProjectItem>()

  const [sortedProjects, setSortedProjects] = useState<ProjectItem[]>()

  useEffect(() => {
    setSortedProjects(projects.filter(isBounty).sort(() => 0.5 - Math.random()))
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
        <title>Bounties | Lite.Space</title>
      </Head>
      <h1 className="mt-10 font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 xs:text-6xl sm:leading-10 md:text-7xl md:leading-14">
        Bounties
      </h1>
      <section className="flex flex-col p-4 md:p-8">
        <div className="flex w-full items-center justify-between pb-8">
          <h2
            id="funds"
            className="text-3xl font-semibold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl sm:leading-10 md:text-5xl md:leading-14"
          >
            Open Bounties
          </h2>
        </div>
        <ul className="grid max-w-5xl gap-4 md:grid-cols-2">
          {sortedProjects &&
            sortedProjects.map((p, i) => (
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
