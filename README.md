# 🌍 AI Literacy Bridge - Cerebras Integration

**Revolutionizing education for underserved communities with AI-powered personalized learning, accessibility-first design, and Cerebras Wafer-Scale Engine integration.**

## 🚨 Problem We're Solving

Students in underserved communities, especially blind/visually impaired students, face significant educational barriers:

- **Lack of personalized education** adapted to individual learning styles
- **Inaccessible visual learning materials** (charts, graphs, code visualizations)
- **Dependency on human scribes** for exams and note-taking
- **Limited resources in local languages** and dialects

## 💡 Our Solution with Cerebras

### 🔹 1. Massive Multi-Language Education Brain
- **Cerebras Wafer-Scale Engine** enables training Llama 3 on massive datasets in hours
- Fine-tuned on NCERT, Khan Academy, UNESCO datasets
- Specialized in accessibility corpora (DAISY, Braille-translated resources)
- Support for local languages & dialects (Hindi, Marathi, Tamil, etc.)

### 🔹 2. Long-Term Student Memory
- **Ultra-long context windows** (millions of tokens) powered by Cerebras
- AI Tutor remembers months of learning history
- Adaptive explanations based on individual progress
- Consistent voice-first experience for blind students

### 🔹 3. Accessible Visuals → Audio Narratives
- **Fast code generation** with Cerebras inference
- Automated creation of educational visualizations
- Parallel audio descriptions for blind learners
- Real-time adaptation to accessibility needs

### 🔹 4. AI Scribe Finder
- **Large-scale volunteer matching** powered by Cerebras
- Instant student ↔ scribe pairing based on subject expertise
- Real-time AI scribe for exams (reads questions, accepts dictated answers)

## 🛠️ Tech Stack

### Core Framework
- **Next.js 14** with TypeScript and App Router
- **Tailwind CSS** for responsive, accessible UI
- **Framer Motion** for smooth animations

### AI & ML
- **Cerebras Wafer-Scale Engine** for large-scale model training and inference
- **Meta Llama 3** for reasoning and multilingual outputs
- **OpenAI API** as fallback for development

### Accessibility & Voice
- **Web Speech API** for voice recognition and text-to-speech
- **ARIA** compliant components for screen readers
- **High contrast mode** and adjustable font sizes
- **Keyboard navigation** support

### State Management & Data
- **Zustand** for client-side state management
- **Prisma** with PostgreSQL for production data
- **NextAuth.js** for authentication
- **Firebase/Supabase** for real-time features

### 3D Visualizations
- **Three.js** with React Three Fiber
- **Recharts** for accessible data visualizations

## 🚀 Getting Started

