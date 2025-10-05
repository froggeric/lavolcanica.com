# La Sonora Volcánica - Official Website

This repository contains the source code for the official website of La Sonora Volcánica, a musical project by Frédéric Guigand. The site is a modern, single-page application designed to showcase the artist's music, stories, and collaborations.

## About This Project

This website has recently undergone a significant refactoring to a modular, data-driven architecture. The primary goal was to decouple the core application logic from the content (such as releases, collaborations, and translations), making the site easier to update and maintain.

All content is now managed through a structured set of JavaScript modules located in the `/data` directory. This approach allows for content changes to be made without touching the main application script, streamlining the development workflow.

For a detailed guide on how to add or modify content, please see the [**Developer Guide**](DEVELOPER_GUIDE.md).

## Features

-   **Modular Architecture:** Content is managed entirely through data modules, allowing for easy updates.
-   **Dynamic Content Loading:** The application dynamically loads music, stories, and collaborator information.
-   **Internationalization (i18n):** UI text is translated into multiple languages, with a simple system for adding new ones.
-   **Interactive Music Player:** An audio player provides a seamless listening experience.
-   **Responsive Design:** The layout is optimized for both desktop and mobile devices.

## Development Setup

To run this project locally, follow these steps:

### Prerequisites

-   [Node.js](https://nodejs.org/) (which includes npm)
-   [Python 3](https://www.python.org/downloads/) (for the local web server)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/lavolcanica.git
    cd lavolcanica
    ```

2.  **Install dependencies:**
    This project uses `eslint` for code linting and `jest` for testing.
    ```bash
    npm install
    ```

3.  **Run the local server:**
    The website is a static application but requires a server to handle module loading correctly. A simple Python HTTP server is recommended.
    ```bash
    python3 -m http.server 8000
    ```

4.  **Open in your browser:**
    Navigate to `http://localhost:8000` to view the website.

### Testing

The project includes a suite of tests to ensure data integrity and component functionality. To run the tests, use:

```bash
npm test
```

## Project Structure

The repository is organized as follows:

```
/
├── audio/                # Audio files for music tracks
├── data/                 # All application content (the heart of the new architecture)
│   ├── collaborators/    # Collaborator profiles and song mappings
│   ├── config/           # Application-level configuration
│   ├── content/          # Text content (bios, lyrics, stories)
│   ├── i18n/             # UI translations for different languages
│   └── releases/         # Music release metadata
├── images/               # All images (cover art, photos, logos)
├── scripts/              # Build or utility scripts
├── style.css             # Main stylesheet
├── script.js             # Core application logic
├── index.html            # Main HTML file
├── DEVELOPER_GUIDE.md    # In-depth guide for adding content
└── README.md             # This file
```

## How to Contribute

Contributions are welcome! If you want to add a feature, fix a bug, or update content, please follow the development setup and testing guidelines. For significant changes, please open an issue first to discuss your ideas.

All content updates should be made according to the [**Developer Guide**](DEVELOPER_GUIDE.md).

---
