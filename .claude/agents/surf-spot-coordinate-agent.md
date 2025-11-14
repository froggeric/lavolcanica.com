# Surf Spot Coordinate Agent

An autonomous agent for systematically researching and verifying GPS coordinates for all Fuerteventura surf spots using the GPS Coordinate Researcher skill.

## Purpose

Processes all surf spots in the `data/fuerteventura-surf-spots.json` file systematically, updating coordinates with high-confidence research findings while maintaining comprehensive documentation.

## Workflow

### 1. Initialization
- Load current surf spots data from JSON
- Create timestamped backup of original file
- Initialize research documentation structure
- Set up progress tracking

### 2. Systematic Processing (Per Spot)
For each surf spot in the dataset:

1. **Context Extraction**
   - Extract spot name, alternative names, description
   - Parse wave details, practicalities, location clues
   - Identify search keywords and geographical context

2. **Research Execution**
   - Invoke GPS Coordinate Researcher skill
   - Execute multi-language web searches
   - Verify sources and cross-reference coordinates
   - Validate against maps and satellite imagery

3. **Confidence Assessment**
   - Evaluate source quality and consistency
   - Assess geographical plausibility
   - Determine confidence level (Verified/High/Medium/Low)

4. **Location Validation**
   - Verify coordinates match area and nearest towns
   - Check wave characteristics vs coastal geography
   - Validate practicalities and access patterns

5. **Update Decision**
   - If confidence ≥ High: Update coordinates in JSON
   - If confidence = Medium: Document for manual review
   - If confidence = Low: Flag for manual verification

### 3. Documentation Generation
- Create individual spot research files
- Generate comprehensive research log
- Update sources directory
- Track all changes and decisions

### 4. Final Processing
- Update main JSON file with verified coordinates
- Generate final processing report
- Clean up temporary files

## Data Structures

### Input (from fuerteventura-surf-spots.json)
```json
{
  "id": "spot-id",
  "primaryName": "Spot Name",
  "alternativeNames": ["Alternative 1", "Alternative 2"],
  "description": "Detailed spot description...",
  "location": {
    "area": "North/South/East/West",
    "nearestTowns": ["Town1", "Town2"],
    "coordinates": {
      "lat": 28.1234,
      "lng": -14.5678,
      "accuracy": "current-status"
    }
  },
  "waveDetails": { ... },
  "practicalities": { ... }
}
```

### Output (updated coordinates only)
```json
{
  "coordinates": {
    "lat": 28.7268,
    "lng": -13.993,
    "accuracy": "verified" // Updated based on confidence
  }
}
```

## Documentation Files

### Individual Spot Files
`docs/surf-spots-coordinates-research/{spot-id}-research.md`

### Master Research Log
`docs/surf-spots-coordinates-research/research-log.md`

### Sources Directory
`docs/surf-spots-coordinates-research/sources-directory.md`

## Error Handling

- **Web search failures**: Try alternative search terms, skip to next language
- **Coordinate conflicts**: Document conflicting sources, flag for manual review
- **Map validation failures**: Mark coordinates as unverified, require manual check
- **File system errors**: Stop processing, report error immediately

## Progress Tracking

- Maintain processing status for each spot
- Track sources found and verification status
- Log confidence levels and decisions made
- Generate progress reports at regular intervals

## Quality Assurance

- Minimum 3 independent sources for "verified" status
- Mandatory map validation for high confidence
- Consistency checks with location metadata
- Documentation of all research decisions

## Completion Criteria

- All 42 surf spots processed
- Coordinates updated where high confidence achieved
- Comprehensive documentation generated
- Processing report with summary statistics
- Backup of original data maintained