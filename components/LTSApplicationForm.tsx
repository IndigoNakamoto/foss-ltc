import { useRouter } from 'next/router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { fetchPostJSON } from '../utils/api-helpers'
import FormButton from '@/components/FormButton'
import React from 'react'

export default function ApplicationForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const isFLOSS = watch('free_open_source', false)
  const [failureReason, setFailureReason] = useState<string>()

  const onSubmit = async (data: any) => {
    setLoading(true)
    // console.log(data)

    try {
      // Track application in GitHub
      const res = await fetchPostJSON('/api/github', data)
      if (res.message === 'success') {
        router.push('/submitted')
        setLoading(false)
      } else {
        setFailureReason('Submission failed. Please try again.')
      }
    } catch (e) {
      // Handle errors from the fetch operation
      if (e instanceof Error) {
        setFailureReason(`Error: ${e.message}`)
      } else {
        setFailureReason('An unknown error occurred.')
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="apply flex max-w-2xl flex-col gap-4"
    >
      <input
        type="hidden"
        {...register('project_name', { value: 'Long-term Grant' })}
      />
      <input
        type="hidden"
        {...register('timelines', { value: 'Ongoing work.' })}
      />
      <input type="hidden" {...register('LTS', { value: true })} />

      <hr />
      <h1>LTS Application</h1>
      <h2>Who Are You?</h2>
      <label className="block">
        Your Name *<br />
        <small>Feel free to use your nym.</small>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          placeholder="Satoshi Nakamoto"
          {...register('your_name', { required: true })}
        />
      </label>
      <label className="block">
        Email *
        <input
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          placeholder="satoshi@gmx.com"
          {...register('email', { required: true })}
        />
      </label>
      <label className="block">
        Personal Website, GitHub profile, or other Social Media
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('personal_github')}
        />
      </label>
      <label className="block">
        Prior Contributions *<br />
        <small>
          Describe the contributions you've made to Litecoin Core or other
          Litecoin-related open-source projects.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('bios', { required: true })}
        />
      </label>

      <h2>What Will You Work On?</h2>

      <label className="block">
        Project Description *<br />
        <small>
          What do you intend to work on? Please be as specific as possible.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('short_description', { required: true })}
        />
      </label>

      <label className="block">
        Potential Impact *<br />
        <small>
          Why is your work important to Litecoin or the broader free and
          open-source community?
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('potential_impact', { required: true })}
        />
      </label>

      <label className="block">
        Budget Expectations *<br />
        <small>
          Submit a proposed budget around how much funding you are requesting
          and how it will be used.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('proposed_budget', { required: true })}
        />
      </label>

      <h2>Anything Else We Should Know?</h2>

      <label className="block">
        Feel free to share whatever else might be important.
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('anything_else')}
        />
      </label>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('has_received_funding')}
        />
        <span className="ml-2">
          I plan to receive or am receiving funding outside of Lite.Space.
        </span>
      </label>

      <label className="block">
        If you receive any other funding, please describe it here:
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('what_funding')}
        />
      </label>

      <h2>Final Questions</h2>

      <label className="block">
        In which area will your work have the most impact?
        <select
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('main_focus')}
        >
          <option value="litecoin">Litecoin</option>
          <option value="lightning">Lightning</option>
          <option value="mweb">MWEB</option>
          <option value="ordinals">Ordinals Lite</option>
          <option value="omnilite">Omni Lite</option>
          <option value="ldk">Litecoin Dev Kit</option>
          <option value="education">Education</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label className="block">
        Any References? *<br />
        <small>
          Please list any references from the Litecoin community or open-source
          space that we could contact for more information on you or your
          project.
        </small>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 text-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('references', { required: true })}
        />
      </label>

      <label className="inline-flex items-center">
        <input
          type="checkbox"
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          {...register('free_open_source', { required: true })}
        />
        <span className="ml-2">
          Will your contributions be free and open-source? *
        </span>
      </label>

      <div className="markdown">
        <small>
          Lite.Space may require each recipient to sign a Grant Agreement before
          any funds are disbursed. Using the reports and presentations required
          by the Grant Agreement, Lite.Space will monitor and evaluate the
          expenditure of funds on a quarterly basis. Any apparent misuse of
          grant funds will be promptly investigated. If Lite.Space discovers
          that the funds have been misused, the recipient will be required to
          return the funds immediately, and be barred from further
          distributions. Lite.Space will maintain the records required by
          Revenue Ruling 56-304, 1956-2 C.B. 306 regarding distribution of
          charitable funds to individuals.
        </small>
      </div>

      <FormButton
        variant={isFLOSS ? 'enabled' : 'disabled'}
        type="submit"
        disabled={loading}
      >
        Submit LTS Application
      </FormButton>

      {!!failureReason && (
        <p className="rounded bg-red-500 p-4 text-white">
          Something went wrong! {failureReason}
        </p>
      )}
    </form>
  )
}
