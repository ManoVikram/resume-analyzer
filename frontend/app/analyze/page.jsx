"use client"

import React, { useRef, useState } from 'react'
import { ArrowRight, ArrowUpSquare } from 'lucide-react'

const Analyze = () => {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const inputFileRef = useRef(null)

  const handleFileSelectClick = () => {
    inputFileRef.current.click()
  }

  const handleFileSelect = (event) => {
    event.preventDefault()

    const selectedFile = event.target.files[0]
    if (selectedFile && (selectedFile.name.endsWith(".pdf") || selectedFile.name.endsWith(".docx"))) {
      setFile(selectedFile)
    }
  }

  const handleFileDragOver = (event) => {
    event.preventDefault()

    setDragOver(true)
  }

  const handleFileDragLeave = (event) => {
    event.preventDefault()

    setDragOver(false)
  }

  const handleFileDrop = (event) => {
    event.preventDefault()

    setDragOver(false)

    const droppedFile = event.dataTransfer.files[0]

    if (droppedFile && (droppedFile.name.endsWith(".pdf") || droppedFile.name.endsWith(".docx"))) {
      setFile(droppedFile)
    }
  }

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

        <div className="w-full flex flex-col justify-center items-center border-[1.5px] border-dashed border-secondary rounded-2xl p-16 cursor-pointer gap-1.5" onClick={handleFileSelectClick} onDragOver={handleFileDragOver} onDragLeave={handleFileDragLeave} onDrop={handleFileDrop}>
          <input ref={inputFileRef} type="file" accept='.pdf, .docx' className="hidden" onChange={handleFileSelect} />

          <ArrowUpSquare strokeWidth={1} size={36} className='text-secondary' />

          <p className="text-center text-sm text-secondary font-light leading-relaxed tracking-wide mt-4">
            <span className="font-medium text-primary">Click to upload </span>
            or drag and drop
          </p>

          <p className="text-xs text-secondary">PDF · DOCX</p>
        </div>

        <div className="flex justify-start items-center gap-3">
          <button disabled={!file} className="flex justify-center items-center bg-primary text-white h-10 w-10 rounded-full p-3 cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 transition-transform duration-200">
            <ArrowRight className='text-white' />
          </button>

          {file && <p className="text-xs text-secondary font-light">Looks good - continue</p>}
        </div>
      </div>
    </section>
  )
}

export default Analyze