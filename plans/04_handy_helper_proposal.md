# HandyHelper - Gesture Detection & Motor Function Rehabilitation 👋

## Background & Motivation

### Clinical Observation
Many children with NMDA encephalitis experience **motor function challenges**, including:
- **Hand dominance changes** (switching from dominant to non-dominant hand)
- **Fine motor skill deficits**
- **Bilateral coordination difficulties**
- **Hand-eye coordination problems**
- **Gradual recovery of motor function** requiring sustained practice

### Real-World Experience
During NMDA encephalitis recovery, children may experience temporary loss of motor control in their dominant hand, leading to compensatory use of the non-dominant hand. As neurological function recovers, gradual reintegration of the dominant hand requires:
- **Gentle encouragement** to use the recovering hand
- **Tracking** which hand is being used
- **Bilateral exercises** that engage both hands
- **Progress monitoring** as motor function improves

---

## Application Purpose

**HandyHelper** uses web-based gesture detection to:
1. **Track hand usage** (left vs right) during activities
2. **Encourage use of both hands** through bilateral exercises
3. **Practice fine motor skills** with engaging games
4. **Monitor recovery progress** as hand preference normalizes
5. **Build hand-eye coordination** through tracking exercises

---

## Technical Approach

### Gesture Detection Technologies

#### Option 1: MediaPipe Hands (Recommended)
- **What it is:** Google's pre-trained hand tracking model
- **Capabilities:**
  - Detects 21 hand landmarks in real-time
  - Identifies left vs right hand
  - Tracks finger positions and gestures
  - Works via webcam (no special hardware needed)
  - Runs in browser using TensorFlow.js

#### Option 2: Simple Motion Detection
- **What it is:** Color-based movement tracking
- **Capabilities:**
  - Track hand movement via webcam
  - Simpler, less resource-intensive
  - Good for basic tracking activities

### Privacy Considerations
- ✅ **All processing happens client-side** (in browser)
- ✅ **No video is uploaded or stored**
- ✅ **Camera access only when actively using the app**
- ✅ **Clear visual indicator** when camera is active
- ✅ **Easy to deny/revoke permissions**

---

## Proposed Activities

### Level 1: Hand Awareness 🖐️

#### Activity: Which Hand?
**Purpose:** Build awareness of which hand is being used

**How it works:**
1. Camera detects which hand appears on screen
2. asks: "Can you show me your **right** hand?"
3. Child holds up the requested hand
4. App celebrates: "Great job! That's your right hand!"
5. Tracks: % of time each hand is used

**Therapeutic Goal:** Re-establish hand dominance awareness

---

### Level 2: Hand Switching 🔄

#### Activity: Switch & Reach
**Purpose:** Practice using both hands

**How it works:**
1. Objects appear on left and right sides of screen
2. Prompt: "Touch the star with your **left** hand!"
3. Child must use the specified hand to reach the target
4. Encourages alternating between hands
5. Tracks: Success rate per hand

**Therapeutic Goal:** Bilateral coordination, following instructions

---

### Level 3: Gesture Games 👆

#### Activity: Finger Counting
**Purpose:** Fine motor control and finger individuation

**How it works:**
1. App shows a number (1-5)
2. Child holds up that many fingers
3. MediaPipe detects which fingers are extended
4. Celebrates correct gestures
5. Progressive difficulty (both hands, different numbers)

**Therapeutic Goal:** Finger dexterity, number recognition

---

#### Activity: Shadow Puppets
**Purpose:** Hand positioning and creativity

**How it works:**
1. App shows a hand shape (peace sign, thumbs up, etc.)
2. Child recreates the gesture
3. App detects if gesture matches
4. Free play mode: Make your own shapes!

**Therapeutic Goal:** Motor planning, imitation, creativity

---

### Level 4: Coordination Challenges 🎯

#### Activity: Catch the Butterfly
**Purpose:** Hand-eye coordination and tracking

**How it works:**
1. Animated butterflies fly across screen
2. Child moves hand to "catch" them
3. Hand position tracked in real-time
4. Score points for successful catches
5. Can specify which hand to use

**Therapeutic Goal:** Hand-eye coordination, visual tracking, motor planning

---

#### Activity: Both Hands Dance
**Purpose:** Bilateral coordination

**How it works:**
1. Targets appear on both sides simultaneously
2. Child must touch both with corresponding hands
3. Requires using both hands at the same time
4. Rhythmic patterns (like playing drums)

**Therapeutic Goal:** Bilateral coordination, rhythm, attention

---

### Level 5: Drawing & Tracing ✏️

#### Activity: Air Drawing
**Purpose:** Fine motor control and pre-writing skills

