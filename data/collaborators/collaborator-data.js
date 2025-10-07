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
 * @property {string[]} releaseIds - Array of release IDs contributed by this collaborator.
 * @property {Object} role - Structured role information with primary and secondary roles.
 * @property {string} role.primary - Primary role of the collaborator.
 * @property {string[]} role.secondary - Secondary roles of the collaborator.
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
    releaseIds: ["tendido-cero-sentido"],
    role: {
      primary: "featured-artist",
      secondary: ["songwriter", "vocalist"]
    },
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
    releaseIds: ["tendido-cero-sentido"],
    role: {
      primary: "songwriter",
      secondary: ["conceptual-artist"]
    },
    tags: ["tattoo", "painter", "featured"]
  }
];