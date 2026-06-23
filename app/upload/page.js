'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Upload, Leaf, AlertCircle, CheckCircle, AlertTriangle, Loader2, X, Mic, Square, ArrowLeft } from 'lucide-react'

const CROP_TYPES = [
  'Tomato', 'Potato', 'Corn', 'Rice', 'Wheat',
  'Apple', 'Grape', 'Pepper', 'Strawberry', 'Other'
]

const BANGLADESH_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola',
  'Bogura', 'Brahmanbaria', 'Chandpur', 'Chapai Nawabganj', 'Chattogram',
  'Chuadanga', "Cox's Bazar", 'Cumilla', 'Dhaka', 'Dinajpur',
  'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj',
  'Habiganj', 'Jamalpur', 'Jessore', 'Jhalokati', 'Jhenaidah',
  'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj', 'Kurigram',
  'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura',
  'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh',
  'Naogaon', 'Narail', 'Narayanganj', 'Narsingdi', 'Natore',
  'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh',
  'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati',
  'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj',
  'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'
]

const BANGLA_HINTS = {
  'রাজশাহী': 'Rajshahi', 'রাজবাড়ী': 'Rajbari', 'ঢাকা': 'Dhaka',
  'চট্টগ্রাম': 'Chattogram', 'খুলনা': 'Khulna', 'সিলেট': 'Sylhet',
  'রংপুর': 'Rangpur', 'ময়মনসিংহ': 'Mymensingh', 'বরিশাল': 'Barishal',
  'কুমিল্লা': 'Cumilla', 'নারায়ণগঞ্জ': 'Narayanganj', 'গাজীপুর': 'Gazipur',
  'বগুড়া': 'Bogura', 'দিনাজপুর': 'Dinajpur', 'পাবনা': 'Pabna',
  'টাঙ্গাইল': 'Tangail', 'যশোর': 'Jessore', 'ফরিদপুর': 'Faridpur',
  'নোয়াখালী': 'Noakhali', 'কিশোরগঞ্জ': 'Kishoreganj',
  'ব্রাহ্মণবাড়িয়া': 'Brahmanbaria', 'জামালপুর': 'Jamalpur',
  'নেত্রকোণা': 'Netrokona', 'শেরপুর': 'Sherpur', 'মানিকগঞ্জ': 'Manikganj',
  'মুন্সিগঞ্জ': 'Munshiganj', 'নরসিংদী': 'Narsingdi', 'গোপালগঞ্জ': 'Gopalganj',
  'মাদারীপুর': 'Madaripur', 'শরীয়তপুর': 'Shariatpur', 'ঝালকাঠি': 'Jhalokati',
  'পটুয়াখালী': 'Patuakhali', 'ভোলা': 'Bhola', 'পিরোজপুর': 'Pirojpur',
  'বরগুনা': 'Barguna', 'বাগেরহাট': 'Bagerhat', 'সাতক্ষীরা': 'Satkhira',
  'নড়াইল': 'Narail', 'মাগুরা': 'Magura', 'ঝিনাইদহ': 'Jhenaidah',
  'মেহেরপুর': 'Meherpur', 'চুয়াডাঙ্গা': 'Chuadanga', 'কুষ্টিয়া': 'Kushtia',
  'নাটোর': 'Natore', 'সিরাজগঞ্জ': 'Sirajganj', 'নওগাঁ': 'Naogaon',
  'চাঁপাইনবাবগঞ্জ': 'Chapai Nawabganj', 'জয়পুরহাট': 'Joypurhat',
  'গাইবান্ধা': 'Gaibandha', 'কুড়িগ্রাম': 'Kurigram', 'লালমনিরহাট': 'Lalmonirhat',
  'নীলফামারী': 'Nilphamari', 'পঞ্চগড়': 'Panchagarh', 'ঠাকুরগাঁও': 'Thakurgaon',
  'সুনামগঞ্জ': 'Sunamganj', 'মৌলভীবাজার': 'Moulvibazar', 'হবিগঞ্জ': 'Habiganj',
  'খাগড়াছড়ি': 'Khagrachhari', 'রাঙামাটি': 'Rangamati', 'বান্দরবান': 'Bandarban',
  'কক্সবাজার': "Cox's Bazar", 'ফেনী': 'Feni', 'লক্ষ্মীপুর': 'Lakshmipur',
  'চাঁদপুর': 'Chandpur',
}

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

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[a.length][b.length]
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
  const [weather, setWeather] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [regionSuggestions, setRegionSuggestions] = useState([])
  const recognitionRef = useRef(null)
  const regionRecognitionRef = useRef(null)
  const [isRegionListening, setIsRegionListening] = useState(false)
  const regionBorderRef = useRef(null)

  useEffect(() => {
    const input = region.trim()
    if (!input) { setRegionSuggestions([]); return }

    // Detect if input contains Bangla characters
    const isBangla = /[\u0980-\u09FF]/.test(input)

    let searchTerms = []

    if (isBangla) {
      // 1. Exact key matches in BANGLA_HINTS (substring, all matches)
      const exactMatches = Object.entries(BANGLA_HINTS)
        .filter(([bangla]) => bangla.includes(input))
        .map(([, english]) => english.toLowerCase())

      // 2. Phonetic transliteration: Bangla chars → rough Roman equivalent
      const BANGLA_ROMAN = {
        'অ':'a','আ':'a','ই':'i','ঈ':'i','উ':'u','ঊ':'u','এ':'e','ঐ':'oi','ও':'o','ঔ':'ou',
        'ক':'k','খ':'kh','গ':'g','ঘ':'gh','ঙ':'ng',
        'চ':'ch','ছ':'chh','জ':'j','ঝ':'jh','ঞ':'n',
        'ট':'t','ঠ':'th','ড':'d','ঢ':'dh','ণ':'n',
        'ত':'t','থ':'th','দ':'d','ধ':'dh','ন':'n',
        'প':'p','ফ':'f','ব':'b','ভ':'bh','ম':'m',
        'য':'j','র':'r','ল':'l','শ':'sh','ষ':'sh','স':'s','হ':'h',
        'ড়':'r','ঢ়':'rh','য়':'y','ৎ':'t','ং':'ng','ঃ':'h','ঁ':'n',
        // vowel signs
        'া':'a','ি':'i','ী':'i','ু':'u','ূ':'u','ে':'e','ৈ':'oi','ো':'o','ৌ':'ou',
        '্':'', // hasanta (virama) - remove
      }
      const transliterate = (str) =>
        str.split('').map(ch => BANGLA_ROMAN[ch] ?? '').join('')

      const phonetic = transliterate(input).toLowerCase().replace(/\s+/g, '')

      searchTerms = exactMatches.length > 0 ? exactMatches : (phonetic ? [phonetic] : [])
    } else {
      searchTerms = [input.toLowerCase()]
    }

    if (searchTerms.length === 0) { setRegionSuggestions([]); return }

    const scored = BANGLADESH_DISTRICTS.map(d => {
      const name = d.toLowerCase()
      const words = name.split(' ')
      let best = Infinity
      for (const term of searchTerms) {
        if (name.includes(term)) { best = -1; break } // exact substring = top priority
        const tolerance = term.length <= 4 ? 1 : 2
        for (const word of words) {
          const dist = levenshtein(word, term)
          if (dist <= tolerance) best = Math.min(best, dist)
        }
      }
      return { d, best }
    })
    .filter(x => x.best !== Infinity)
    .sort((a, b) => a.best - b.best)

    setRegionSuggestions(scored.map(x => x.d).slice(0, 6))
  }, [region])

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

  function startRegionRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('Voice input is not supported in your browser.')
      return
    }
    const recognition = new SpeechRecognition()
    regionRecognitionRef.current = recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'bn-BD'
    recognition.onstart = () => setIsRegionListening(true)
    recognition.onerror = (event) => {
      setError(`Voice recognition issue: ${event.error}`)
      setIsRegionListening(false)
    }
    recognition.onend = () => setIsRegionListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim()
      setRegion(transcript)
    }
    recognition.start()
  }

  function stopRegionRecognition() {
    if (regionRecognitionRef.current) {
      regionRecognitionRef.current.stop()
      setIsRegionListening(false)
    }
  }

  function toggleRegionListening() {
    if (isRegionListening) stopRegionRecognition()
    else startRegionRecognition()
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
    setWeather(null)
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
      setWeather(data.weather || null)   // ← add this line
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
                suppressHydrationWarning
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
                suppressHydrationWarning
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
          <label className="text-sm font-medium text-gray-300">এলাকা / Region (জেলা / District)</label>
          <div className="relative">
            <div
              ref={regionBorderRef}
              className="relative bg-gray-900 border border-gray-700 rounded-xl overflow-hidden transition-colors"
              style={{ borderColor: isRegionListening ? '#ef4444' : '' }}>
              <input
                type="text"
                suppressHydrationWarning
                placeholder="জেলার নাম টাইপ করুন... / Type district name..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-transparent border-none px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none"
                onFocus={() => {
                  if (regionBorderRef.current) regionBorderRef.current.style.borderColor = meta.color
                }}
                onBlur={() => {
                  if (regionBorderRef.current) regionBorderRef.current.style.borderColor = ''
                  setTimeout(() => setRegionSuggestions([]), 150)
                }}
                autoComplete="off"
              />
              <button
                type="button"
                suppressHydrationWarning
                onClick={toggleRegionListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all flex items-center justify-center
                  ${isRegionListening
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/40'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                title={isRegionListening ? "Stop listening" : "Speak district name"}
              >
                {isRegionListening ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
              </button>
            </div>
            {regionSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
                {regionSuggestions.map((district) => (
                  <li
                    key={district}
                    onMouseDown={() => {
                      setRegion(district)
                      setRegionSuggestions([])
                    }}
                    className="px-4 py-2.5 text-sm text-white hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    {district}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
              suppressHydrationWarning
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
          suppressHydrationWarning
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

        {/* Weather */}
        {weather && <WeatherCard weather={weather} />}

        {/* Results */}
        {result && <DiagnosisCard result={result} accentColor={meta.color} label={meta.label} isSecond={false} />}
        {secondOpinion && <DiagnosisCard result={secondOpinion} accentColor="#60a5fa" label={meta.label} isSecond={true} />}
      </div>
    </div>
  )
}

function WeatherCard({ weather }) {
  if (!weather) return null
  return (
    <div className="border border-gray-800 rounded-2xl bg-gray-900 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2">
        <span className="text-lg">🌤️</span>
        <p className="text-sm font-semibold text-gray-200">
          {weather.district} — বর্তমান আবহাওয়া
        </p>
      </div>
      <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">তাপমাত্রা / Temp</p>
          <p className="text-white font-semibold">{weather.temperature}°C</p>
        </div>
        <div className="bg-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">আর্দ্রতা / Humidity</p>
          <p className="text-white font-semibold">{weather.humidity}%</p>
        </div>
        <div className="bg-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">বৃষ্টিপাত / Rain</p>
          <p className="text-white font-semibold">{weather.precipitation} mm</p>
        </div>
        <div className="bg-gray-800 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">বাতাস / Wind</p>
          <p className="text-white font-semibold">{weather.windSpeed} km/h</p>
        </div>
      </div>
      <div className="px-5 pb-4">
        <div className="bg-gray-800 rounded-xl px-4 py-3 text-sm">
          <p className="text-xs text-gray-500 mb-1">অবস্থা / Condition</p>
          <p className="text-white">{weather.description}</p>
        </div>
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