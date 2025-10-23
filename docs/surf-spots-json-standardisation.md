# Technical Documentation: Surf Spots JSON Data Structure Refactoring

## 1. Objective

This document outlines the technical specifications for refactoring the `fuerteventura-surf-spots.json` data file. The primary goal is to transition from a semi-structured, text-heavy format to a fully structured, normalized, and machine-readable schema. This will enable robust programmatic access, filtering, and data validation.

This document serves as the specification for any automated script or agent tasked with migrating the data to the new format.

## 2. Summary of Changes

The refactoring process involves the following key transformations:

1.  **Enumeration Standardization**: Fields with a finite set of possible values (e.g., `area`, `type`, `abilityLevel`) have been converted to use a strict, controlled vocabulary.
2.  **Structural Refactoring**: Fields containing complex, compound information (e.g., `direction`, `bestTide`, `crowdFactor`) have been split into multiple, atomic fields. This typically involves an array for enumerable values and an optional string field for qualitative notes.
3.  **Data Type Conversion**: Fields representing a list of attributes (e.g., `bottom`) have been converted from a single string to an array of strings.
4.  **Null Value Handling**: Inconsistent string representations of missing data (e.g., `"Information missing"`) are replaced with the JSON standard `null` value.

## 3. New Schema Definition (Target State)

The target structure for each surf spot object is as follows:

```yaml
id: string (kebab-case, unique)
primaryName: string
alternativeNames: string[]
description: string
location:
  area: string (enum)
  nearestTowns: string[]
  coordinates:
    lat: number
    lng: number
    accuracy: string (enum: "verified", "unverified")
waveDetails:
  type: string[] (enum)
  direction: string[] (enum)
  directionNotes: string | null
  bestSwellDirection: string[]
  bestWindDirection: string[]
  bestTide: string[] (enum)
  tideNotes: string | null
  bestSeason: string[] (enum)
  idealConditions: string
  abilityLevel:
    primary: string (enum)
    alsoSuitableFor: string[] (enum)
characteristics:
  crowdFactor: string (enum)
  crowdNotes: string | null
  localVibe: string | null
  hazards: string[]
  bottom: string[] (enum)
  waterQuality: string | null
practicalities:
  access: string | null
  parking: string | null
  facilities: string | null
  paddleOut: string | null
  recommendedBoards: string[] (enum)
  additionalTips: string | null
```

## 4. Detailed Field-by-Field Migration Specification

### 4.1. `location.area`
-   **Change**: Standardize to a controlled vocabulary.
-   **Before**: Free text, e.g., `"North Shore"`, `"West Coast (La Pared)"`, `"North East Coast (Corralejo Natural Park)"`.
-   **After**: A single enum value.
-   **Allowed Values**: `["North", "North East", "East", "South", "West", "North West", "Offshore"]`
-   **Migration Logic**: Map existing values to the new enum. Extract the primary region and discard parenthetical details. E.g., `"West Coast (La Pared)"` -> `"West"`.

### 4.2. `waveDetails.type`
-   **Change**: Consolidate and standardize values.
-   **Before**: `["Reef break", "Point break", "Breakwater", "Jetty"]`
-   **After**: `["Reef Break", "Point Break", "Breakwater / Jetty"]` (Title Case)
-   **Allowed Values**: `["Reef Break", "Beach Break", "Point Break", "Breakwater / Jetty"]`
-   **Migration Logic**: Map old values to new, title-cased values. Combine `"Breakwater"` and `"Jetty"` into `"Breakwater / Jetty"`.

### 4.3. `waveDetails.direction`
-   **Change**: Refactor from a single string into a structured array and an optional notes field.
-   **Before**: `"Right and Left (A-frame, rights are superior)"`
-   **After**:
    ```json
    "direction": ["Right", "Left", "A-Frame"],
    "directionNotes": "Rights are superior"
    ```
-   **New Fields**:
    -   `direction`: `string[]`
    -   `directionNotes`: `string | null`
-   **Allowed Values (`direction`)**: `["Right", "Left", "A-Frame"]`
-   **Migration Logic**:
    1.  Parse the original string for keywords "Right", "Left", "A-frame". Add matches to the `direction` array.
    2.  Extract parenthetical or descriptive text and place it in `directionNotes`. If no such text exists, set `directionNotes` to `null`.

### 4.4. `waveDetails.bestTide`
-   **Change**: Refactor from a single string to a structured array and an optional notes field.
-   **Before**: `"All Tides (character changes with tide)"`
-   **After**:
    ```json
    "bestTide": ["Low", "Mid", "High"],
    "tideNotes": "Character changes with tide"
    ```
-   **New Fields**:
    -   `bestTide`: `string[]`
    -   `tideNotes`: `string | null`
