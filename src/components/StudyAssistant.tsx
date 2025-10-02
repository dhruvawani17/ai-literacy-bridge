'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Volume2, Play, Pause, RotateCcw } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

interface StudyAssistantProps {
  onClose?: () => void
}

export function StudyAssistant({ onClose }: StudyAssistantProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [summary, setSummary] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setIsProcessing(true)

    try {
      // Check if storage is available
      if (!storage) {
        throw new Error('Firebase Storage not initialized')
      }

      // Upload to Firebase Storage
      const storageRef = ref(storage, `study-materials/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)

      // Mock text extraction (in real implementation, use OCR API like Google Vision)
      const mockText = await mockExtractText(file)
      setExtractedText(mockText)

      // Mock summarization (in real implementation, use OpenAI or similar)
      const mockSummary = await mockSummarizeText(mockText)
      setSummary(mockSummary)
    } catch (error) {
      console.error('Error processing file:', error)
      // Handle error appropriately
    } finally {
      setIsProcessing(false)
    }
  }

  const mockExtractText = async (file: File): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock text based on file type
    if (file.type === 'application/pdf') {
      return `This is extracted text from the PDF file "${file.name}". In a real implementation, this would use OCR technology to extract text from the document. The content would include all readable text from the PDF, preserving formatting where possible.`
    } else if (file.type.startsWith('image/')) {
      return `This is extracted text from the image "${file.name}". Using optical character recognition (OCR), we can convert the visual text in images into machine-readable text. This enables accessibility for users who cannot see the image content.`
    } else {
      return `This is the content of the text file "${file.name}". The file has been successfully uploaded and processed. All text content is now available for summarization and voice reading.`
    }
  }

  const mockSummarizeText = async (text: string): Promise<string> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simple mock summarization
    const words = text.split(' ')
    const summaryLength = Math.min(50, words.length / 3)
    return `Summary: ${words.slice(0, summaryLength).join(' ')}... (Key points: accessibility, education, technology integration)`
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      speechSynthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    } else {
      alert('Speech synthesis is not supported in your browser.')
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const resetAssistant = () => {
    setUploadedFile(null)
    setExtractedText('')
    setSummary('')
    setIsProcessing(false)
    stopSpeaking()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Study Assistant</h1>
              <p className="text-gray-600 mt-2">
                Upload documents and get AI-powered summaries with voice narration
              </p>
            </div>
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Study Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, TXT, JPG, PNG files up to 10MB
                  </p>
                </label>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-medium">{uploadedFile.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetAssistant}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Processing your document...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {(extractedText || summary) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Text */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Extracted Text</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(extractedText)}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={extractedText}
                  readOnly
                  className="min-h-[200px] resize-none"
                  placeholder="Extracted text will appear here..."
                />
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>AI Summary</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(summary)}
                    disabled={isSpeaking}
                  >
                    {isSpeaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={summary}
                  readOnly
                  className="min-h-[200px] resize-none"
                  placeholder="AI-generated summary will appear here..."
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Voice Controls */}
        {isSpeaking && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Speaking...</span>
                </div>
                <Button variant="outline" onClick={stopSpeaking}>
                  <Pause className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}