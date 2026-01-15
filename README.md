# MedLink Research

Free, evidence-based therapeutic web applications designed to support children recovering from autoimmune NMDA encephalitis.

## 🎯 Purpose

These interactive games help children rebuild:
- **Memory & Cognitive Skills** (Memory Garden 🌱)
- **Fine Motor Function & Hand Coordination** (HandyHelper 👋)
- Speech & Language (Coming Soon)
- Attention & Executive Function (Coming Soon)
- Emotional Regulation (Coming Soon)
- Daily Living Skills (Coming Soon)

## 🚀 Available Applications

### Memory Garden 🌱
Fun memory training games featuring:
- **Flower Memory Match**: Classic card matching with adjustable difficulty
- Beautiful, child-friendly interface
- Progress tracking and statistics
- Fully keyboard accessible

### HandyHelper 👋 (Coming Soon)
Gesture detection and hand motor skill rehabilitation:
- Hand dominance tracking
- Bilateral coordination exercises
- Uses webcam for gesture recognition
- Privacy-focused (all processing happens locally)

## 🌟 Key Features

- ✅ **100% Free** - No subscriptions, no ads
- ✅ **Privacy First** - All data stays on your device
- ✅ **Evidence-Based** - Grounded in clinical research
- ✅ **Accessible** - Keyboard navigable, screen reader friendly
- ✅ **Offline Capable** - Works without internet after initial load
- ✅ **Open Source** - Community contributions welcome

## 📖 Documentation

For comprehensive information about the project:
- **[Executive Summary](plans/00_executive_summary.md)** - Overview for medical professionals
- **[Project Overview](plans/README.md)** - Full documentation guide
- **[Research Background](plans/01_research_background.md)** - Clinical research foundation
- **[Project Proposals](plans/02_project_proposals.md)** - Detailed application designs
- **[Technical Roadmap](plans/03_technical_roadmap.md)** - Development plan
- **[HandyHelper Proposal](plans/04_handy_helper_proposal.md)** - Gesture detection app details

## 🛠️ Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling with modern animations
- **Vanilla JavaScript** - No framework dependencies
- **MediaPipe** (for HandyHelper) - Hand tracking via TensorFlow.js
- **LocalStorage** - Client-side progress tracking
- **GitHub Pages** - Free hosting

## 🚀 Getting Started

### For Users (Patients/Families)

1. **Open in Browser**: Simply visit the GitHub Pages URL (coming soon)
2. **No Installation Required**: Everything runs in your web browser
3. **Choose an Activity**: Start with Memory Garden
4. **Track Progress**: View your statistics anytime

### For Developers

```bash
# Clone the repository
git clone https://github.com/[username]/medlink-research.git

# Navigate to project
cd medlink-research

# Open in browser (no build process needed!)
# Just open index.html in your browser
# Or use a simple HTTP server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

## 📂 Project Structure

```
medical/
├── index.html                 # Landing page
├── shared/                    # Shared resources
│   ├── css/common.css        # Design system
│   └── js/storage.js         # Progress tracking
├── memory-garden/            # Memory training app
│   ├── index.html
│   ├── css/
│   └── js/
├── handy-helper/             # Gesture detection app (in development)
├── plans/                    # Planning documents
└── docs/                     # User guides (coming soon)
```

## 🤝 Contributing

This project was created by a parent to help children in recovery. Contributions are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Contribution
- 🎨 New activities/games (must be therapeutically appropriate)
- 🌍 Translations to other languages
- ♿ Accessibility improvements
- 🐛 Bug fixes
- 📚 Documentation improvements

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Medical Disclaimer

These tools are designed to **complement**, not replace, professional medical care. Always consult with healthcare providers about your child's treatment plan. The applications are intended for use alongside supervised therapy programs.

## 💖 Acknowledgments

- Medical professionals who provided clinical guidance
- Families affected by NMDA encephalitis who inspire this work
- The encephalitis research community
- Open source contributors

## 📬 Contact

For questions, feedback, or collaboration opportunities:
- Open an issue on GitHub
- See [plans/00_executive_summary.md](plans/00_executive_summary.md) for medical team contact

---

**Built with ❤️ for families affected by NMDA encephalitis**

🌟 *"Clinical Intelligence & Rehabilitation, Unified."* 🌟
