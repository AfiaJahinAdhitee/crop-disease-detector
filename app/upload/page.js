'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Upload, Leaf, AlertCircle, CheckCircle, AlertTriangle, Loader2, X, Mic, Square, ArrowLeft } from 'lucide-react'

const CROP_TYPES = [
  'Tomato', 'Potato', 'Corn', 'Rice', 'Wheat',
  'Apple', 'Grape', 'Pepper', 'Strawberry', 'Other'
]

const SEVERITY_COLORS = {
  none: 'bg-green-100 text-green-800 border-green-200',
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300',
}

const PART_META = {
  leaf: {
    label: 'পাতা',
    labelEn: 'Leaf',
    color: '#22c55e',
    uploadHint: 'পাতার স্পষ্ট ছবি তুলুন',
    uploadHintEn: 'Upload a clear photo of the affected leaf',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <path d="M16 4C16 4 6 10 6 19C6 24.5 10.5 29 16 29C21.5 29 26 24.5 26 19C26 10 16 4 16 4Z" fill="#22c55e" opacity="0.8"/>
        <path d="M16 7C16 7 9 12 9 19C9 22 11.5 24.5 14 25.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
  root: {
    label: 'শিকড়',
    labelEn: 'Root',
    color: '#a78bfa',
    uploadHint: 'শিকড়ের স্পষ্ট ছবি তুলুন (মাটি সরিয়ে)',
    uploadHintEn: 'Upload a clear photo of the root (remove soil if possible)',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <rect x="13" y="3" width="6" height="8" rx="2" fill="#a78bfa" opacity="0.8" stroke="#a78bfa" strokeWidth="1"/>
        <line x1="16" y1="11" x2="16" y2="18" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 18 Q11 22 8 28" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 18 Q21 22 24 28" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  fruit: {
    label: 'ফল',
    labelEn: 'Fruit',
    color: '#f97316',
    uploadHint: 'ফলের স্পষ্ট ছবি তুলুন (দাগসহ)',
    uploadHintEn: 'Upload a clear photo of the affected fruit',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <path d="M16 5 Q15 3 13 3.5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="18" r="11" fill="#f97316" opacity="0.8" stroke="#f97316" strokeWidth="1"/>
        <path d="M10 14 Q16 11 22 14" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <path d="M9 19 Q16 16 23 19" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      </svg>
    ),
  },
  flower: {
    label: 'ফুল',
    labelEn: 'Flower',
    color: '#ec4899',
    uploadHint: 'ফুলের স্পষ্ট ছবি তুলুন',
    uploadHintEn: 'Upload a clear photo of the affected flower',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <ellipse cx="16" cy="8" rx="4" ry="6" fill="#ec4899" opacity="0.7"/>
        <ellipse cx="24" cy="16" rx="4" ry="6" fill="#ec4899" opacity="0.7" transform="rotate(90 24 16)"/>
        <ellipse cx="16" cy="24" rx="4" ry="6" fill="#ec4899" opacity="0.7"/>
        <ellipse cx="8" cy="16" rx="4" ry="6" fill="#ec4899" opacity="0.7" transform="rotate(90 8 16)"/>
        <circle cx="16" cy="16" r="4.5" fill="#fbbf24"/>
      </svg>
    ),
  },
  body: {
    label: 'কান্ড/শাখা',
    labelEn: 'Stem / Branch',
    color: '#92400e',
    uploadHint: 'কান্ড বা শাখার স্পষ্ট ছবি তুলুন',
    uploadHintEn: 'Upload a clear photo of the stem or branch',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <rect x="13" y="2" width="6" height="28" rx="3" fill="#92400e" opacity="0.8" stroke="#92400e" strokeWidth="1"/>
        <path d="M16 9 Q23 7 26 4" stroke="#a16207" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 16 Q9 14 6 10" stroke="#a16207" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16 22 Q23 20 27 16" stroke="#a16207" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
}

function UploadPageInner() {
  const searchParams = useSearchParams()
  const plantPart = searchParams.get('part') || 'leaf'
  const meta = PART_META[plantPart] || PART_META.leaf

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [cropType, setCropType] = useState('')
  const [region, setRegion] = useState('')
  const [userDescription, setUserDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [secondOpinion, setSecondOpinion] = useState(null)
  const [error, setError] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in your browser. Please try Google Chrome or Microsoft Edge.')
      return
    }
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'bn-BD'
    recognition.onstart = () => setIsListening(true)
    recognition.onerror = (event) => {
      setError(`Voice recognition issue: ${event.error}`)
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setUserDescription((prev) => (prev ? `${prev} ${transcript}` : transcript))
    }
    recognition.start()
  }

  function stopSpeechRecognition() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  function toggleListening() {
    if (isListening) stopSpeechRecognition()
    else startSpeechRecognition()
  }

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setSecondOpinion(null)
    setError(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setSecondOpinion(null)
    setError(null)
  }

  function clearImage() {
    setImage(null)
    setPreview(null)
    setCropType('')
    setRegion('')
    setUserDescription('')
    setResult(null)
    setSecondOpinion(null)
    setError(null)
    stopSpeechRecognition()
  }

  async function handleSubmit() {
    if (!image || !cropType) {
      setError('Please select an image and crop type.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('image', image)
      formData.append('cropType', cropType)
      formData.append('region', region)
      formData.append('userDescription', userDescription)
      formData.append('plantPart', plantPart)

      const res = await fetch('/api/diagnose', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Diagnosis failed')
      setResult(data.diagnosis)
      setSecondOpinion(data.secondOpinion || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mr-2">
          <ArrowLeft size={18} />
        </a>
        <div style={{ color: meta.color }}>{meta.icon}</div>
        <h1 className="text-lg font-semibold">
          {meta.label} রোগ নির্ণয়
          <span className="text-gray-500 text-sm font-normal ml-2">({meta.labelEn} Diagnosis)</span>
        </h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{meta.label} পরীক্ষা করুন</h2>
          <p className="text-gray-400 mt-1 text-sm">
            {meta.uploadHint} — {meta.uploadHintEn}
          </p>
        </div>

        {/* Image Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative border-2 border-dashed border-gray-700 rounded-2xl overflow-hidden hover:transition-colors cursor-pointer bg-gray-900"
          style={{ '--part-color': meta.color }}
          onMouseEnter={e => e.currentTarget.style.borderColor = meta.color + '80'}
          onMouseLeave={e => e.currentTarget.style.borderColor = ''}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full max-h-80 object-contain p-4" />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-700 rounded-full p-1.5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 py-16 cursor-pointer">
              <div className="bg-gray-800 rounded-full p-4">
                <Upload size={28} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-300">{meta.uploadHint}</p>
                <p className="text-sm text-gray-500 mt-1">অথবা ক্লিক করুন — JPG, PNG সর্বোচ্চ 10MB</p>
                <p className="text-xs text-gray-600 mt-0.5">{meta.uploadHintEn} — click to browse</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Crop Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">ফসলের ধরন / Crop Type *</label>
          <div className="flex flex-wrap gap-2">
            {CROP_TYPES.map((crop) => (
              <button
                key={crop}
                onClick={() => setCropType(crop)}
                className="px-4 py-1.5 rounded-full text-sm border transition-colors"
                style={cropType === crop
                  ? { backgroundColor: meta.color, borderColor: meta.color, color: 'white' }
                  : { borderColor: '#374151', color: '#9ca3af' }
                }
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">এলাকা / Region</label>
          <input
            type="text"
            placeholder="যেমন: ঢাকা, রাজশাহী, চট্টগ্রাম... / e.g. Dhaka, Rajshahi"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
            onFocus={e => e.target.style.borderColor = meta.color}
            onBlur={e => e.target.style.borderColor = ''}
          />
        </div>

        {/* Description + Voice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">বিবরণ / Description (ঐচ্ছিক / Optional)</label>
            {isListening && (
              <span className="text-xs text-red-400 flex items-center gap-1.5 animate-pulse font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                শুনছি... / Listening...
              </span>
            )}
          </div>
          <div className="relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden focus-within:border-green-500 transition-colors">
            <textarea
              rows={3}
              placeholder={`${meta.label} সম্পর্কে লক্ষণ বলুন বা টাইপ করুন — মাইক্রোফোন বাটন চেপে কথা বলুন...`}
              value={userDescription}
              onChange={(e) => setUserDescription(e.target.value)}
              className="w-full bg-transparent border-none rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none resize-none"
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all flex items-center justify-center
                ${isListening
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/40'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              title={isListening ? "Stop listening" : "Start voice typing"}
            >
              {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || !image || !cropType}
          className="w-full text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:bg-gray-700 disabled:text-gray-500"
          style={!loading && image && cropType ? { backgroundColor: meta.color } : {}}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {meta.label} বিশ্লেষণ করা হচ্ছে...
            </>
          ) : (
            <>
              <div style={{ color: 'white' }}>{meta.icon}</div>
              রোগ নির্ণয় করুন / Diagnose Now
            </>
          )}
        </button>

        {/* Results */}
        {result && <DiagnosisCard result={result} accentColor={meta.color} label={meta.label} isSecond={false} />}
        {secondOpinion && <DiagnosisCard result={secondOpinion} accentColor="#60a5fa" label={meta.label} isSecond={true} />}
      </div>
    </div>
  )
}

function DiagnosisCard({ result, accentColor, label, isSecond }) {
  return (
    <div className={`border rounded-2xl overflow-hidden bg-gray-900 ${isSecond ? 'border-yellow-800/50' : 'border-gray-800'}`}>
      {isSecond && (
        <div className="px-5 py-3 bg-yellow-900/20 border-b border-yellow-800/50 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <p className="text-sm font-semibold text-yellow-400">Gemini AI এর ভিন্নমত / Different opinion</p>
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {result.disease_detected
            ? <AlertTriangle size={18} className="text-yellow-400" />
            : <CheckCircle size={18} className="text-green-400" />
          }
          <span className="font-semibold">{result.disease_name}</span>
        </div>
        {result.severity !== 'none' && (
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.low}`}>
            {result.severity} severity
          </span>
        )}
      </div>

      <div className="px-5 py-4 border-b border-gray-800">
        <p className="text-xs text-gray-500 mb-2">আস্থার মাত্রা / Confidence</p>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${Math.round(result.confidence_score * 100)}%`, backgroundColor: accentColor }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{Math.round(result.confidence_score * 100)}%</p>
      </div>

      {result.description && (
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-1">রোগ সম্পর্কে / About this diagnosis</p>
          <p className="text-sm text-gray-300">{result.description}</p>
        </div>
      )}

      {result.symptoms && (
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-1">যা দেখা যাচ্ছে / What we see</p>
          <p className="text-sm text-gray-300">{result.symptoms}</p>
        </div>
      )}

      {result.disease_detected && result.treatment && (
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-1">চিকিৎসা / Treatment</p>
          <p className="text-sm text-gray-300">{result.treatment}</p>
        </div>
      )}

      {result.disease_detected && result.remedies?.length > 0 && (
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-2">ধাপে ধাপে সমাধান / Step-by-step remedies</p>
          <ol className="space-y-1.5 list-none">
            {result.remedies.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {result.prevention && (
        <div className="px-5 py-4 border-b border-gray-800">
          <p className="text-xs text-gray-500 mb-1">প্রতিরোধ / Prevention</p>
          <p className="text-sm text-gray-300">{result.prevention}</p>
        </div>
      )}

      <div className="px-5 py-3 flex items-center gap-2">
        {result.source === 'custom_model' ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            <p className="text-xs text-gray-500">বিশ্লেষণ করা হয়েছে কাস্টম ট্রেইনড মডেল দ্বারা</p>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
            <p className="text-xs text-gray-500">বিশ্লেষণ করা হয়েছে Gemini AI দ্বারা</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" size={20} /> লোড হচ্ছে...
      </div>
    }>
      <UploadPageInner />
    </Suspense>
  )
}