import ReactModal from 'react-modal'
import Image from 'next/legacy/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'
import DonationForm from './DonationForm'
import { ProjectItem } from '../utils/types'

type ModalProps = {
  isOpen: boolean
  onRequestClose: () => void
  project: ProjectItem | undefined
}
const PaymentModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  project,
}) => {
  if (!project) {
    // We never see this yeah?
    return <div />
  }

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="max-h-full w-11/12 overflow-y-auto bg-white p-8 shadow-xl dark:bg-stone-800 sm:m-8 sm:w-9/12 sm:rounded-xl 2xl:w-5/12"
      overlayClassName="inset-0 fixed backdrop-blur-3xl  flex items-center justify-center transform duration-400 ease-in"
      appElement={
        typeof window === 'undefined'
          ? undefined
          : document?.getElementById('root') || undefined
      }
    >
      <div className="relative -mb-12 flex justify-end">
        <FontAwesomeIcon
          icon={faClose}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
          onClick={onRequestClose}
        />
      </div>
      <div className="flex flex-col space-y-4 py-4">
        <div className="flex items-center gap-4">
          <Image
            alt={project.title}
            src={project.coverImage}
            width={96}
            height={96}
            objectFit="cover"
            className="rounded-xl"
          />
          <div className="flex flex-col">
            <h2 className="font-sans font-bold">{project.title}</h2>
            <h3 className="text-textgray font-sans">Pledge your support</h3>
          </div>
        </div>
      </div>
      <DonationForm
        projectNamePretty={project.title}
        projectSlug={project.slug}
      />
    </ReactModal>
  )
}

export default PaymentModal
