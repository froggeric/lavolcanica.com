# Fuerteventura Surf Spots Data Structure Documentation

This document describes the JSON data structure used to store information about surf spots in Fuerteventura. The data is located in the [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json) file and serves as a comprehensive reference for anyone working with this data.

## 1. Overall Structure

The root of the JSON file is an object containing a single key, `spots`, which is an array of surf spot objects. Each object within this array represents a single surf spot and contains detailed information about it.

```json
{
  "spots": [
    {
      // Surf spot object 1
    },
    {
      // Surf spot object 2
    }
  ]
}
```

## 2. Surf Spot Object Fields

Each surf spot object has the following fields:

### `id` (String)
A unique identifier for the surf spot. This is typically a kebab-case version of the primary name, sanitized for URL and file system usage.
*   **Example:** `"acid-drop"`

### `primaryName` (String)
The most commonly used or official name of the surf spot.
*   **Example:** `"Acid Drop"`

### `alternativeNames` (Array of Strings)
An optional array of other names by which the surf spot is known. This helps with search and recognition.
*   **Example:** `["Bristol Shooting Gallery", "Shooting Gallery"]`

### `description` (String)
A comprehensive text description of the surf spot, including its characteristics, what makes it unique, and general information relevant to surfers.
*   **Example:** `"A powerful and exposed reef break near Majanicho, famous for its fast, hollow, and barreling waves..."`

### `location` (Object)
Contains geographical and administrative information about the surf spot.
*   **Fields:**
    *   `area` (String): The general region or coast where the spot is located (e.g., "North Shore", "West Coast").
    *   `nearestTowns` (Array of Strings): A list of nearby towns or villages.
    *   `coordinates` (Object):
        *   `lat` (Number): Latitude coordinate.
        *   `lng` (Number): Longitude coordinate.
        *   `accuracy` (String): Indicates the verification status of the coordinates (e.g., "verified", "unverified").
*   **Example:**
    ```json
    "location": {
      "area": "North Shore",
      "nearestTowns": ["Majanicho", "Corralejo"],
      "coordinates": {
        "lat": 28.7415,
        "lng": -13.9353
      }
    }
    ```

### `waveDetails` (Object)
Detailed information about the waves at the surf spot.
*   **Fields:**
    *   `type` (Array of Strings): The type of wave break (e.g., "Reef break", "Beach break", "Point break").
    *   `direction` (String): The primary direction the wave breaks (e.g., "Left", "Right", "Left and Right").
    *   `bestSwellDirection` (Array of Strings): Ideal swell directions for the spot (e.g., "NW", "W", "N").
    *   `bestWindDirection` (Array of Strings): Ideal wind directions for offshore conditions (e.g., "E", "SE", "S").
    *   `bestTide` (String): The best tide conditions for surfing (e.g., "Mid to High", "Low to Mid", "All Tides").
    *   `bestSeason` (Array of Strings): The best seasons or months for surfing the spot (e.g., "Winter", "Oct-Mar", "All Year").
    *   `idealConditions` (String): A descriptive summary of the optimal conditions for the spot.
    *   `abilityLevel` (Object):
        *   `primary` (String): The main ability level required (e.g., "Beginner", "Intermediate", "Expert").
        *   `alsoSuitableFor` (Array of Strings): Other ability levels that might find the spot suitable under certain conditions.
*   **Example:**
    ```json
    "waveDetails": {
      "type": ["Reef break"],
      "direction": "Right and Left",
      "bestSwellDirection": ["NW", "W"],
      "bestWindDirection": ["E", "SE", "S"],
      "bestTide": "Mid to High",
      "bestSeason": ["Jan", "Oct-Mar", "Winter"],
      "idealConditions": "Works best on a northwest or west swell with offshore winds from the east, southeast, or south. The waves are powerful and hollow, suitable for chest-high to overhead heights.",
      "abilityLevel": {
        "primary": "Expert",
        "alsoSuitableFor": []
      }
    }
    ```

### `characteristics` (Object)
Describes the general environment and potential challenges of the surf spot.
*   **Fields:**
    *   `crowdFactor` (String): Describes how crowded the spot typically is (e.g., "Can be uncrowded", "Crowded", "Very Low").
    *   `localVibe` (String): Information about the local atmosphere and community at the spot.
    *   `hazards` (Array of Strings): Potential dangers or difficulties (e.g., "Very shallow reef", "Strong currents", "Urchins").
    *   `bottom` (String): Description of the ocean floor (e.g., "Shallow volcanic reef", "Sand & Lava Reef", "Sand").
    *   `waterQuality` (String): General assessment of water cleanliness (e.g., "Clean").