> 📖 **Quick Start:** See [QUICKSTART.md](QUICKSTART.md) for a TL;DR version
> 
> 🔥 **Firebase Issues?** See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (free tier works!)
- Cerebras API access (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-literacy-bridge
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```
Edit `.env.local` with your API keys:
```bash
# Cerebras AI
CEREBRAS_API_KEY=your_cerebras_api_key_here
CEREBRAS_ENDPOINT=https://api.cerebras.ai/v1
CEREBRAS_MODEL=llama3.1-8b

# Firebase (for authentication and database)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

4. **Set up Firebase (Important!)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore security rules
firebase deploy --only firestore:rules
```

📖 **See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed Firebase configuration instructions.**

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Key Features

### For Students
- **Personalized AI Tutor** with long-term memory
- **Voice-first interface** for accessibility
- **Multi-language support** for local communities
- **Progress tracking** with adaptive learning paths
- **Scribe booking system** for exams

### For Teachers
- **Student progress analytics** 
- **Curriculum alignment** with NCERT standards
- **Accessibility insights** for inclusive teaching

### For Scribes
- **Smart matching system** based on expertise
- **Real-time session management**
- **Digital note-taking tools**

### Accessibility Features
- ♿ **Screen reader optimization**
- 🎤 **Voice navigation** 
- 🔊 **Audio descriptions** for visual content
- 🌓 **High contrast mode**
- 📝 **Braille support**
- ⌨️ **Keyboard-only navigation**

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── AITutorChat.tsx # Voice-enabled AI tutor
│   └── StudentDashboard.tsx
├── lib/                 # Core utilities
│   ├── cerebras.ts     # Cerebras integration
│   ├── accessibility.ts # Voice & accessibility
│   └── utils.ts
├── store/              # Zustand state management
├── types/              # TypeScript definitions
└── hooks/              # Custom React hooks
```

## 📚 API Documentation

### Core Components

#### `StudentDashboard`
**Location:** `src/components/StudentDashboard.tsx`

Main learning interface for students featuring AI tutoring, progress tracking, and scribe matching.

**Key Features:**
- AI-powered conversational learning with Cerebras integration
- Real-time scribe matching system
- Progress tracking with gamification
- Voice-first accessibility design
- Multi-language support

**Props:** None (uses global state management)

**Accessibility:** WCAG 2.1 AA compliant with full keyboard navigation

#### `ScribeDashboard`
**Location:** `src/components/ScribeDashboard.tsx`

Comprehensive dashboard for scribe volunteers managing registration, availability, and student matching.

**Props:**
```typescript
interface ScribeDashboardProps {
  enableVoiceSupport?: boolean  // Default: true
  userEmail?: string           // For personalization
}
```

**Key Features:**
- Scribe registration and profile management
- AI-powered student matching algorithms
- Availability scheduling
- Voice-enabled interface
- Administrative tools for coordinators

#### `InteractiveDemo`
**Location:** `src/components/InteractiveDemo.tsx`

Auto-playing carousel demonstrating platform features with accessibility-first design.

**Key Features:**
- 4-second auto-advancing carousel
- Voice announcements for screen readers
- Manual navigation with pause functionality
- Responsive design for all devices
- High contrast and keyboard accessible

#### `AITutorChat`
**Location:** `src/components/AITutorChat.tsx`

Cerebras-powered conversational AI tutor with long-term memory and multi-language support.

**Integration:**
- Uses Cerebras Wafer-Scale Engine for fast inference
- Maintains conversation context across sessions
- Supports 12+ Indian languages
- Voice input/output capabilities

### Core Services

#### Firebase Authentication
**Location:** `src/lib/firebase-auth-provider.tsx`

Handles user authentication, registration, and session management.

**Key Methods:**
```typescript
interface FirebaseAuthContext {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, role: UserRole) => Promise<void>
}
```

#### Cerebras AI Integration
**Location:** `src/lib/cerebras.ts`

Manages AI model interactions for tutoring, matching, and content generation.

**Configuration:**
```typescript
interface CerebrasConfig {
  apiKey: string
  endpoint: string
  model: string  // llama3.1-8b
}
```

#### Scribe Matching Engine
**Location:** `src/lib/scribe-matching-engine.ts`

AI-powered algorithm for matching students with qualified scribes based on multiple factors.

**Matching Criteria:**
- Subject expertise alignment
- Geographic proximity
- Language compatibility
- Availability scheduling
- Experience level matching

### State Management

#### Zustand Stores
**Location:** `src/store/index.ts`

Global state management using Zustand for user sessions, learning progress, and accessibility preferences.

**Available Stores:**
- `useUserStore` - User authentication and profile data
- `useLearningStore` - Learning sessions and AI memory
- `useScribeStore` - Scribe matching and availability
- `useAccessibilityStore` - Accessibility preferences and settings

### Type Definitions

#### Core Types
**Location:** `src/types/index.ts` and `src/types/scribe-system.ts`

Comprehensive TypeScript definitions for the entire application.

**Key Interfaces:**
```typescript
interface User {
  id: string
  email: string
  role: 'student' | 'scribe' | 'teacher' | 'admin'
  profile: UserProfile
}

interface ScribeProfile {
  id: string
  subjects: string[]
  languages: string[]
  experience: number
  availability: AvailabilitySchedule
  certifications: string[]
}

interface StudentProfile {
  id: string
  grade: string
  subjects: string[]
  disabilityInfo: DisabilityInfo
  location: Location
  examHistory: ExamRecord[]
}
```

## 🎨 Design Philosophy

### Accessibility First
- Every feature is designed for keyboard and screen reader users
- Voice interaction is a primary input method, not an afterthought
- Visual content always has audio alternatives

### Inclusive by Design
- Multi-language support from day one
- Cultural sensitivity in AI responses
- Adaptable to different learning styles and disabilities

### Privacy & Safety
- Local storage of sensitive accessibility preferences
- Encrypted communication for scribe sessions
- COPPA compliance for student data

## 📊 Impact Metrics

- **Students served**: Targeting 10,000+ in first year
- **Languages supported**: 12+ Indian languages and dialects
- **Accessibility compliance**: WCAG 2.1 AA standard
- **Response time**: <2 seconds with Cerebras optimization

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cerebras Systems** for Wafer-Scale Engine access
- **Meta AI** for Llama 3 model
- **NCERT** for educational content standards
- **Khan Academy** for open educational resources
- **DAISY Consortium** for accessibility standards

---

**Built with ❤️ for inclusive education**
