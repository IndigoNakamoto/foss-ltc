import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { ProjectItem } from '../utils/types'

const ShareButtons: React.FC<{ project: ProjectItem }> = ({ project }) => {
  const { gitRepository, twitterHandle, website } = project
  // Define a default URL (you can replace with your actual URL)
  const defaultGitUrl = 'https://github.com'

  // Use the default URL if 'git' is undefined
  const gitUrl = gitRepository || defaultGitUrl
  return (
    <div className="mb-4 flex space-x-4">
      <Link href={gitUrl} passHref>
        <FontAwesomeIcon
          icon={faGithub}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
        />
      </Link>
      <Link href={`https://twitter.com/${twitterHandle}`} passHref>
        <FontAwesomeIcon
          icon={faTwitter}
          className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
        />
      </Link>
      {website && (
        <Link href={website} passHref>
          <FontAwesomeIcon
            icon={faLink}
            className="hover:text-primary h-[2rem] w-[2rem] cursor-pointer"
          />
        </Link>
      )}
    </div>
  )
}

export default ShareButtons
