import React from 'react'
import { ArrowRight, ArrowUpSquare } from 'lucide-react'

const Analyze = () => {
  return (
    <section className="min-h-[80dvh] w-full flex justify-center items-center">
      <div className="min-w-[35%] flex flex-col justify-center items-start gap-10">
        <p className="text-xs text-secondary font-medium uppercase tracking-widest flex items-center gap-2">
          <span className="inline-block w-5 h-px bg-secondary" />
          Step 1
        </p>

        <div className="flex flex-col justify-start items-start -mt-6 gap-2">
          <p className="font-dm-serif-display text-4xl md:text-5xl text-primary leading-tight tracking-tight">Drop your resume.</p>

          <p className="text-lg text-secondary">PDF or DOCX. We&apos;ll do the rest.</p>
        </div>

        <div className="w-full flex flex-col justify-center items-center border-[1.5px] border-dashed border-secondary rounded-2xl p-16 cursor-pointer gap-1.5">
          <ArrowUpSquare strokeWidth={1} size={36} className='text-secondary' />

          <p className="text-center text-sm text-secondary font-light leading-relaxed tracking-wide mt-4">
            <span className="font-medium text-primary">Click to upload </span>
            or drag and drop
          </p>

          <p className="text-xs text-secondary">PDF · DOCX</p>
        </div>

        <div className="flex justify-start items-center gap-3">
          <button disabled={true} className="flex justify-center items-center bg-primary text-white h-10 w-10 rounded-full p-3 cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed">
            <ArrowRight className='text-white' />
          </button>

          <p className="text-xs text-secondary font-light">Looks good - continue</p>
        </div>
      </div>
    </section>
  )
}

export default Analyze