# Developer Guide

Welcome to the La Sonora Volcánica project! This guide is designed to help you understand the new modular architecture and how to add new content to the application. The primary goal of this refactoring is to separate the core application logic from the content, making it easier to manage and extend.

## Project Structure

The core of the new architecture is the `/data` directory. All application content, from music releases to language translations, is stored in this directory as JavaScript modules.

```
/data
├── collaborators/
│   ├── collaborator-data.js
│   └── collaborator-songs.js
├── config/
│   ├── app-config.js
│   └── platform-config.js
├── content/
│   ├── collaborator-bios.js
│   ├── release-lyrics.js
│   └── release-stories.js
├── i18n/
│   ├── en/
│   │   └── ui-translations.js
│   ├── es/
│   │   └── ui-translations.js
│   └── fr/
│       └── ui-translations.js
└── releases/
    ├── featured-releases.js
    └── release-data.js
```

**The guiding principle is simple: to add or update content, you should only need to modify files within the `/data` directory. The main `script.js` file should not be touched.**

---

## How to Add Content

### 1. Adding a New Release

To add a new single or album, open `data/releases/release-data.js` and add a new object to the `releaseData` array.

**File:** [`data/releases/release-data.js`](data/releases/release-data.js)

#### Release Schema:

Each release object must conform to the following structure:

| Field             | Type      | Description                                                 | Example                                  |
| ----------------- | --------- | ----------------------------------------------------------- | ---------------------------------------- |
| `id`              | `string`  | Unique identifier for the release (e.g., kebab-case title). | `"cumbia-del-barrio"`                    |
| `title`           | `string`  | The official title of the release.                          | `"Cumbia del Barrio"`                    |
| `year`            | `string`  | The year the music was released.                            | `"2025"`                                 |
| `type`            | `string`  | The type of release, either `"single"` or `"album"`.        | `"single"`                               |
| `coverArt`        | `string`  | The file path to the cover art image.                       | `"images/art-cumbia-del-barrio.jpg"`     |
| `audioSrc`        | `string`  | The file path to the audio file.                            | `"audio/single-cumbia-del-barrio.mp3"`   |
| `featured`        | `boolean` | If `true`, the release will appear on the homepage.         | `true`                                   |
| `links`           | `Object`  | An object containing links to streaming platforms.          | `{ "spotify": "#", "apple": "#" }`        |
| `contentIds`      | `Object`  | An object mapping to content in other data files.           | `{ "story": "cumbia-story" }`            |
| `visibleSections` | `string[]`| An array of sections to display (e.g., `story`, `lyrics`).  | `["story", "lyrics"]`                    |
| `tags`            | `string[]`| An array of tags for filtering and categorization.          | `["cumbia", "electro"]`                  |

**Example Entry:**
```javascript
{
  id: "new-release-title",
  title: "New Release Title",
  year: "2026",
  type: "single",
  coverArt: "images/art-new-release.jpg",
  audioSrc: "audio/single-new-release.mp3",
  featured: true,
  links: {
    spotify: "#",
    apple: "#",
    youtube: "#",
    bandcamp: "#"
  },
  contentIds: {
    story: "new-release-story",
    lyrics: "new-release-lyrics",
    gallery: "new-release-gallery"
  },
  visibleSections: ["story", "lyrics"],
  tags: ["cumbia", "new"]
}
```

### 2. Adding a New Collaborator

To add a new collaborator, open `data/collaborators/collaborator-data.js` and add a new object to the `collaboratorData` array.

**File:** [`data/collaborators/collaborator-data.js`](data/collaborators/collaborator-data.js)

#### Collaborator Schema:

| Field        | Type      | Description                                               | Example                               |
| ------------ | --------- | --------------------------------------------------------- | ------------------------------------- |
| `id`         | `string`  | Unique identifier for the collaborator.                   | `"cututo"`                            |
| `name`       | `string`  | The name of the collaborator.                             | `"Cututo"`                            |
| `photoSrc`   | `string`  | The file path to the collaborator's photo.                | `"images/collab-cututo.jpg"`          |
| `link`       | `string`  | A URL to the collaborator's website or social media.      | `"https://spotify.com/..."`           |
| `contentIds` | `Object`  | An object mapping to content (e.g., bio).                 | `{ "bio": "cututo-bio" }`             |
| `songIds`    | `string[]`| An array of `id`s from releases they contributed to.      | `["tendido-cero-sentido"]`            |
| `tags`       | `string[]`| An array of tags for filtering and categorization.        | `["peru", "bolero"]`                  |

**Example Entry:**
```javascript
{
  id: "new-artist",
  name: "New Artist",
  photoSrc: "images/collab-new-artist.jpg",
  link: "#",
  contentIds: {
    bio: "new-artist-bio"
  },
  songIds: ["new-release-title"],
  tags: ["producer", "featured"]
}
```

### 3. Adding a New Language

The application supports internationalization (i18n) for UI text. To add a new language, follow these steps:

1.  Create a new directory in `data/i18n/` using the two-letter language code (e.g., `de` for German).
2.  Inside this new directory, create a `ui-translations.js` file.
3.  Copy the contents of [`data/i18n/en/ui-translations.js`](data/i18n/en/ui-translations.js) and translate the values into the new language.

**File:** `data/i18n/{lang_code}/ui-translations.js`

#### UI Translations Schema:

The `uiTranslations` object is a simple key-value map where keys are stable identifiers and values are the translated strings.

**Example (`data/i18n/de/ui-translations.js`):**
```javascript
/**
 * German UI translations for La Sonora Volcánica
 */
export const uiTranslations = {
  logoText: "La Sonora Volcánica",
  navMusic: "Musik",
  navMap: "Surfkarte",
  navAbout: "Über",
  navCollabs: "Kollaborationen",
  // ... and so on
};
```

---

By following these guidelines, you can help us maintain a clean, scalable, and easy-to-manage codebase. Thank you for your contribution!