*   **Example:**
    ```json
    "characteristics": {
      "crowdFactor": "Can be uncrowded but attracts experts when conditions are right",
      "localVibe": "Serious spot with a high presence of experienced surfers",
      "hazards": ["Very shallow reef", "Sharp rocks", "Strong currents"],
      "bottom": "Shallow volcanic reef",
      "waterQuality": "Clean"
    }
    ```

### `practicalities` (Object)
Information regarding access, facilities, and other practical aspects.
*   **Fields:**
    *   `access` (String): How to reach the surf spot.
    *   `parking` (String): Details about parking availability.
    *   `facilities` (String): Available amenities (e.g., "Lifeguard service", "None", "Bars, restaurants").
    *   `paddleOut` (String): Description of the paddle-out difficulty or technique.
    *   `recommendedBoards` (Array of Strings): Types of surfboards best suited for the spot.
    *   `additionalTips` (String, optional): Any extra advice or important notes.
*   **Example:**
    ```json
    "practicalities": {
      "access": "The spot is located near Majanicho. On big days, it can link up with the wave at Majanicho, creating a very long ride.",
      "parking": "Information missing from search results",
      "facilities": "Information missing from search results",
      "paddleOut": "Information missing from search results",
      "recommendedBoards": ["Shortboard", "Step-up"]
    }
    ```

## 3. Data Rules and Conventions

*   **Naming Conventions:**
    *   `id`: Kebab-case, derived from `primaryName`. Should be unique.
    *   `primaryName`: Title case for the main name.
    *   `alternativeNames`: Array of strings, can include variations or common nicknames.
*   **Coordinate Format:**
    *   `lat` and `lng` are decimal numbers representing latitude and longitude, respectively.
*   **Missing Information:**
    *   Fields where information is not available should explicitly state `"Information missing"` or `[]` for arrays. This helps to distinguish between a lack of data and a field not being applicable.
*   **Lists:**
    *   Arrays (e.g., `alternativeNames`, `nearestTowns`, `type`, `bestSwellDirection`, `bestWindDirection`, `bestSeason`, `hazards`, `recommendedBoards`) should contain strings.
*   **Descriptions:**
    *   All descriptions (`description`, `idealConditions`, `crowdFactor`, `localVibe`, `access`, `parking`, `facilities`, `paddleOut`, `additionalTips`) should be clear, concise, and informative text.

## 4. How to Add New Surf Spots

To add a new surf spot to the consolidated [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json) file, follow these steps:

1.  **Create a unique `id`**: Generate a unique kebab-case identifier for the new spot based on its primary name.
2.  **Gather information**: Collect all relevant details for each field described above. Ensure `location.coordinates.accuracy` is set to "verified" if the GPS coordinates have been precisely confirmed, or "unverified" otherwise.
3.  **Populate the object**: Create a new JSON object for the surf spot, ensuring all required fields are present. If a piece of information is genuinely unavailable, use `"Information missing"` or an empty array `[]`.
4.  **Maintain consistency**: Ensure that naming conventions, coordinate formats, and list structures are consistent with existing entries.
5.  **Insert into array**: Add the new surf spot object to the `spots` array in the [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json) file. Maintain alphabetical order by `primaryName` for easier management, if possible.
6.  **Validate JSON**: Before committing, ensure the JSON file remains valid.

## 5. Data Quality and Handling Missing Information

Maintaining high data quality is crucial for the utility of this dataset.

*   **Completeness**: Strive to fill in all fields for each surf spot. If information is truly unavailable after thorough research, explicitly mark it as `"Information missing"` or `[]`. Do not leave fields empty or null implicitly.
*   **Accuracy**: Verify all factual information, especially coordinates, wave details, and hazards. The `location.coordinates.accuracy` field should reflect the confidence in the GPS coordinates.
*   **Consistency**: Ensure that the format and type of data in each field are consistent across all entries. For example, `abilityLevel.primary` should always be one of the defined levels.
*   **"Information missing"**: This specific string value is used to denote data points that could not be found or are not applicable. This helps in programmatic handling and identification of gaps in the data.

## 6. Guidelines for Maintaining the Data Structure

*   **Regular Review**: Periodically review existing entries for accuracy and completeness. Surf spot characteristics can change over time (e.g., sandbanks shift, new hazards emerge).
*   **Standardized Updates**: When updating information, ensure that changes adhere to the defined data structure and conventions.
*   **Documentation Updates**: If the data structure itself changes (e.g., new fields are added or existing ones are modified), this documentation (`surf-spots-data-structure.md`) must be updated accordingly.
*   **Version Control**: All changes to the JSON data and this documentation should be managed through version control (e.g., Git) to track history and facilitate collaboration.