## **La Sonora Volcánica: Website Design & Development Handover Guide**

**Project:** Official Website for the music artist "La Sonora Volcánica"
**Version:** 1.0 (Completion of core sections)
**Stack:** Vanilla HTML, CSS, and JavaScript (No libraries or frameworks)

### **1. Core Philosophy & Design System**

This section outlines the foundational creative and visual principles that govern the entire website. Adhering to these principles is key to maintaining a cohesive and impactful user experience.

#### **1.1. Core Concept: "Tropical Noir"**

The entire aesthetic is built on this concept. It's a fusion of opposites, reflecting the artist's music:

*   **Tropical:** Vibrant, energetic, natural, referencing Latin American culture, cumbia, and the Canary Islands.
*   **Noir:** Moody, atmospheric, dark, mysterious, and cinematic, referencing the "volcanic" energy and the soulful depth of genres like bolero and tango.

Practically, this translates to a dark-themed UI where vibrant accent colors and high-quality imagery can truly stand out.

#### **1.2. Color Palette**

The palette is defined as CSS variables in the `:root` of `style.css` for easy maintenance.

| Name | Variable | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| Volcanic Night | `--bg-volcanic-night` | `#1a1a1a` | Primary site background. |
| Salt Crystal | `--text-salt-crystal` | `#F0F0F0` | Main text, UI elements, icons. |
| Lava Glow | `--accent-lava-glow` | `#FF4D4D` | Primary CTAs, active states, highlights. |
| Canary Teal | `--accent-canary-teal`| `#00C2A8` | Secondary highlights, icon hover states. |

#### **1.3. Typography**

Fonts are sourced from Google Fonts and are declared in `style.css`.

*   **Headings:** **Montserrat** (Weights: 700, 900)
    *   **Rationale:** Modern, strong, geometric. Provides a powerful and clean presence for titles and headlines. Excellent multilingual support.
    *   **Variable:** `--font-heading`

*   **Body Text:** **Roboto** (Weight: 400)
    *   **Rationale:** Extremely legible and clean, ensuring a comfortable reading experience for longer bios. Pairs perfectly with Montserrat.
    *   **Variable:** `--font-body`

#### **1.4. Iconography**

