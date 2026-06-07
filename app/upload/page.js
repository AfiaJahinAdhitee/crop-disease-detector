'use client'

import { useState } from 'react'
import { Upload, Leaf, AlertCircle, CheckCircle, AlertTriangle, Loader2, X } from 'lucide-react'

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

export default function UploadPage() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [cropType, setCropType] = useState('')
  const [region, setRegion] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [secondOpinion, setSecondOpinion] = useState(null)
  const [error, setError] = useState(null)

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
    setResult(null)
    setSecondOpinion(null)
    setError(null)
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
        <Leaf className="text-green-400" size={24} />
        <h1 className="text-lg font-semibold">Crop Disease Detector</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Diagnose a Leaf</h2>
          <p className="text-gray-400 mt-1 text-sm">
            Upload a clear photo of the affected leaf to get an AI-powered diagnosis.
          </p>
        </div>

        {/* Image Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative border-2 border-dashed border-gray-700 rounded-2xl overflow-hidden
                     hover:border-green-500 transition-colors cursor-pointer bg-gray-900"
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Leaf preview" className="w-full max-h-80 object-contain p-4" />
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
                <p className="font-medium text-gray-300">Drop your leaf photo here</p>
                <p className="text-sm text-gray-500 mt-1">or click to browse — JPG, PNG up to 10MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Crop Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Crop Type *</label>
          <div className="flex flex-wrap gap-2">
            {CROP_TYPES.map((crop) => (
              <button
                key={crop}
                onClick={() => setCropType(crop)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors
                  ${cropType === crop
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Region / Location</label>
          <input
            type="text"
            placeholder="e.g. Dhaka, Rajshahi, Chittagong..."
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm
                       text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
          />
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
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500
                     text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing leaf...
            </>
          ) : (
            <>
              <Leaf size={18} />
              Diagnose Now
            </>
          )}
        </button>

        {/* Primary Result */}
        {result && (
          <div className="border border-gray-800 rounded-2xl overflow-hidden bg-gray-900">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                {result.disease_detected ? (
                  <AlertTriangle size={18} className="text-yellow-400" />
                ) : (
                  <CheckCircle size={18} className="text-green-400" />
                )}
                <span className="font-semibold">{result.disease_name}</span>
              </div>
              {result.severity !== 'none' && (
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${SEVERITY_COLORS[result.severity] || SEVERITY_COLORS.low}`}>
                  {result.severity} severity
                </span>
              )}
            </div>

            {/* Confidence */}
            <div className="px-5 py-4 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Confidence</p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.round(result.confidence_score * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(result.confidence_score * 100)}%</p>
            </div>

            {/* Description */}
            {result.description && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">About this diagnosis</p>
                <p className="text-sm text-gray-300">{result.description}</p>
              </div>
            )}

            {/* Symptoms */}
            {result.symptoms && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">What we see</p>
                <p className="text-sm text-gray-300">{result.symptoms}</p>
              </div>
            )}

            {/* Treatment */}
            {result.disease_detected && result.treatment && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Treatment</p>
                <p className="text-sm text-gray-300">{result.treatment}</p>
              </div>
            )}

            {/* Remedies */}
            {result.disease_detected && result.remedies?.length > 0 && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Step-by-step remedies</p>
                <ol className="space-y-1.5 list-none">
                  {result.remedies.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 text-gray-400
                                       text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Prevention */}
            {result.prevention && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Prevention</p>
                <p className="text-sm text-gray-300">{result.prevention}</p>
              </div>
            )}

            {/* Source indicator */}
            <div className="px-5 py-3 flex items-center gap-2">
              {result.source === "custom_model" ? (
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
        )}

        {/* Second Opinion from Gemini */}
        {secondOpinion && (
          <div className="border border-yellow-800/50 rounded-2xl overflow-hidden bg-gray-900">

            {/* Warning header */}
            <div className="px-5 py-3 bg-yellow-900/20 border-b border-yellow-800/50 flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-400" />
              <p className="text-sm font-semibold text-yellow-400">Gemini AI has a different opinion</p>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                {secondOpinion.disease_detected ? (
                  <AlertTriangle size={18} className="text-yellow-400" />
                ) : (
                  <CheckCircle size={18} className="text-green-400" />
                )}
                <span className="font-semibold">{secondOpinion.disease_name}</span>
              </div>
              {secondOpinion.severity !== 'none' && (
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${SEVERITY_COLORS[secondOpinion.severity] || SEVERITY_COLORS.low}`}>
                  {secondOpinion.severity} severity
                </span>
              )}
            </div>

            {/* Confidence */}
            <div className="px-5 py-4 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-2">Confidence</p>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.round(secondOpinion.confidence_score * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(secondOpinion.confidence_score * 100)}%</p>
            </div>

            {/* Description */}
            {secondOpinion.description && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">About this diagnosis</p>
                <p className="text-sm text-gray-300">{secondOpinion.description}</p>
              </div>
            )}

            {/* Symptoms */}
            {secondOpinion.symptoms && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">What we see</p>
                <p className="text-sm text-gray-300">{secondOpinion.symptoms}</p>
              </div>
            )}

            {/* Treatment */}
            {secondOpinion.disease_detected && secondOpinion.treatment && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Treatment</p>
                <p className="text-sm text-gray-300">{secondOpinion.treatment}</p>
              </div>
            )}

            {/* Remedies */}
            {secondOpinion.disease_detected && secondOpinion.remedies?.length > 0 && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-2">Step-by-step remedies</p>
                <ol className="space-y-1.5 list-none">
                  {secondOpinion.remedies.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-gray-800 text-gray-400
                                       text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Prevention */}
            {secondOpinion.prevention && (
              <div className="px-5 py-4 border-b border-gray-800">
                <p className="text-xs text-gray-500 mb-1">Prevention</p>
                <p className="text-sm text-gray-300">{secondOpinion.prevention}</p>
              </div>
            )}

            {/* Source indicator */}
            <div className="px-5 py-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
              <p className="text-xs text-gray-500">বিশ্লেষণ করা হয়েছে Gemini AI দ্বারা</p>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}