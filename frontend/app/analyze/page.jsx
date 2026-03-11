"use client"

import FileSelectorFileSelected from '@/components/FileSelectorFileSelected'
import FileSelectorNoFile from '@/components/FileSelectorNoFile'
import searchingAnimation from '@/public/SearchingLottie.json'
import Lottie from 'lottie-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'

const scoreColor = (score) => {
  if (score >= 80) return "text-green-600";
  if (score >= 65) return "text-yellow-600";
  if (score >= 50) return "text-orange-500";
  return "text-red-600";
};

const scoreHex = (score) => {
  if (score >= 80) return "#16a34a";
  if (score >= 65) return "#ca8a04";
  if (score >= 50) return "#ea580c";
  return "#dc2626";
};

const scoreLabel = (score) => {
  if (score >= 80) return "Strong shortlist potential";
  if (score >= 65) return "Competitive but risky";
  if (score >= 50) return "Likely rejected";
  return "Major alignment gaps";
};

const Analyze = () => {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult] = useState({
    "success": true,
    "overall_score": {
      "score": 0,
      "interpretation": ""
    },
    "score_breakdown": {
      "impact_metrics": 0,
      "jd_alignment": 0,
      "ownership_signals": 0,
      "remote_readiness": 0
    },
    "recruiter_risks": [],
    "strengths": [],
    "top_fixes": []
  })
  const [step, setStep] = useState("analysis")  // fileUpload | jobDescription | loading | analysis

  const inputFileRef = useRef(null)

  const scoreBreakdown = [
    {
      label: "Impact & Metrics",
      value: result.score_breakdown.impact_metrics,
      weight: "30%"
    },
    {
      label: "JD Alignment",
      value: result.score_breakdown.jd_alignment,
      weight: "30%"
    },
    {
      label: "Ownership",
      value: result.score_breakdown.ownership_signals,
      weight: "20%"
    },
    {
      label: "Remote Ready",
      value: result.score_breakdown.remote_readiness,
      weight: "20%"
    }
  ]

  const handleFileSelectClick = () => {
    inputFileRef.current.click()
  }

  const handleFileSelect = (event) => {
    event.preventDefault()

    const selectedFile = event.target.files[0]
    if (selectedFile && (selectedFile.name.toLowerCase().endsWith(".pdf") || selectedFile.name.toLowerCase().endsWith(".docx"))) {
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

    if (droppedFile && (droppedFile.name.toLowerCase().endsWith(".pdf") || droppedFile.name.toLowerCase().endsWith(".docx"))) {
      setFile(droppedFile)
    }
  }

  const circumference = 2 * Math.PI * 46;

  return (
    <section className="min-h-dvh w-full flex justify-center items-center">
      {/* File upload */}
      {step === "fileUpload" && (
        <div className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] min-h-[80%] flex flex-col justify-center items-start gap-10">
          <p className="text-xs text-secondary font-medium uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-secondary" />
            Step 1
          </p>

          <div className="flex flex-col justify-start items-start -mt-6 gap-2">
            <h2 className="font-dm-serif-display text-4xl md:text-5xl text-primary leading-tight tracking-tight">Drop your resume.</h2>

            <p className="text-lg text-secondary">PDF or DOCX. We&apos;ll do the rest.</p>
          </div>

          <div className={`w-full flex flex-col justify-center items-center border-[1.5px] border-dashed border-secondary hover:bg-black/2.5 ${dragOver ? "bg-black/2.5" : ""} rounded-2xl p-16 cursor-pointer transition-colors duration-200 gap-1.5`} onClick={handleFileSelectClick} onDragOver={handleFileDragOver} onDragLeave={handleFileDragLeave} onDrop={handleFileDrop}>
            <input ref={inputFileRef} type="file" accept='.pdf, .docx' className="hidden" onChange={handleFileSelect} />

            {!file && <FileSelectorNoFile />}

            {file && <FileSelectorFileSelected filename={file.name} />}
          </div>

          <div className="flex justify-start items-center gap-3">
            <button disabled={!file} className="flex justify-center items-center bg-primary text-white h-10 w-10 rounded-full p-3 cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 transition-transform duration-200">
              <ArrowRight className='text-white' />
            </button>

            {file && <p className="text-xs text-secondary font-light">Looks good - continue</p>}
          </div>
        </div>
      )}

      {/* Job description */}
      {step === "jobDescription" && (
        <div className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] flex flex-col justify-center items-start gap-10">
          <p className="text-xs text-secondary font-medium uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-secondary" />
            Step 2
          </p>

          <div className="flex flex-col justify-start items-start -mt-6 gap-2">
            <h2 className="font-dm-serif-display text-4xl md:text-5xl text-primary leading-tight tracking-tight">Paste the job description.</h2>

            <p className="text-lg text-secondary">Copy the full JD - the more detail, the sharper the analysis.</p>
          </div>

          <textarea placeholder='Paste the description here...' className='w-full bg-white min-h-48 md:min-h-64 resize-none rounded-2xl p-4 md:p-6 text-sm border border-gray-300 focus:border-secondary outline-none transition-colors duration-200 hide-scrollbar-track overflow-y-auto' />

          <div className="flex justify-start items-center gap-4">
            <button disabled={false} className="flex justify-center items-center bg-primary text-white rounded-full px-8 py-4 gap-2 cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 transition-transform duration-200">
              <p className="text-sm font-semibold">Analyze</p>

              <ArrowRight className='h-4 w-4 text-white' />
            </button>

            <button disabled={false} className="group flex justify-center items-center gap-1 cursor-pointer hover:scale-105 transition-transform duration-100">
              <ArrowLeft className='h-4 w-4 text-secondary group-hover:text-primary' />

              <p className="text-sm text-secondary group-hover:text-primary">Back</p>
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {step === "loading" && (
        <div className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] flex flex-col justify-center items-center gap-10">
          <Lottie animationData={searchingAnimation} className='w-fit' loop autoplay />

          <div className="flex flex-col justify-start items-start -mt-6 gap-2">
            <h4 className="font-dm-serif-display text-3xl md:text-4xl text-primary leading-tight tracking-tight">Analyzing your resume</h4>

            <p className="text-sm md:text-base text-secondary">Cross-referencing with the job description</p>
          </div>

          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse ease-in-out" style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1.5s" }} />
            ))}
          </div>
        </div>
      )}

      {/* Analysis */}
      {step === "analysis" && result && (
        <div className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] flex flex-col justify-center items-start gap-6">
          <p className="text-xs text-secondary font-medium uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-secondary" />
            Analysis complete
          </p>

          <h2 className="font-dm-serif-display text-4xl md:text-5xl text-primary leading-tight tracking-tight">Here&apos;s your scorecard.</h2>

          <div className="w-full flex flex-col items-center gap-6 mb-10 sm:flex-row sm:items-start sm:gap-10 sm:mb-12">
            {/* Ring */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-28 h-3w-28 md:w-36 md:h-36">
                <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
                  <circle cx="55" cy="55" r="46" fill="none" stroke="#ede9e0" strokeWidth="8" />

                  <circle cx="55" cy="55" r="46" fill="none" stroke={scoreHex(result.overall_score.score)} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - result.overall_score.score / 100)} className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <strong className={`text-2xl sm:text-3xl leading-none font-dm-serif-display ${scoreColor(result.overall_score.score)}`}>
                    {result.overall_score.score}
                  </strong>

                  <span className="text-xs text-secondary font-light">/ 100</span>
                </div>
              </div>

              <p className={`text-xs font-medium text-center max-w-24 sm:max-w-28 leading-snug ${scoreColor(result.overall_score.score)}`}>
                {scoreLabel(result.overall_score.score)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {scoreBreakdown.map((item) => (
                <div key={item.label} className="bg-white border border-secondary/20 rounded-xl p-3">
                  <p className="text-xs font-medium tracking-wide uppercase text-secondary mb-2">
                    {item.label}
                  </p>

                  <div className="h-1 bg-background rounded-full overflow-hidden mb-1.5">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, background: scoreHex(item.value) }} />
                  </div>

                  <span className="text-base sm:text-lg font-dm-serif-display" style={{ color: scoreHex(item.value) }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Analyze