import Link from './Link'
import Image from './Image'
import CreditItem, { CreditItemProps } from './CreditItem'

const Volunteers = () => {
  const anthony = '/img/advisors/anthony.jpeg'
  const losh = '/img/advisors/losh.jpeg'

  const volunteers: CreditItemProps[] = [
    {
      link: 'https://twitter.com/loshan1212',
      image: losh,
      nym: 'Loshan',
    },
    {
      link: 'https://twitter.com/anthonyonchain',
      image: anthony,
      nym: 'Anthony Gurrera',
    },
  ]

  return (
    <div className="grid items-start space-y-2 xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
      <div className="col-start-0 col-span-3 grid grid-cols-3 space-y-2 sm:gap-x-2 md:grid-cols-5 md:gap-x-8">
        {volunteers.map((v, i) => (
          <div className="items-left flex flex-col space-x-2" key={i}>
            <Link
              href={v.link}
              className=" transition-transform duration-200 ease-in-out hover:scale-105"
            >
              <Image
                src={v.image}
                alt={v.nym}
                title={v.nym}
                width={120}
                height={120}
                className="h-36 w-36 rounded-full"
              />
            </Link>
          </div>
        ))}
      </div>
      <div></div>
    </div>
  )
}

export default Volunteers
