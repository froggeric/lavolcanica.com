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
    *   `area` (String): The general region where the spot is located. **Allowed values:** `"North"`, `"North East"`, `"East"`, `"South"`, `"West"`, `"Offshore"`.
    *   `nearestTowns` (Array of Strings): A list of nearby towns or villages.
    *   `coordinates` (Object):
        *   `lat` (Number): Latitude coordinate.
        *   `lng` (Number): Longitude coordinate.
        *   `accuracy` (String): Indicates the verification status of the coordinates. **Allowed values:** `"verified"`, `"unverified"`.
*   **Example:**
    ```json
    "location": {
      "area": "North",
      "nearestTowns": ["Majanicho", "Corralejo"],
      "coordinates": {
        "lat": 28.7415,
        "lng": -13.9353,
        "accuracy": "verified"
      }
    }
    ```

### `waveDetails` (Object)
Detailed information about the waves at the surf spot.
*   **Fields:**
    *   `type` (Array of Strings): The type of wave break. **Allowed values:** `"Reef Break"`, `"Beach Break"`, `"Point Break"`, `"Breakwater / Jetty"`.
    *   `direction` (Array of Strings): The directions the wave breaks. **Allowed values:** `"Right"`, `"Left"`, `"A-Frame"`.
    *   `directionNotes` (String, optional): Additional context about the wave's direction (e.g., "Rights are superior and longer").
    *   `bestSwellDirection` (Array of Strings): Ideal swell directions for the spot (e.g., "NW", "W", "N").
    *   `bestWindDirection` (Array of Strings): Ideal wind directions for offshore conditions (e.g., "E", "SE", "S").
    *   `bestTide` (Array of Strings): The best tide conditions for surfing. **Allowed values:** `"Low"`, `"Mid"`, `"High"`.
    *   `tideNotes` (String, optional): Additional context about the tide (e.g., "Best on a rising tide").
    *   `bestSeason` (Array of Strings): The best seasons for surfing the spot. **Allowed values:** `"Spring"`, `"Summer"`, `"Autumn"`, `"Winter"`.
        *   Note: Spring (Apr-Jun), Summer (Jul-Sep), Autumn (Oct-Dec), Winter (Jan-Mar).
    *   `idealConditions` (String): A descriptive summary of the optimal conditions for the spot.
    *   `abilityLevel` (Object):
        *   `primary` (String): The main ability level required. **Allowed values:** `"Beginner"`, `"Intermediate"`, `"Advanced"`, `"Expert"`.
        *   `alsoSuitableFor` (Array of Strings): Other ability levels that might find the spot suitable under certain conditions.
*   **Example:**
    ```json
    "waveDetails": {
      "type": ["Reef Break"],
      "direction": ["Right", "Left"],
      "directionNotes": "A-frame peak, but the rights are generally better.",
      "bestSwellDirection": ["NW", "W"],
      "bestWindDirection": ["E", "SE", "S"],
      "bestTide": ["Mid", "High"],
      "tideNotes": null,
      "bestSeason": ["Winter", "Autumn"],
      "idealConditions": "Works best on a northwest or west swell with offshore winds from the east, southeast, or south...",
      "abilityLevel": {
        "primary": "Expert",
        "alsoSuitableFor": []
      }
    }
    ```

### `characteristics` (Object)
Describes the general environment and potential challenges of the surf spot.
*   **Fields:**
    *   `crowdFactor` (String): A standardized rating of how crowded the spot typically is. **Allowed values:** `"Empty"`, `"Low"`, `"Medium"`, `"High"`, `"Crowded"`.
    *   `crowdNotes` (String, optional): Descriptive context about the crowd (e.g., "Attracts experts only when conditions are right").
    *   `localVibe` (String): Information about the local atmosphere and community at the spot.
    *   `hazards` (Array of Strings): Potential dangers or difficulties (e.g., "Very shallow reef", "Strong currents", "Urchins").
    *   `bottom` (Array of Strings): The types of ocean floor material present. **Allowed values:** `"Sand"`, `"Reef"`, `"Rock"`, `"Lava"`, `"Coral"`.
    *   `waterQuality` (String): General assessment of water cleanliness (e.g., "Clean").
