import { VoiceSettings } from '@/types'

export class VoiceManager {
  private synth: SpeechSynthesis | null = null
  private recognition: any = null
  private settings: VoiceSettings
  private isListening = false
  private onResultCallback?: (result: string) => void

  constructor(settings: VoiceSettings) {
    this.settings = settings
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis
      this.initializeRecognition()
    }
  }

  private initializeRecognition() {
    if (typeof window === 'undefined') return

    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = this.settings.language

      this.recognition.onresult = (event: any) => {
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          }
        }

        if (finalTranscript && this.onResultCallback) {
          this.onResultCallback(finalTranscript)
        }
      }

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        this.isListening = false
      }

      this.recognition.onend = () => {
        this.isListening = false
      }
    }
  }

  speak(text: string, interrupt = true): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not available'))
        return
      }

      if (interrupt) {
        this.synth.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = this.settings.language
      utterance.rate = this.settings.rate
      utterance.pitch = this.settings.pitch
      utterance.volume = this.settings.volume

      // Find the preferred voice
      const voices = this.synth.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name === this.settings.voice || 
        voice.lang === this.settings.language
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)

      this.synth.speak(utterance)
    })
  }

  startListening(onResult: (result: string) => void): void {
    if (!this.recognition || this.isListening) return

    this.onResultCallback = onResult
    this.isListening = true
    this.recognition.start()
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    if (this.recognition) {
      this.recognition.lang = this.settings.language
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return []
    return this.synth.getVoices()
  }

  isSupported(): { speech: boolean; recognition: boolean } {
    return {
      speech: typeof window !== 'undefined' && 'speechSynthesis' in window,
      recognition: typeof window !== 'undefined' && 
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    }
  }
}

// Accessibility utilities
export class AccessibilityManager {
  private announcer: HTMLElement | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.createAnnouncer()
    }
  }

  private createAnnouncer() {
    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.style.position = 'absolute'
    this.announcer.style.left = '-9999px'
    this.announcer.style.width = '1px'
    this.announcer.style.height = '1px'
    this.announcer.style.overflow = 'hidden'
    document.body.appendChild(this.announcer)
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.announcer) return

    this.announcer.setAttribute('aria-live', priority)
    this.announcer.textContent = message

    // Clear after a delay to allow for re-announcement of the same message
    setTimeout(() => {
      if (this.announcer) this.announcer.textContent = ''
    }, 1000)
  }

  setFocusToElement(element: HTMLElement) {
    element.focus()
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  addKeyboardNavigation(
    container: HTMLElement,
    onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ) {
    container.addEventListener('keydown', (e) => {
      const key = e.key

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        e.preventDefault()
        const direction = key.replace('Arrow', '').toLowerCase() as any
        onNavigate?.(direction)
      }
    })
  }

  enhanceForScreenReader(element: HTMLElement, description: string) {
    element.setAttribute('aria-label', description)
    element.setAttribute('role', element.tagName === 'BUTTON' ? 'button' : 'region')
    element.setAttribute('tabindex', '0')
  }

  createBrailleDescription(content: string): string {
    // Simplified braille text description
    // In a real implementation, you'd use a proper Braille library
    return content
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
  }

  addHighContrastMode() {
    document.body.classList.add('high-contrast')
  }

  removeHighContrastMode() {
    document.body.classList.remove('high-contrast')
  }

  adjustFontSize(size: 'small' | 'medium' | 'large' | 'xlarge') {
    document.body.className = document.body.className.replace(
      /font-size-\w+/g, 
      ''
    )
    document.body.classList.add(`font-size-${size}`)
  }
}

// Global instances
let voiceManager: VoiceManager | null = null
let accessibilityManager: AccessibilityManager | null = null

export function getVoiceManager(settings: VoiceSettings): VoiceManager {
  if (!voiceManager) {
    voiceManager = new VoiceManager(settings)
  }
  return voiceManager
}

export function getAccessibilityManager(): AccessibilityManager {
  if (!accessibilityManager) {
    accessibilityManager = new AccessibilityManager()
  }
  return accessibilityManager
}

// Utility functions
export function generateAudioDescription(visualContent: string): string {
  // This would integrate with Cerebras to generate detailed audio descriptions
  return `Audio description: ${visualContent}`
}

export function createVoiceCommand(command: string, action: () => void) {
  // Voice command registration utility
  return {
    command: command.toLowerCase(),
    action,
    match: (input: string) => input.toLowerCase().includes(command.toLowerCase())
  }
}