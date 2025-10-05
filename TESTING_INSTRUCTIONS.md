# Testing Instructions for Logout & Dark Mode Features

## Prerequisites
1. Firebase authentication must be configured
2. User must be logged in to test logout functionality
3. Browser DevTools for testing dark mode

## Test Environment Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Access Test Pages
- Student Dashboard: Navigate after logging in as a student
- Scribe Dashboard: Visit `/scribe-dashboard` after logging in as a scribe

---

## Testing Checklist

### A. Logout Functionality Tests

#### Test 1: Student Dashboard Logout (Desktop)
**Steps:**
1. Log in as a student user
2. Navigate to Student Dashboard
3. Look for the red "Logout" button in the top-right corner
4. Click the "Logout" button
5. Verify you are redirected to `/auth` page
6. Try to access Student Dashboard again
7. Verify you are redirected to login

**Expected Results:**
- ✅ Logout button visible with LogOut icon and "Logout" text
- ✅ Button is red/destructive variant
- ✅ Clicking logs out and redirects to `/auth`
- ✅ Session is cleared (can't access dashboard without re-login)

#### Test 2: Student Dashboard Logout (Mobile)
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Set viewport to 375px width (iPhone SE)
4. Log in and navigate to Student Dashboard
5. Verify logout button shows only icon (no text)
6. Click logout icon
7. Verify redirect to `/auth`

**Expected Results:**
- ✅ Logout button shows only icon on mobile
- ✅ Button remains functional
- ✅ Proper spacing maintained

#### Test 3: Scribe Dashboard Logout (Desktop)
**Steps:**
1. Log in as a scribe user
2. Navigate to `/scribe-dashboard`
3. Look for the red "Logout" button in header (after "Back to Home")
4. Click the "Logout" button
5. Verify redirect to `/auth`

**Expected Results:**
- ✅ Logout button visible with icon and text
- ✅ Button placement correct (after Back to Home)
- ✅ Logout works correctly

#### Test 4: Scribe Dashboard Logout (Mobile)
**Steps:**
1. Open browser DevTools (F12)
2. Set mobile viewport (375px)
3. Navigate to `/scribe-dashboard`
4. Verify logout button shows only icon
5. Click logout
6. Verify redirect

**Expected Results:**
- ✅ Icon-only display on mobile
- ✅ Functionality preserved

#### Test 5: Logout Error Handling
**Steps:**
1. Open browser DevTools Console
2. Go to Network tab
3. Set network to "Offline"
4. Try to logout
5. Check console for errors
6. Set network back to "Online"
7. Try logout again

**Expected Results:**
- ✅ Error logged to console (not shown to user)
- ✅ Graceful handling of network errors
- ✅ Logout succeeds when network restored

---

### B. Dark Mode Text Visibility Tests

#### Test 6: Enable Dark Mode
**Steps:**
1. Open browser DevTools (F12)
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Type "Rendering"
4. Select "Show Rendering"
5. Find "Emulate CSS media feature prefers-color-scheme"
6. Select "prefers-color-scheme: dark"

**OR**

Change your OS dark mode settings:
- **Windows**: Settings → Personalization → Colors → Dark
- **macOS**: System Preferences → General → Appearance → Dark
- **Linux**: Depends on desktop environment

#### Test 7: Student Dashboard Dark Mode
**Steps:**
1. Enable dark mode (see Test 6)
2. Navigate to Student Dashboard
3. Check each section:

**Header Section:**
- ✅ "Welcome back, Student!" text is visible
- ✅ Subtitle text is visible
- ✅ All badges are readable

**Stats Cards:**
- ✅ "Overall Progress" label is visible
- ✅ Percentage numbers are visible
- ✅ "Sessions Today" is visible
- ✅ "Upcoming Scribe Sessions" is visible
- ✅ "Achievements" is visible
- ✅ All icons are visible

**Subject Cards:**
- ✅ Subject names are visible
- ✅ "Progress" labels are visible
- ✅ Percentage numbers are visible
- ✅ "Topics:" labels are visible
- ✅ Topic buttons are visible
- ✅ All badges are readable

**AI Insights:**
- ✅ "Strengths" heading is visible
- ✅ "Focus Areas" heading is visible
- ✅ "Learning Style" heading is visible
- ✅ All text content is readable

#### Test 8: Scribe Dashboard Dark Mode
**Steps:**
1. Enable dark mode
2. Navigate to `/scribe-dashboard`
3. Check each section:

**Header:**
- ✅ "Platform Dashboard" title is visible
- ✅ Subtitle is visible
- ✅ All buttons are visible and readable

**Stats Cards:**
- ✅ "Total Students" card:
  - Label visible
  - Number visible
  - Icon visible
  - Blue gradient appropriate for dark mode
- ✅ "Volunteer Scribes" card:
  - Green gradient appropriate for dark mode
  - All text visible
- ✅ "Verified Scribes" card:
  - Purple gradient appropriate for dark mode
  - All text visible
- ✅ "Platform Rating" card:
  - Yellow gradient appropriate for dark mode
  - All text visible

**Profile Cards (if user is logged in):**
- ✅ Student profile card text all visible
- ✅ Personal information readable
- ✅ Academic details readable
- ✅ Badges have proper contrast

**Empty States:**
- ✅ "No volunteers registered yet" message visible
- ✅ Icon visible
- ✅ Helper text visible

#### Test 9: Light/Dark Mode Switching
**Steps:**
1. Start in light mode
2. Navigate to Student Dashboard
3. Take note of all colors
4. Switch to dark mode
5. Verify all text remains visible
6. Switch back to light mode
7. Verify no elements broke

**Expected Results:**
- ✅ Smooth transition between modes
- ✅ No flickering or glitches
- ✅ All content visible in both modes

---

### C. Contrast Ratio Tests (WCAG Compliance)

#### Test 10: Automated Contrast Testing
**Steps:**
1. Install browser extension: "WAVE" or "axe DevTools"
2. Navigate to Student Dashboard
3. Run accessibility audit in light mode
4. Check for contrast issues
5. Switch to dark mode
6. Run audit again

**Expected Results:**
- ✅ No contrast errors in light mode
- ✅ No contrast errors in dark mode
- ✅ All text meets WCAG AA standard (4.5:1)

#### Test 11: Manual Contrast Check
**Steps:**
1. Open: https://webaim.org/resources/contrastchecker/
2. In light mode, check:
   - Background: #FFFFFF, Foreground: (your text color)
   - Verify ratio ≥ 4.5:1
3. In dark mode, check:
   - Background: (dark background), Foreground: (your text color)
   - Verify ratio ≥ 4.5:1

---

### D. Responsive Design Tests

#### Test 12: Mobile Portrait (375px)
**Expected:**
- ✅ Logout button shows icon only
- ✅ Stats cards stack vertically
- ✅ All text remains readable
- ✅ No horizontal scrolling

#### Test 13: Mobile Landscape (667px)
**Expected:**
- ✅ Logout button shows icon + text
- ✅ Stats cards in 2-column grid
- ✅ Proper spacing maintained

#### Test 14: Tablet (768px)
**Expected:**
- ✅ Full logout button visible
- ✅ Stats cards in 2-3 column grid
- ✅ Optimal use of space

#### Test 15: Desktop (1024px+)
**Expected:**
- ✅ Full layout with all elements
- ✅ Stats cards in 4-column grid
- ✅ Maximum width container centered

---

### E. Keyboard Navigation Tests

#### Test 16: Tab Navigation
**Steps:**
1. Navigate to Student Dashboard
2. Press Tab repeatedly
3. Verify focus order:
   - Settings button
   - Logout button
   - Other interactive elements

**Expected Results:**
- ✅ Logout button receives focus
- ✅ Focus indicator visible
- ✅ Focus order is logical

#### Test 17: Enter/Space to Logout
**Steps:**
1. Tab to Logout button
2. Press Enter
3. Verify logout occurs
4. Repeat with Space key

**Expected Results:**
- ✅ Enter key triggers logout
- ✅ Space key triggers logout
- ✅ Consistent behavior

---

### F. Screen Reader Tests

#### Test 18: NVDA/JAWS (Windows)
**Steps:**
1. Enable NVDA or JAWS
2. Navigate to dashboard
3. Tab to Logout button
4. Listen to announcement

**Expected:**
- ✅ Announces "Logout button"
- ✅ Announces state if pressed

#### Test 19: VoiceOver (macOS/iOS)
**Steps:**
1. Enable VoiceOver (Cmd+F5)
2. Navigate to dashboard
3. Swipe/Tab to Logout button
4. Listen to announcement

**Expected:**
- ✅ Announces "Logout button"
- ✅ Proper role announced

---

### G. Browser Compatibility Tests

#### Test 20: Chrome
- ✅ Logout works
- ✅ Dark mode works
- ✅ All styles render correctly

#### Test 21: Firefox
- ✅ Logout works
- ✅ Dark mode works
- ✅ All styles render correctly

#### Test 22: Safari
- ✅ Logout works
- ✅ Dark mode works
- ✅ All styles render correctly

#### Test 23: Edge
- ✅ Logout works
- ✅ Dark mode works
- ✅ All styles render correctly

---

## Common Issues & Solutions

### Issue 1: Logout button not visible
**Solution:** Ensure user is logged in and on the correct dashboard page

### Issue 2: Dark mode not applying
**Solution:** 
- Check if `prefers-color-scheme` is set correctly
- Verify CSS custom properties are loaded
- Check for conflicting styles

### Issue 3: Text still hard to read in dark mode
**Solution:**
- Verify you've pulled latest changes
- Check browser cache (Ctrl+Shift+R to hard refresh)
- Verify no browser extensions interfering with styles

### Issue 4: Logout redirects to wrong page
**Solution:**
- Check that Firebase auth is configured correctly
- Verify routing setup in Next.js

---

## Reporting Issues

If you find any issues during testing, please report with:
1. **Browser**: Name and version
2. **Screen size**: Viewport dimensions
3. **Mode**: Light or dark
4. **Steps to reproduce**: Detailed steps
5. **Expected**: What should happen
6. **Actual**: What actually happened
7. **Screenshots**: If applicable

---

## Test Results Template

```
Date: _____________
Tester: _____________
Browser: _____________

Logout Tests:
[ ] Test 1: Student Dashboard Logout (Desktop)
[ ] Test 2: Student Dashboard Logout (Mobile)
[ ] Test 3: Scribe Dashboard Logout (Desktop)
[ ] Test 4: Scribe Dashboard Logout (Mobile)
[ ] Test 5: Logout Error Handling

Dark Mode Tests:
[ ] Test 7: Student Dashboard Dark Mode
[ ] Test 8: Scribe Dashboard Dark Mode
[ ] Test 9: Light/Dark Mode Switching

Contrast Tests:
[ ] Test 10: Automated Contrast Testing
[ ] Test 11: Manual Contrast Check

Responsive Tests:
[ ] Test 12: Mobile Portrait
[ ] Test 13: Mobile Landscape
[ ] Test 14: Tablet
[ ] Test 15: Desktop

Accessibility Tests:
[ ] Test 16: Tab Navigation
[ ] Test 17: Enter/Space to Logout
[ ] Test 18: Screen Reader (Windows)
[ ] Test 19: Screen Reader (macOS)

Browser Tests:
[ ] Test 20: Chrome
[ ] Test 21: Firefox
[ ] Test 22: Safari
[ ] Test 23: Edge

Issues Found: _____________
Notes: _____________
```
