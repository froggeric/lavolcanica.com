# La Sonora Volcánica: Website Design & Development Guide

**Project:** Official Website for the music artist "La Sonora Volcánica"
**Version:** 2.0
**Stack:** Vanilla HTML, CSS, and JavaScript (No libraries or frameworks)

## 1. Design Philosophy

### 1.1. Core Project Vision

The website aims to be an immersive, content-rich experience for fans of La Sonora Volcánica. It serves as the official digital presence for the artist, showcasing their music, stories, and collaborations. The design should be modern, dynamic, and easily updatable.

### 1.2. Target Audience Analysis

The target audience includes fans of cumbia, Latin music, surf rock, and chicha. The design should appeal to a wide range of users, from casual listeners to dedicated fans.

### 1.3. Foundational Design Principles

The entire aesthetic is built on the concept of "Tropical Noir," a fusion of opposites that reflects the artist's music:

- **Tropical:** Vibrant, energetic, natural, referencing Latin American culture, cumbia, and the Canary Islands.
- **Noir:** Moody, atmospheric, dark, mysterious, and cinematic, referencing the "volcanic" energy and the soulful depth of genres like bolero and tango.

This translates to a dark-themed UI where vibrant accent colors and high-quality imagery can truly stand out.

## 2. Aesthetic Framework

### 2.1. Color Palette

The palette is defined as CSS variables in the `:root` of `style.css` for easy maintenance.

| Name | Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| Volcanic Night | `--bg-volcanic-night` | `#1a1a1a` | Primary site background. |
| Salt Crystal | `--text-salt-crystal` | `#F0F0F0` | Main text, UI elements, icons. |
| Lava Glow | `--accent-lava-glow` | `#FF4D4D` | Primary CTAs, active states, highlights. |
| Canary Teal | `--accent-canary-teal`| `#00C2A8` | Secondary highlights, icon hover states. |

### 2.2. Typography

Fonts are sourced from Google Fonts and are declared in `style.css`.

- **Headings:** **Montserrat** (Weights: 700, 900)
- **Body Text:** **Roboto** (Weight: 400)

### 2.3. Iconography

A single, efficient SVG sprite is defined at the top of `index.html`. Icons are used throughout the site with the `<svg class="icon"><use href="#icon-id"></use></svg>` syntax.

## 3. User Experience (UX) Strategy

### 3.1. User Interface (UI) Patterns

The application employs a component-based architecture and a data-driven, declarative rendering pattern. This approach mimics the core principles of modern front-end frameworks like React or Vue, but without the associated overhead.

### 3.2. Information Architecture and Navigation

The site is designed as a dynamic, single-page application that feels both immersive and easy to navigate. The main navigation includes links to Music, Surf Map, About, and Collaborations.

#### Fuerteventura Surf Map
The Fuerteventura Surf Map is an interactive feature accessible via the main navigation. It allows users to:
- **Explore Surf Spots**: View markers for various surf spots on an interactive map of Fuerteventura.
- **Access Detailed Information**: Click on markers to open a modal with comprehensive details about each spot (wave type, ability level, hazards, etc.).
- **Search and Filter**: Utilize search functionality to find specific spots and apply filters based on criteria such as wave type, skill level, and location.
- **Minimap Navigation**: A minimap provides an overview of the entire island, showing the user's current viewport and all active surf spots.

#### Smart Navigation History System

A key UX enhancement is the intelligent navigation history system that provides context-aware navigation:

- **Navigation Context Tracking**: The system automatically detects the user's current context when they open release info panels
- **Smart Return Navigation**: When users close release info panels, they are intelligently returned to their previous context rather than always returning to the main screen
- **State Persistence**: Uses URL parameters and session storage to maintain navigation state across interactions
- **Seamless User Experience**: Creates a natural navigation flow that matches user expectations

This system enhances the user experience by creating logical navigation paths and reducing the cognitive load when exploring the music catalog and collaborator information.

### 3.3. Key UX/UI Enhancements

Recent updates have significantly refined the user experience and interface:

#### 1. Unified Panel Layout
- **Description**: The collaborator panel now consistently appears on the right side, mirroring other information panels like release details. This ensures a predictable and intuitive interface across the application.
- **Impact**: Users benefit from a standardized interaction model, reducing cognitive load and improving navigation efficiency.

#### 2. Interactive Album Art in Release Panel
- **Description**: Within the detailed release information panel, the album artwork is now a clickable element that initiates playback of the associated music.
- **Impact**: Provides a direct and engaging way for users to start listening to music immediately upon viewing release details.

#### 3. Mini Player Navigation
- **Description**: The mini player’s album art and track title are now interactive. Clicking either will open the corresponding full release information panel.
- **Impact**: Offers quick access to detailed information about the currently playing track, streamlining the transition from listening to exploring.

#### 4. Intelligent Playback Resumption
- **Description**: The audio playback system prevents unnecessary restarts. If a user attempts to play a track that is already active, playback continues seamlessly from its current position.
- **Impact**: Ensures a smoother, uninterrupted listening experience, enhancing user satisfaction with audio controls.

## 4. Component Library

- **Header:** A "sticky" header that is always visible.
- **Hero Section:** A full-viewport introduction featuring the main logo, a tagline, and a CTA.
- **Music Section:** A grid of "featured" releases.
- **About Section:** A two-column layout on desktop featuring an artist photo and the main biography.
- **Collaborations Section:** A grid of circular portraits for each collaborator.
- **Footer:** Contains global links to streaming platforms and social media.
- **Mini Audio Player:** A persistent player that appears at the bottom of the screen when a track is played.
- **Side Panel:** A single, reusable component that slides in from the right.

## 5. Responsive Design

A **mobile-first** approach is strictly enforced. All styles in `style.css` are written for mobile by default and then enhanced for larger screens via a `@media (min-width: 768px)` query at the bottom.

## 6. Performance Optimization

- **Image Lazy Loading:** Implemented for off-screen images to improve initial page load time.
- **Image Optimization:** All `.jpg` and `.png` files are compressed for the web.
- **Debouncing:** Used for the `timeupdate` event on the audio player to limit the frequency of DOM updates.
- **Intersection Observer:** Pauses the CPU-intensive CSS animation on the hero background when the hero section is not in the viewport.

## 7. Accessibility (a11y)

- **Skip Link:** A "Skip to main content" link is provided for keyboard users.
- **ARIA Roles & Attributes:** Used extensively to communicate the state and function of UI elements to assistive technologies.
- **Focus Management:** A JavaScript-based focus trap is implemented for the side panel.

## 8. Content Maintenance

All dynamic content is managed from data arrays in the `/data` directory. To add or update content, you should only need to modify files within this directory.

## 9. Development Roadmap

- **The Fuerteventura Surf Map:** Implemented in Version 1.6.0, this feature provides an interactive map of Fuerteventura's surf spots with detailed information and filtering capabilities.
- **"Behind the Music" Content:** Extend the `releases` data object to include a `story` property.

## 10. Brand Identity

The brand identity is built around the "Tropical Noir" concept, with a dark, moody aesthetic punctuated by vibrant accent colors. The logo and typography choices reflect this fusion of opposites.
