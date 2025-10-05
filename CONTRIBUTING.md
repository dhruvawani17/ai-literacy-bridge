# 🤝 Contributing to AI Literacy Bridge

Thank you for your interest in contributing to the AI Literacy Bridge! This document provides guidelines and information for contributors.

## 🌟 Our Mission

We're building an inclusive educational platform that leverages AI to bridge the gap for underserved communities, with a special focus on accessibility for visually impaired students.

## 📋 Code of Conduct

This project follows a code of conduct that emphasizes:
- **Respect** for all contributors and users
- **Accessibility** as a core principle
- **Inclusive design** in all aspects
- **Open collaboration** and constructive feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Firebase account (for full functionality)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/ai-literacy-bridge.git`
3. Install dependencies: `npm install`
4. Set up environment variables: `cp .env.example .env.local`
5. Start development server: `npm run dev`

## 🛠️ Development Guidelines

### Code Style

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for all public APIs
- Prefer `const` over `let`, avoid `var`

#### React Components
```typescript
// ✅ Good: Comprehensive JSDoc and TypeScript
interface ComponentProps {
  title: string
  onClick: () => void
}

/**
 * Button component with accessibility features
 * @param props - Component properties
 */
function Button({ title, onClick }: ComponentProps) {
  return (
    <button
      onClick={onClick}
      aria-label={title}
      className="btn"
    >
      {title}
    </button>
  )
}
```

#### File Organization
```
src/
├── components/     # React components
│   ├── ui/        # Reusable UI components
│   └── feature/   # Feature-specific components
├── lib/           # Utilities and services
├── store/         # State management
├── types/         # TypeScript definitions
└── app/           # Next.js app router pages
```

### Accessibility Standards

#### WCAG 2.1 AA Compliance
- All components must be keyboard navigable
- Screen reader support with proper ARIA labels
- Sufficient color contrast ratios
- Focus management and visible focus indicators

#### Voice-First Design
```typescript
// ✅ Include voice support in components
function AccessibleButton({ children, onClick, voiceLabel }) {
  const speak = useSpeechSynthesis()

  const handleClick = () => {
    speak(voiceLabel) // Announce action to screen readers
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      aria-label={voiceLabel}
    >
      {children}
    </button>
  )
}
```

### Testing Requirements

#### Accessibility Testing
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation testing
- Color contrast validation
- Voice interaction testing

#### Component Testing
```typescript
// Example test structure
describe('StudentDashboard', () => {
  it('should be accessible via keyboard', () => {
    // Test keyboard navigation
  })

  it('should announce changes to screen readers', () => {
    // Test ARIA live regions
  })
})
```

### Commit Guidelines

#### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Testing changes
- `chore`: Maintenance tasks

#### Examples
```
feat(auth): add Firebase authentication provider
fix(dashboard): resolve logout redirect issue
docs(readme): update API documentation
style(components): format code with Prettier
```

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation
   - Ensure accessibility compliance

3. **Run Quality Checks**
   ```bash
   npm run lint
   npm run type-check
   npm run test  # When available
   ```

4. **Update Documentation**
   - Add JSDoc comments for new APIs
   - Update README if needed
   - Update component documentation

5. **Create Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes
   - Tag appropriate reviewers

### Review Process

#### For Reviewers
- Check accessibility compliance
- Verify TypeScript types
- Test functionality thoroughly
- Ensure documentation is updated
- Validate against WCAG guidelines

#### For Contributors
- Address all review comments
- Test changes thoroughly
- Ensure CI/CD passes
- Keep PRs focused and atomic

## 🎯 Feature Development

### Adding New Components
1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Include comprehensive JSDoc
4. Implement accessibility features
5. Add to component exports
6. Update documentation

### AI Integration
- Use Cerebras API for AI features
- Implement proper error handling
- Cache responses when appropriate
- Respect rate limits and quotas

### Database Changes
- Update Firestore security rules
- Test with Firebase emulator
- Document schema changes
- Ensure data privacy compliance

## 🐛 Issue Reporting

### Bug Reports
Please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Screen reader used (if applicable)
- Console errors or logs

### Feature Requests
Please include:
- Use case description
- Accessibility considerations
- Technical requirements
- Mockups or examples (if applicable)

## 📚 Resources

### Documentation
- [README.md](README.md) - Project overview and setup
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase configuration
- [SCRIBE_MATCHING_README.md](SCRIBE_MATCHING_README.md) - Scribe system details

### Tools & Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [React Accessibility](https://react.dev/learn/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Community
- GitHub Issues for bug reports and feature requests
- GitHub Discussions for questions and community support

## 🙏 Recognition

Contributors will be recognized in:
- Project README acknowledgments
- Release notes
- Contributor recognition events

Thank you for contributing to making education accessible for all! 🌍📚