-   **Allowed Values (`bestTide`)**: `["Low", "Mid", "High"]`
-   **Migration Logic**:
    1.  Parse the original string for keywords "Low", "Mid", "High", "All".
    2.  If "All" is present, populate `bestTide` with all three allowed values. Otherwise, add the keywords found.
    3.  Extract parenthetical text into `tideNotes`.

### 4.5. `waveDetails.bestSeason`
-   **Change**: Standardize to four distinct seasons.
-   **Before**: `["Oct-Mar", "Winter", "All Year", "November"]`
-   **After**: `["Autumn", "Winter"]`
-   **Allowed Values**: `["Spring", "Summer", "Autumn", "Winter"]`
-   **Season Definitions**:
    -   `Autumn`: Oct, Nov, Dec
    -   `Winter`: Jan, Feb, Mar
    -   `Spring`: Apr, May, Jun
    -   `Summer`: Jul, Aug, Sep
-   **Migration Logic**: Map old values based on the definitions above.
    -   `"All Year"` -> `["Spring", "Summer", "Autumn", "Winter"]`
    -   `"Winter"`, `"Jan"`, `"February"`, `"March"` -> `["Winter"]`
    -   `"Autumn"`, `"October"`, `"November"`, `"December"` -> `["Autumn"]`
    -   `"Oct-Mar"` -> `["Autumn", "Winter"]`
    -   `"Apr-Sep"` -> `["Spring", "Summer"]`
    -   Apply similar logic for other month/range combinations.

### 4.6. `waveDetails.abilityLevel`
-   **Change**: Standardize the vocabulary for `primary` and `alsoSuitableFor`.
-   **Before**: `"Experienced"`, `"All levels"`, `"All Surfers"`.
-   **After**: `"Advanced"`, `"Beginner"`.
-   **Allowed Values**: `["Beginner", "Intermediate", "Advanced", "Expert"]`
-   **Migration Logic**:
    -   Map `"Experienced"` to `"Advanced"`.
    -   Map `"All levels"` / `"All Surfers"` to `primary: "Beginner"`, `alsoSuitableFor: ["Intermediate", "Advanced"]` (or adjust based on context).

### 4.7. `characteristics.crowdFactor`
-   **Change**: Refactor from a descriptive string to a 5-point scale enum and an optional notes field.
-   **Before**: `"Can be uncrowded but attracts experts when conditions are right"`
-   **After**:
    ```json
    "crowdFactor": "Low",
    "crowdNotes": "Attracts experts when conditions are right"
    ```
-   **New Fields**:
    -   `crowdFactor`: `string` (enum)
    -   `crowdNotes`: `string | null`
-   **Allowed Values (`crowdFactor`)**: `["Empty", "Low", "Medium", "High", "Crowded"]`
-   **Migration Logic**:
    -   Map existing text to the enum based on keywords:
        -   `"Empty"` -> `"Empty"`
        -   `"Few Surfers"`, `"Rarely crowded"`, `"Uncrowded"` -> `"Low"`
        -   `"Sometimes crowded"`, `"Popular"` -> `"Medium"`
        -   `"Often Crowded"`, `"Can get very crowded"` -> `"High"`
        -   `"Crowded (Can get mobbed)"`, `"Very Crowded"` -> `"Crowded"`
    -   The original string, minus the keywords used for mapping, can populate `crowdNotes`.

### 4.8. `characteristics.bottom`
-   **Change**: Convert from a descriptive string to an array of standardized tags.
-   **Before**: `"Lava reef, Corals, Sharp Rocks"`
-   **After**: `["Lava", "Reef", "Coral", "Rock"]`
-   **Allowed Values**: `["Sand", "Reef", "Rock", "Lava", "Coral"]`
-   **Migration Logic**: Tokenize the original string, matching against the allowed values list.

### 4.9. `practicalities.recommendedBoards`
-   **Change**: Standardize and consolidate board types.
-   **Before**: `["Funboard", "Malibu", "Gun (on bigger days)"]`
-   **After**: `["Funboard / Malibu", "Gun"]`
-   **Allowed Values**: `["Shortboard", "Funboard / Malibu", "Longboard", "Fish", "Step-up", "Gun", "Beginner Board / Soft-top", "SUP", "Performance Board", "Tow Board"]`
-   **Migration Logic**: Map existing names to the new list. Consolidate synonyms (e.g., "Malibu"). Remove parenthetical context.

### 4.10. Handling of Missing Information
-   **Change**: Replace all instances of informational strings with `null`.
-   **Before**: `"parking": "Information missing from search results"`
-   **After**: `"parking": null`
-   **Migration Logic**: Perform a find-and-replace for strings containing `"Information missing"` across all relevant fields (`parking`, `facilities`, `localVibe`, `paddleOut`, etc.) and substitute with `null`.