*   **System:** A single, efficient SVG sprite is defined at the top of `index.html`. Icons are used throughout the site with the `<svg class="icon"><use href="#icon-id"></use></svg>` syntax.
*   **Sources:** New icons should be sourced from reliable providers like [Bootstrap Icons](https://icons.getbootstrap.com) or [SVG Repo](https://www.svgrepo.com/) to maintain quality.
*   **Adding a New Icon:**
    1.  Get the SVG code for the new icon.
    2.  Create a new `<symbol>` element within the main `<svg>` block in `index.html`.
    3.  Give it a unique `id` (e.g., `id="icon-new-icon"`).
    4.  Paste the SVG's `path` data inside the `<symbol>`.
    5.  It can now be used anywhere with `<use href="#icon-new-icon">`.

---

### **2. Website Architecture & Layout**

The site is designed as a dynamic, single-page application that feels both immersive and easy to navigate.

#### **2.1. Overall Approach**

*   **Mobile-First:** All styles in `style.css` are written for mobile by default and then enhanced for larger screens via a `@media (min-width: 768px)` query at the bottom. **All new development must follow this pattern.**
*   **File Structure:** The project is self-contained in a single folder.
    ```
    project-folder/
    ├── audio/
    │   └── song.mp3
    ├── images/
    │   └── picture.jpg
    ├── index.html
    ├── script.js
    └── style.css
    ```

#### **2.2. Component Breakdown**

*   **Header:** A "sticky" header that is always visible. It contains the logo, main navigation, and language switcher. On mobile, the navigation collapses into a full-screen overlay menu triggered by the hamburger icon.
*   **Hero Section:** A full-viewport introduction featuring the main logo, a tagline, and a CTA, set against an atmospheric, slow-zooming background image.
*   **Music Section:** A grid of "featured" releases. Hovering reveals streaming links. A CTA button opens a side panel with the full discography.
*   **About Section:** A two-column layout on desktop (stacking on mobile) featuring an artist photo and the main biography. The title is centered above this grid for consistency.
*   **Collaborations Section:** A grid of circular portraits for each collaborator. Clicking a card opens the same side panel, dynamically populated with that artist's details.
*   **Footer:** Contains global links to streaming platforms and social media, an email contact, and copyright info. All icons feature CSS-based tooltips for clarity.
*   **Mini Audio Player:** A persistent player that appears at the bottom of the screen when a track is played. It remains visible and functional while the user scrolls or opens the side panel.
*   **Side Panel:** A single, reusable component that slides in from the right. It is used to display both the "Full Discography" and the "Collaborator Details," with its content being dynamically generated by JavaScript.

---

### **3. Technical Implementation & Maintenance Guide**

The site is built to be easily updated without deep coding knowledge. All dynamic content is managed from data arrays in `script.js`.

#### **3.1. JavaScript: The "Single Source of Truth"**

The entire script is wrapped in an IIFE `(function() { ... })();` to prevent polluting the global namespace. All user-editable content is located in data arrays at the top of the file.

*   **To Add a New Release:**
    1.  Open `script.js`.
    2.  In the `releases` array, add a new JavaScript object to the beginning of the array.
    3.  Fill in the `title`, `year`, `coverArt` path, `audioSrc` path, and all the `links`.
    4.  Set `featured: true` if you want it to appear on the main homepage grid.

*   **To Add a New Collaborator:**
    1.  Open `script.js`.
    2.  In the `collaborators` array, add a new object to the end of the array.
    3.  Fill in all the required fields: `id` (a unique lowercase name), `name`, `photoSrc`, `link`, and the full `song` object. The `song` object should mirror the structure of a release object.
    4.  Fill in the `bio` object with the text for all three languages (`en`, `es`, `fr`). Use `\n\n` to create paragraph breaks.
    5.  The website will automatically create the card and the side panel functionality.

#### **3.2. Multilingual System**

*   **Mechanism:** Text elements in the HTML have a `data-key` attribute (e.g., `<h2 data-key="musicTitle">`). The `translations` object in `script.js` contains a dictionary for each language. The `updateContent()` function finds all `data-key` elements and replaces their text with the corresponding string from the active language's dictionary.
*   **To Add a New Translatable String:**
    1.  In `index.html`, add the `data-key="newKeyName"` to your element and leave it empty.
    2.  In `script.js`, inside the `translations` object, add the key-value pair (`newKeyName: "Translated Text"`) to each of the `en`, `es`, and `fr` language objects.

---

### **4. Future Plans & Possible Extensions**

This site provides a solid foundation. Here are the logical next steps and potential future features:

1.  **The Fuerteventura Surf Map:**
    *   This is the next major planned feature.
    *   **Recommended Approach:** Create a custom, stylized SVG map of the island (not a Google Maps embed) for brand consistency. Make specific surf spots (`<path>` or `<circle>` elements within the SVG) interactive. Clicking a spot could open the side panel, populated with details about the surf spot and a link to its dedicated track in the mini-player.

2.  **"Behind the Music" Content:**
    *   The `releases` data object could be extended to include a `story` property.
    *   A "Read More" button could be added to the discography list items, which would open the side panel to display the album art, lyrics, and the story behind the song or album.

3.  **Performance Optimization:**
    *   **Image Lazy Loading:** For pages with many images, implement lazy loading for album covers and photos that are off-screen to improve initial page load time. This can be done with vanilla JavaScript and the Intersection Observer API.
    *   **Image Optimization:** Ensure all `.jpg` and `.png` files are compressed for the web to reduce their file size without significant quality loss.
