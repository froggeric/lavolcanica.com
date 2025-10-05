/**
 * @fileoverview Collaborator data for La Sonora Volcánica website.
 * Contains information about all collaborators who have contributed to the project.
 * @module data/collaborators/collaborator-data
 */

/**
 * @typedef {Object} Collaborator
 * @property {string} id - Unique identifier for the collaborator (used in URLs and data references).
 * @property {string} name - Name of the collaborator.
 * @property {string} photoSrc - Path to collaborator photo relative to root.
 * @property {string} link - Link to collaborator's external page (website, social media, etc.).
 * @property {Object} contentIds - IDs for related content in other data modules.
 * @property {string} contentIds.bio - ID for the bio content in collaborator-bios.js.
 * @property {string[]} songIds - Array of song IDs contributed by this collaborator (references in collaborator-songs.js).
 * @property {string[]} tags - Tags for filtering and searching (e.g., origin, genre, role).
 */

/**
 * Array of all collaborators.
 * To add a new collaborator, create a new object following the Collaborator type definition
 * and add it to this array.
 * @type {Collaborator[]}
 */
export const collaboratorData = [
  {
    id: "cututo",
    name: "Cututo",
    photoSrc: "images/collab-cututo.jpg",
    link: "https://open.spotify.com/artist/3jehqC1A1uGwGwOOtUWBSl?si=kruSiF6LSQmWiWxOdmJ3-w",
    contentIds: {
      bio: "cututo-bio"
    },
    songIds: ["tendido-cero-sentido"],
    tags: ["peru", "bolero", "queer", "featured"]
  },
  {
    id: "piero",
    name: "Piero Fava",
    photoSrc: "images/collab-piero.jpg",
    link: "https://www.instagram.com/pierofava",
    contentIds: {
      bio: "piero-bio"
    },
    songIds: ["tendido-cero-sentido"],
    tags: ["tattoo", "painter", "featured"]
  }
];