*   **Example:**
    ```json
    "characteristics": {
      "crowdFactor": "Low",
      "crowdNotes": "Can be uncrowded but attracts experts when conditions are right.",
      "localVibe": "Serious spot with a high presence of experienced surfers",
      "hazards": ["Very shallow reef", "Sharp rocks", "Strong currents"],
      "bottom": ["Lava", "Reef"],
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
    *   `recommendedBoards` (Array of Strings): Types of surfboards best suited for the spot. **Allowed values include:** `"Shortboard"`, `"Funboard / Malibu"`, `"Longboard"`, `"Fish"`, `"Step-up"`, `"Gun"`, `"Beginner Board / Soft-top"`, `"SUP"`, `"Performance Board"`, `"Tow Board"`.
    *   `additionalTips` (String, optional): Any extra advice or important notes.
*   **Example:**
    ```json
    "practicalities": {
      "access": "The spot is located near Majanicho...",
      "parking": "Parking is available along the dirt track overlooking the break.",
      "facilities": null,
      "paddleOut": "Use the main channel to the right of the peak.",
      "recommendedBoards": ["Shortboard", "Step-up"]
    }
    ```

## 3. Data Rules and Conventions

*   **Naming Conventions:**
    *   `id`: Kebab-case, derived from `primaryName`. Should be unique.
    *   `primaryName`: Title case for the main name.
*   **Enumerations (Allowed Values):**
    *   Many fields now use a controlled vocabulary (a set of allowed string values). These are highlighted in **bold** in the descriptions above. Adhering to this vocabulary is essential for data consistency.
*   **Missing Information:**
    *   For fields where information is not available or not applicable, use the JSON standard `null` value. This is programmatically clear and distinguishes from an empty string `""` or an empty array `[]`.
*   **Optional Fields:**
    *   Fields marked as `(optional)` can be omitted from the object entirely if no information is available. However, using `null` is preferred for consistency.

## 4. How to Add New Surf Spots

To add a new surf spot to the consolidated [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json) file, follow these steps:

1.  **Create a unique `id`**: Generate a unique kebab-case identifier for the new spot based on its primary name.
2.  **Gather information**: Collect all relevant details, adhering to the standardized values for fields like `area`, `type`, `direction`, `bestTide`, `crowdFactor`, etc.
3.  **Populate the object**: Create a new JSON object for the surf spot. For any information that is genuinely unavailable, use the `null` value.
4.  **Maintain consistency**: Ensure that all standardized fields use only the allowed values listed in this documentation.
5.  **Insert into array**: Add the new surf spot object to the `spots` array in the [`data/fuerteventura-surf-spots.json`](data/fuerteventura-surf-spots.json) file.
6.  **Validate JSON**: Before committing, ensure the JSON file remains valid.

## 5. Data Quality and Handling Missing Information

Maintaining high data quality is crucial for the utility of this dataset.

*   **Completeness**: Strive to fill in all fields. If information is truly unavailable after thorough research, use `null`.
*   **Accuracy**: Verify all factual information, especially coordinates, wave details, and hazards.
*   **Consistency**: Strictly use the predefined allowed values for standardized fields. This is the most important rule for maintaining a queryable database.
*   **Use of `null`**: The `null` value is the standard way to represent the absence of data. It is distinct from an empty array `[]` (which means "there are no items in this list") or an empty string `""` (which is a valid string of zero length). Using `null` correctly is key to programmatic handling of the data.

## 6. Guidelines for Maintaining the Data Structure

*   **Regular Review**: Periodically review existing entries for accuracy and completeness.
*   **Standardized Updates**: When updating information, ensure that changes adhere to the defined data structure and conventions.
*   **Documentation Updates**: If the data structure itself changes (e.g., new fields are added or existing ones are modified), this documentation (`surf-spots-data-structure.md`) must be updated accordingly.
*   **Version Control**: All changes to the JSON data and this documentation should be managed through version control (e.g., Git) to track history and facilitate collaboration.