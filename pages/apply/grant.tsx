import GrantApplicationForm from '@/components/GrantApplicationForm'
import ApplySection from '@/components/ApplySection'
import Link from '@/components/Link'
import CustomLink from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import React from 'react'

export default function Apply() {
  return (
    <>
      <PageSEO
        title="Lite.Space | General Grant"
        description="Litecoin Foundation Grants: Apply for Funding & Support Open-Source Projects. Learn criteria, grant types, and get listed on Lite.Space. Enhance the Litecoin ecosystem globally."
      />
      <ApplySection title="Apply for a Grant">
        <div className="my-8 mt-10 xs:my-4">
          <p>
            The information collected below will be used to vet your grant
            application. Please provide accurate contact information as we may
            reach out during our review and due diligence process.
          </p>
          <p>
            If your grant application is approved, we will reach out with any
            additional information necessary to ensure a fruitful partnership
            and smooth grant payouts. This may include tax related information
            depending on your location, Litecoin addresses or similar payment
            information that is required to receive donation payouts from
            Lite.Space.
          </p>
          <p>
            Make sure to read the{' '}
            <CustomLink href="/grant-policy">Grant Policy</CustomLink> before
            sending in an application. If you want your project to be listed on
            the website, please{' '}
            <Link href="/apply/to-be-listed">apply to be listed</Link> instead.
          </p>
          <GrantApplicationForm />
        </div>
      </ApplySection>
    </>
  )
}
