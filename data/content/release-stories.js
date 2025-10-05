/**
 * @fileoverview Release stories for La Sonora Volcánica website.
 * Contains story content for all releases in multiple languages.
 * @module data/content/release-stories
 */

/**
 * @typedef {Object} StoryContent
 * @property {string} en - English version of the story.
 * @property {string} es - Spanish version of the story.
 * @property {string} fr - French version of the story.
 */

/**
 * Object containing all release stories.
 * Each key corresponds to a content ID in the release data.
 * Each value is an object with translations for different languages.
 * To add a new story, create a new entry with a unique ID and add translations for all supported languages.
 * @type {Object.<string, StoryContent>}
 */
export const releaseStories = {
  "cumbia-del-barrio-story": {
    en: "Born from the late-night energy of a bustling neighborhood, 'Cumbia del Barrio' is a tribute to the streets. The rhythm is a heartbeat, the melody a conversation between friends under a dim streetlight. It's the sound of community, of shared stories, of the simple joy of being together.",
    es: "Nacida de la energía nocturna de un barrio bullicioso, 'Cumbia del Barrio' es un tributo a las calles. El ritmo es un latido del corazón, la melodía una conversación entre amigos bajo una tenue luz de farola. Es el sonido de la comunidad, de historias compartidas, de la simple alegría de estar juntos.",
    fr: "Née de l'énergie nocturne d'un quartier animé, 'Cumbia del Barrio' est un hommage aux rues. Le rythme est un battement de cœur, la mélodie une conversation entre amis sous la lueur tamisée d'un réverbère. C'est le son de la communauté, des histoires partagées, de la simple joie d'être ensemble."
  },
  "sol-sol-story": {
    en: "An electrocumbia fever dream, 'Sol Sol' is an invocation to the sun. It captures the relentless, vibrant energy of a day on the island, from the first light of dawn to the final, fiery sunset. It's a track built for movement, for dancing, for losing yourself in the heat of the moment.",
    es: "Un sueño febril de electrocumbia, 'Sol Sol' es una invocación al sol. Captura la energía implacable y vibrante de un día en la isla, desde la primera luz del alba hasta el final, un atardecer ardiente. Es un tema construido para el movimiento, para bailar, para perderse en el calor del momento.",
    fr: "Un rêve fiévreux d'électrocumbia, 'Sol Sol' est une invocation au soleil. Il capture l'énergie implacable et vibrante d'une journée sur l'île, de la première lueur de l'aube au coucher de soleil final et ardent. C'est une piste construite pour le mouvement, pour la danse, pour se perdre dans la chaleur du moment."
  },
  "tendido-cero-sentido-story": {
    en: "In the silent, suffocating darkness of the pandemic, Piero, a painter and tattoo artist, looked to the stars and found a reflection of a noble beast in the cosmos—Taurus. This vision clashed with the cruel reality of the bullfighting ring, sparking a primal scream against the spectacle of slaughter. 'Tendido Cero Sentido' is a midnight confession, a hymn to the sacredness of life, and a raw testament to the belief that suffering can never be art.",
    es: "En la oscuridad silenciosa y sofocante de la pandemia, Piero, un pintor y tatuador, miró a las estrellas y encontró un reflejo de una bestia noble en el cosmos—Tauro. Esta visión chocó con la cruel realidad de la plaza de toros, encendiendo un grito primordial contra el espectáculo de la matanza. 'Tendido Cero Sentido' es una confesión medianoche, un himno a la sacralidad de la vida, y un testimonio crudo de la creencia de que el sufrimiento nunca puede ser arte.",
    fr: "Dans l'obscurité silencieuse et étouffante de la pandémie, Piero, un peintre et artiste tatoueur, a regardé les étoiles et a trouvé le reflet d'une bête noble dans le cosmos—Taureau. Cette vision s'est heurtée à la cruelle réalité de l'arène, déclenchant un cri primordial contre le spectacle de l'abattage. 'Tendido Cero Sentido' est une confession de minuit, un hymne à la sacralité de la vie, et un témoignage brut de la croyance que la souffrance ne peut jamais être un art."
  }
};