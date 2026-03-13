"use client"

import FileSelectorFileSelected from '@/components/FileSelectorFileSelected'
import FileSelectorNoFile from '@/components/FileSelectorNoFile'
import { analyzeResume } from '@/lib/api/helpers'
import searchingAnimation from '@/public/SearchingLottie.json'
import gsap from 'gsap'
import Lottie from 'lottie-react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

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

// Animate current step out (slide up + fade), then call onComplete to switch state
const animateOut = (ref, onComplete) => {
  if (!ref.current) {
    onComplete()
    return
  }

  gsap.to(ref.current, {
    y: -48,
    opacity: 0,
    duration: 0.35,
    ease: "power2.in",
    onComplete,
  })
}

// Animate new step in (slide up from below + fade in)
const animateIn = (ref) => {
  if (!ref.current) return

  gsap.fromTo(ref.current,
    {
      y: 56,
      opacity: 0
    },
    {
      y: 0,
      opacity: 1,
      duration: 0.45,
      ease: "power3.out"
    }
  )
}

const EMPTY_RESULT = {
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
}

const Analyze = () => {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [jobDescriptionText, setJobDescriptionText] = useState("")
  const [result, setResult] = useState(EMPTY_RESULT)
  const [step, setStep] = useState("fileUpload")  // fileUpload | jobDescription | loading | analysis

  const stepRef = useRef(null)
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

  const goToStep = useCallback((nextStep) => {
    animateOut(stepRef, () => {
      setStep(nextStep)
      // Wait a tick for React to render the new step, then animate in
      requestAnimationFrame(() => animateIn(stepRef))
    })
  }, [])

  const handleFileSelectClick = () => inputFileRef.current.click()

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

  const reset = () => {
    animateOut(stepRef, () => {
      setStep("fileUpload")
      setFile(null)
      setJobDescriptionText("")
      setResult(EMPTY_RESULT)
      requestAnimationFrame(() => animateIn(stepRef))
    })
  }

  const startAnalysis = async () => {
    if (!file || !jobDescriptionText) return

    animateOut(stepRef, async () => {
      setStep("loading")
      requestAnimationFrame(() => animateIn(stepRef))

      try {
        const analysisResult = await analyzeResume(file, jobDescriptionText)
        setResult(analysisResult)
        animateOut(stepRef, () => {
          setStep("analysis")
          requestAnimationFrame(() => animateIn(stepRef))
        })
      } catch (error) {
        toast.error("Analysis failed. Please try again.")
        animateOut(stepRef, () => {
          setStep("jobDescription")
          requestAnimationFrame(() => animateIn(stepRef))
        })
      }
    })
  }

  const circumference = 2 * Math.PI * 46;

  return (
    <section className="min-h-dvh w-full flex justify-center items-center py-24 overflow-hidden">
      {/* File upload */}
      {step === "fileUpload" && (
        <div ref={stepRef} className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] min-h-[80%] flex flex-col justify-center items-start gap-10">
          <p className="text-xs text-secondary font-medium uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-secondary" />
            Step 1
          </p>

          <div className="flex flex-col justify-start items-start -mt-6 gap-2">
            <h2 className="font-dm-serif-display text-4xl md:text-5xl text-primary leading-tight tracking-tight">Drop your resume.</h2>

            <p className="text-lg text-secondary">PDF or DOCX. We&apos;ll do the rest.</p>
          </div>

          <div className={`w-full flex flex-col justify-center items-center border-[1.5px] border-dashed border-secondary hover:bg-black/2.5 ${dragOver ? "bg-black/2.5" : ""} rounded-2xl p-8 md:p-16 cursor-pointer transition-colors duration-200 gap-1.5`} onClick={handleFileSelectClick} onDragOver={handleFileDragOver} onDragLeave={handleFileDragLeave} onDrop={handleFileDrop}>
            <input ref={inputFileRef} type="file" accept='.pdf, .docx' className="hidden" onChange={handleFileSelect} />

            {!file && <FileSelectorNoFile />}

            {file && <FileSelectorFileSelected filename={file.name} />}
          </div>

          <div className="flex justify-start items-center gap-3">
            <button disabled={!file} className="flex justify-center items-center bg-primary text-white h-10 w-10 rounded-full p-3 cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 transition-transform duration-200" onClick={() => goToStep("jobDescription")}>
              <ArrowRight className='text-white' />
            </button>

            {file && <p className="text-xs text-secondary font-light">Looks good - continue</p>}
          </div>
        </div>
      )}

      {/* Job description */}
      {step === "jobDescription" && (
        <div ref={stepRef} className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] flex flex-col justify-center items-start gap-10">
          <p className="text-xs text-secondary font-medium uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-secondary" />
            Step 2
          </p>

          <div className="flex flex-col justify-start items-start -mt-6 gap-2">
            <h2 className="font-dm-serif-display text-4xl md:text-5xl text-primary leading-tight tracking-tight">Paste the job description.</h2>

            <p className="text-lg text-secondary">Copy the full JD - the more detail, the sharper the analysis.</p>
          </div>

          <textarea placeholder='Paste the description here...' className='w-full bg-white min-h-40 md:min-h-64 resize-none rounded-2xl p-4 md:p-6 text-sm border border-gray-300 focus:border-secondary outline-none transition-colors duration-200 hide-scrollbar-track overflow-y-auto' onChange={(event) => setJobDescriptionText(event.target.value)} />

          <div className="flex justify-start items-center gap-4">
            <button disabled={false} className="flex justify-center items-center bg-primary text-white rounded-full px-8 py-4 gap-2 cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 transition-transform duration-200" onClick={startAnalysis}>
              <p className="text-sm font-semibold">Analyze</p>

              <ArrowRight className='h-4 w-4 text-white' />
            </button>

            <button disabled={false} className="group flex justify-center items-center gap-1 cursor-pointer hover:scale-105 transition-transform duration-100" onClick={() => goToStep("fileUpload")}>
              <ArrowLeft className='h-4 w-4 text-secondary group-hover:text-primary' />

              <p className="text-sm text-secondary group-hover:text-primary">Back</p>
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {step === "loading" && (
        <div ref={stepRef} className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] flex flex-col justify-center items-center gap-10">
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
        <div ref={stepRef} className="w-full max-w-[80%] md:max-w-[70%] lg:max-w-[60%] xl:max-w-[50%] flex flex-col justify-center items-start gap-4">
          <p className="text-xs text-secondary font-medium uppercase tracking-widest flex items-center gap-2">
            <span className="inline-block w-5 h-px bg-secondary" />
            Analysis complete
          </p>

          <h2 className="font-dm-serif-display text-4xl md:text-5xl text-primary leading-tight tracking-tight">Here&apos;s your scorecard.</h2>

          <div className="flex flex-col justify-start items-start mt-4 gap-12">
            {/* Score breakdown */}
            <div className="w-full flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
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

            {/* Recruiter risks */}
            <div className="w-full flex flex-col gap-6">
              <div className="flex justify-start items-center gap-3">
                <p className="text-xs font-medium tracking-widest uppercase text-secondary">7-second recruiter scan</p>

                <span className="inline-block flex-1 h-px bg-secondary" />
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                {result.recruiter_risks.map((risk, index) => (
                  <div key={index} className="flex justify-start items-start text-sm font-light text-primary leading-relaxed gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    {risk}
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="w-full flex flex-col gap-6">
              <div className="flex justify-start items-center gap-3">
                <p className="text-xs font-medium tracking-widest uppercase text-secondary">What&apos;s working</p>

                <span className="inline-block flex-1 h-px bg-secondary" />
              </div>

              <div className="flex flex-col justify-start items-start gap-2">
                {result.strengths.map((strength, index) => (
                  <div key={index} className="flex justify-start items-start text-sm font-light text-primary leading-relaxed gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    {strength}
                  </div>
                ))}
              </div>
            </div>

            {/* Top fixes */}
            <div className="w-full flex flex-col gap-6">
              <div className="flex justify-start items-center gap-3">
                <p className="text-xs font-medium tracking-widest uppercase text-secondary">Top fixes - ranked</p>

                <span className="inline-block flex-1 h-px bg-secondary" />
              </div>

              <div className="flex flex-col gap-4 md:gap-5">
                {result.top_fixes.map((fix, index) => (
                  <div key={index} className="flex flex-col justify-start items-start bg-white rounded-2xl p-6 gap-2">
                    <p className="text-xs text-secondary font-light tracking-widest uppercase">Fix {index + 1}</p>

                    <p className="text-sm font-medium leading-snug mt-1">🔥 {fix.problem}</p>

                    <p className="text-sm text-secondary font-light leading-relaxed">🎯 {fix.why_it_matters}</p>

                    <div className="flex flex-col justify-start items-start bg-background border-l-3 border-primary px-3 py-2 mt-2 rounded-xl gap-2">
                      <p className="text-xs text-secondary font-medium tracking-widest uppercase mb-1">✏️ Improvement</p>

                      <p className="text-sm leading-relaxed">{fix.improvement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className="flex justify-center items-center bg-transparent border border-secondary text-secondary rounded-full px-6 py-3 mt-6 gap-2 cursor-pointer disabled:bg-secondary disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-105 transition-transform duration-200" onClick={reset}>
            <ArrowLeft className='h-4 w-4' />

            <p className="text-sm">Analyse another resume</p>
          </button>
        </div>
      )}
    </section>
  )
}

export default Analyze