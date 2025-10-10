# La Sonora Volcánica - Official Website

This repository contains the source code for the official website of La Sonora Volcánica, a musical project by Frédéric Guigand. The site is a modern, single-page application designed to showcase the artist's music, stories, and collaborations.

## Website Purpose and Capabilities

This website serves as the official digital presence for the musical artist "La Sonora Volcánica." It is a single-page application (SPA) designed to be an immersive, content-rich experience for fans. The primary objectives are to showcase the artist's music, provide biographical and collaborative context, facilitate discovery of the full discography, and serve as a central hub for all official streaming and contact links. The application is architected to be highly dynamic and easily updatable by modifying a central data source, without requiring direct manipulation of the DOM structure in the HTML.

## Workflows

### Content Management

All content is managed through a structured set of JavaScript modules located in the `/data` directory. This approach allows for content changes to be made without touching the main application script, streamlining the development workflow.

- **Releases**: To add a new single or album, open `data/releases/release-data.js` and add a new object to the `releaseData` array.
- **Lyrics**: To add lyrics for a release, open `data/content/release-lyrics.js` and add a new entry.
- **Audio Assets**: Audio files are stored in the `audio/` directory and referenced in `data/releases/release-data.js`.
- **Text Content**: Stories and biographies are managed in `data/content/release-stories.js` and `data/content/collaborator-bios.js`.
- **Collaborators**: To add a new collaborator, open `data/collaborators/collaborator-data.js` and add a new object to the `collaboratorData` array.
- **External Links**: Links to streaming platforms are managed in `data/config/platform-config.js` and `data/config/artist-data.js`.

For a detailed guide on how to add or modify content, please see the [**Developer Guide**](DEVELOPER_GUIDE.md).

## Technical Specifications

- **Audio Standards**: Audio files should be in AAC format at 256kbps.
- **Image Workflow**: Images should be optimized using a tool like [Squoosh](https://squoosh.app/) to ensure they are compressed for the web to reduce their file size without significant quality loss.

## Site Architecture

The application employs a **Component-based architecture** and a **data-driven, declarative rendering** pattern, implemented entirely in vanilla JavaScript. This approach mimics the core principles of modern front-end frameworks like React or Vue, but without the associated overhead. The architecture can be described as a custom, lightweight **Model-View-Controller (MVC)** or, more accurately, **Model-View-Update** pattern.

- **Model**: The "single source of truth" is a set of JavaScript objects and arrays located in the `/data` directory.
- **View**: The view is represented by the initial HTML structure in `index.html`.
- **Controller/Update Logic**: A collection of JavaScript functions in `script.js` serves as the controller and update mechanism.

### Smart Navigation System

The website includes an intelligent navigation history system that enhances user experience when navigating between panels:

- **Context-Aware Navigation**: Automatically tracks where users came from (discography, collaborator panels, or main screen)
- **Smart Return Navigation**: When closing release info panels, users are returned to their previous context
- **URL Parameter Tracking**: Uses `?returnTo=` parameters for navigation state management
- **Extensible Architecture**: Designed to accommodate future panels and navigation flows

For a more detailed overview of the architecture, see the [**Developer Guide**](DEVELOPER_GUIDE.md).

## Local Development

To run this project locally, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (which includes npm)
- [Python 3](https://www.python.org/downloads/) (for the local web server)

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

## Deployment

Deployment procedures for all environments are streamlined. The site is static and can be deployed to any static hosting provider.

## Maintenance and Troubleshooting

- **Maintenance**: Regularly update the data files in the `/data` directory to keep the content fresh.
- **Troubleshooting**: If you encounter issues, check the browser's developer console for errors. The `TEST_FUNCTIONS_ANALYSIS.md` document provides insights into the test functions available in `script.js` for debugging.

For more detailed maintenance and troubleshooting solutions, refer to the [**Developer Guide**](DEVELOPER_GUIDE.md).
