/**
 * @fileoverview Release lyrics for La Sonora Volcánica website.
 * Contains lyrics content for all releases in multiple languages.
 * @module data/content/release-lyrics
 */

/**
 * @typedef {Object} LyricsContent
 * @property {string} en - English version of the lyrics.
 * @property {string} es - Spanish version of the lyrics.
 * @property {string} fr - French version of the lyrics.
 */

/**
 * Object containing all release lyrics.
 * Each key corresponds to a content ID in the release data.
 * Each value is an object with translations for different languages.
 * To add new lyrics, create a new entry with a unique ID and add translations for all supported languages.
 * @type {Object.<string, LyricsContent>}
 */
export const releaseLyrics = {
  "cumbia-del-barrio-lyrics": {
    en: "(Chorus)\nIn the neighborhood, the cumbia sounds,\nWe dance until the full moon.\nWith the rhythm that keeps us united,\nThis is our town, our destiny.\n\n(Verse 1)\nShadows dance on the wall,\nThe drums sound, there's nothing to fear.\nFrom the corner to the end,\nA single rhythm, a single ritual.",
    es: "(Coro)\nEn el barrio, la cumbia suena,\nBailamos hasta la luna llena.\nCon el ritmo que nos mantiene unidos,\nEste es nuestro pueblo, nuestro destino.\n\n(Verso 1)\nLas sombras bailan en la pared,\nLos tambores suenan, no hay que temer.\nDesde la esquina hasta el final,\nUn solo ritmo, un solo ritual.",
    fr: "(Refrain)\nDans le quartier, la cumbia résonne,\nNous dansons jusqu'à la pleine lune.\nAvec le rythme qui nous unit,\nC'est notre ville, notre destin.\n\n(Verset 1)\nLes ombres dansent sur le mur,\nLes tambours résonnent, n'ayez crainte.\nDu coin à la fin,\nUn seul rythme, un seul rituel."
  },
  "sol-sol-lyrics": {
    en: "(Chorus)\nSol sol, warm my skin,\nWith your light, there's no night in my being.\nSol sol, we dance in the sand,\nUnder your sky, without end.\n\n(Verse 1)\nThe sand awakens, the sea breeze,\nA distant echo, makes me sigh.\nThe pulse of the rhythm, life in the flower,\nYou are the center, my great love.",
    es: "(Coro)\nSol sol, calienta mi piel,\nCon tu luz, no hay noche en mi ser.\nSol sol, danzamos en el areal,\nBajo tu cielo, sin final.\n\n(Verso 1)\nDespierta la arena, la brisa del mar,\nUn eco lejano, me hace suspirar.\nEl ritmo del pulso, la vida en la flor,\nTú eres el centro, mi gran amor.",
    fr: "(Refrain)\nSol sol, réchauffe ma peau,\nAvec ta lumière, pas de nuit en mon être.\nSol sol, nous dansons dans le sable,\nSous ton ciel, sans fin.\n\n(Verset 1)\nLe sable s'éveille, la brise de mer,\nUn écho lointain, me fait soupirer.\nLe pouls du rythme, la vie dans la fleur,\nTu es le centre, mon grand amour."
  },
  "tendido-cero-sentido-lyrics": {
    en: "Taurus, burning in the sky so far,\nA sacred bull, a guiding star.\nBut down on Earth, a cruel display,\nThey steal your light and turn your day to gray.\n\nTendido Cero, senseless pain,\nA fallen hero in the dust and rain.\nYour noble heart, a silent plea,\nThis is not art, it's cruelty.",
    es: "Tauro, ardiendo en el cielo tan lejano,\nUn toro sagrado, una estrella guía.\nPero en la Tierra, una exhibición cruel,\nRoban tu luz y convierten tu día en gris.\n\nTendido Cero, dolor sin sentido,\nUn héroe caído en el polvo y la lluvia.\nTu corazón noble, una plegaria silenciosa,\nEsto no es arte, es crueldad.",
    fr: "Taureau, brûlant dans le ciel si lointain,\nUn taureau sacré, une étoile guide.\nMais sur Terre, une exhibition cruelle,\nIls volent ta lumière et transforment ton jour en gris.\n\nTendido Cero, douleur insensée,\nUn héros tombé dans la poussière et la pluie.\nTon cœur noble, une prière silencieuse,\nCe n'est pas de l'art, c'est de la cruauté."
  }
};