**How it works:**
1. App shows a simple shape (circle, line, zigzag)
2. Child "draws" the shape in the air with index finger
3. Hand tracking follows finger movement
4. Creates a trail on screen showing their path
5. Compares to target shape

**Therapeutic Goal:** Pre-writing motor skills, motor planning

---

## Progress Tracking

### Data Collected
- **Hand preference:** % time using left vs right hand
- **Accuracy:** Success rate for each hand
- **Reaction time:** Speed of responses per hand
- **Bilateral performance:** Success with both hands together
- **Gesture recognition:** Ability to form specific hand shapes
- **Trend analysis:** Changes in hand dominance over time

### Visualizations
- **Hand usage pie chart** (left vs right vs both)
- **Timeline graph** showing dominance trends
- **Skill progress bars** for each activity
- **Weekly/monthly comparison**

### Reports for Therapists
Downloadable CSV with:
- Date, time, duration of each session
- Activities completed
- Hand used for each attempt
- Success rates
- Notable changes in hand preference

---

## User Interface Design

### Camera Setup Screen
```
┌─────────────────────────────────────┐
│  👋 HandyHelper Camera Setup         │
├─────────────────────────────────────┤
│                                     │
│  [Camera Preview Window]            │
│  📹 Camera is active                │
│                                     │
│  ✓ Can you see your hands?          │
│  ✓ Make sure lighting is good       │
│  ✓ Sit about 2 feet from camera     │
│                                     │
│  [ Start Activities ]               │
│  [ Privacy Policy ]                 │
│                                     │
└─────────────────────────────────────┘
```

### Activity Screen
```
┌──────────────────────────────────────┐
│ ⭐ Stars Collected: 12  📹 Camera ON │
├──────────────────────────────────────┤
│                                      │
│     [Live Camera Feed with           │
│      Hand Tracking Overlay]          │
│                                      │
│     🎯 Touch the 🌟 with your       │
│        RIGHT HAND!                   │
│                                      │
├──────────────────────────────────────┤
│ Left Hand: 45% | Right Hand: 55%    │
└──────────────────────────────────────┘
```

---

## Technical Implementation

### Libraries & Dependencies
```html
<!-- MediaPipe Hands via CDN -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
```

### Basic Structure
```javascript
// Initialize MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 2,          // Detect both hands
  modelComplexity: 1,      // Balance between accuracy and speed
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onHandsDetected);

// Handle detection results
function onHandsDetected(results) {
  if (results.multiHandLandmarks) {
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const landmarks = results.multiHandLandmarks[i];
      const handedness = results.multiHandedness[i].label; // "Left" or "Right"
      
      // Process hand data
      processHandGesture(landmarks, handedness);
    }
  }
}
```

### Performance Optimization
- **Throttle video processing** (30 FPS is sufficient)
- **Lazy load MediaPipe** (only when HandyHelper is opened)
- **Fallback mode** (if camera not available, use keyboard/mouse)

---

## Safety & Accessibility

### Safety Considerations
- ✅ **Camera permission required** (user must grant access)
- ✅ **Clear privacy notice** before first use
- ✅ **Visual indicator** when camera is active
- ✅ **One-click disable** camera button
- ✅ **No recording or storage** of video
- ✅ **Works offline** after initial script load

### Accessibility
- ✅ **Alternative input methods** (mouse, keyboard) if camera unavailable
- ✅ **Clear visual instructions** for each activity
- ✅ **Audio cues** (optional) for prompts
- ✅ **Adjustable difficulty** for different motor abilities
- ✅ **No time pressure** (except in optional challenge modes)

---

## Development Priority

**Status:** High priority alongside Memory Garden

**Rationale:**
- Addresses **unique motor function** recovery need
- Uses **cutting-edge technology** (gesture detection)
- **Innovative** approach not commonly available
- **Directly relevant** to observed clinical needs
- Can **demonstrate technological capability** to medical team

---

## Medical Team Questions

Before full implementation, we should consult:

1. **Occupational Therapists:**
   - Are these activities clinically appropriate?
   - What motor skills should we prioritize?
   - Should we limit session duration to prevent fatigue?

2. **Neurologists:**
   - Is tracking hand dominance valuable for recovery monitoring?
   - Are there contraindications for any activities?

3. **Physical Therapists:**
   - What bilateral exercises are most beneficial?
   - Should we include range-of-motion tracking?

---

## Next Steps

1. **Build MVP** with core hand detection
2. **Implement "Which Hand?" activity** (simplest starting point)
3. **Test with real users** (your daughter first!)
4. **Gather feedback** on user experience
5. **Add more activities** based on effectiveness
6. **Iterate** based on clinical guidance

---

**HandyHelper represents an innovative application of technology to address a real, observed need in NMDA encephalitis recovery. By tracking and encouraging hand usage, we can support children as they regain motor function in their recovering limbs.** 🌟
