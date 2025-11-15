# Surf Spot Database Content Guidelines & Editorial Standards

## Overview

This document establishes comprehensive guidelines and editorial standards for maintaining the Fuerteventura surf spots database. It outlines the strict rules that must be followed when adding new surf spots or modifying existing entries to ensure consistency, quality, and editorial excellence.

The database contains 42 surf spots as of version 1.12.4, each with detailed information following a highly structured format. This document complements the technical data structure documentation by focusing on content quality, writing style, and editorial standards.

## 1. Data Structure Overview

The surf spots database follows a rigid JSON structure documented in [`surf-spots-data-structure.md`](surf-spots-data-structure.md). Each surf spot entry contains:

- **Basic Information**: `id`, `primaryName`, `alternativeNames`, `description`
- **Location**: `area`, `nearestTowns`, `coordinates` (with accuracy status)
- **Wave Details**: Type, direction, conditions, ability levels
- **Characteristics**: Crowd factors, hazards, bottom composition
- **Practicalities**: Access, parking, facilities, equipment recommendations

## 2. The Description Field: In-Depth Analysis

### 2.1. Length and Complexity Standards

Based on analysis of existing entries, descriptions are substantial pieces of writing:

- **Minimum Length**: 200+ words (not 150 as previously stated)
- **Typical Range**: 210-270 words
- **Structure**: 3-4 detailed paragraphs
- **Complexity**: Sophisticated narrative with technical depth

**Examples from Database:**
- El Pozo: 246 words
- The Bubble: 217 words
- Cofete: 268 words
- Acid Drop: 214 words

### 2.2. Content Analysis: What the Descriptions Contain

#### Primary Information Categories:

**1. Geographic and Physical Context**
- Exact location relative to landmarks (lighthouses, villages, geographical features)
- Coastal geography and how it affects wave formation
- Natural landmarks that define the spot's character
- Relationship to nearby surf spots

**Examples:**
- "commands a premium position directly in front of the iconic Jandía lighthouse at the island's very tip"
- "Positioned at the island's narrowest point"
- "This vast, breathtakingly beautiful beach stretches along the remote Jandía peninsula"

**2. Wave Technical Characteristics**
- Specific wave types and how they break
- Reef/bottom composition and its effect on waves
- Wave shape, power, and performance characteristics
- How waves change with conditions or tides

**Examples:**
- "shallow water wave produces exceptional tubing opportunities"
- "long, predictable right-handers"
- "shifting sandbanks that provide left and right-hand beach breaks"
- "hollow and steep section develops, producing perfect tube opportunities"

**3. Ability Level and Skill Requirements**
- Primary ability level needed
- What makes it suitable or challenging for different levels
- Progressive sections within the same spot
- Comparison to other spots in terms of difficulty

**Examples:**
- "This is where countless surfers have caught their first whitewater waves, yet on its day, the same beach can serve up powerful, hollow barrels"
- "ideal practice grounds for intermediates and endless fun for longboarders"
- "only very advanced surfers should attempt this spot"

**4. Atmosphere and Experience**
- Crowd levels and local vibe
- Scenic beauty and setting
- Unique characteristics that make the spot special
- Emotional/psychological aspects of surfing there

**Examples:**
- "The intimate setting and challenging nature create a surf experience that's both terrifying and transformative"
- "The laid-back atmosphere and stunning coastal setting create a perfect learning environment"
- "offers an unparalleled sense of freedom"

**5. Practical Context**
- Access difficulty and journey aspects
- Wind and weather protection
- Seasonal reliability
- Historical or cultural significance

**Examples:**
- "Reaching Cofete is an adventure in itself, accessible only via a challenging dirt road"
- "remarkable reliability during summer months"
- "known affectionately as 'El Viejo Rey' (The Old King)"

### 2.3. Narrative Structure Analysis

#### Four-Paragraph Structure Pattern:

**Paragraph 1: Identity and Setting (40-60 words)**
- Establish the spot's primary identity and reputation
- Geographic context and key landmarks
- Opening hook that captures the spot's essence
- Difficulty level and general wave type

**Pattern Examples:**
- "The southernmost sentinel of Fuerteventura's surfing coastline..."
- "The crown jewel of Fuerteventura's wild coastline..."
- "La Pared, known affectionately as 'El Viejo Rey'..."

**Paragraph 2: Technical Wave Analysis (70-90 words)**
- Detailed explanation of wave formation and mechanics
- How the spot works under different conditions
- Bottom composition effects on wave shape
- Multiple sections or variation within the spot

**Key Elements:**
- Reef/bottom type and its influence
- Wave shape descriptions (hollow, steep, mellow, etc.)
- Size and power characteristics
- How conditions affect wave quality

**Paragraph 3: Surf Experience and Versatility (60-80 words)**
- Different experience levels within the spot
- Crowd dynamics and local atmosphere
- Comparison to other spots
- Unique selling points

**Content Focus:**
- Ability level accommodation
- Progression opportunities
- Atmosphere and vibe
- Reliability factors

**Paragraph 4: Context and Conclusion (40-60 words)**
- Broader context within Fuerteventura surfing
- Journey or access significance
- Emotional impact or transformation
- Concluding statement about the spot's importance

**Purpose:**
- Elevate the spot beyond just waves
- Connect to broader surfing culture
- Create emotional resonance
- End with memorable statement

### 2.4. Writing Style and Tone

#### Sophisticated Literary Elements:

**Figurative Language:**
- Metaphors: "crown jewel", "sentinel", "graveyard", "king"
- Personification: "commands a premium position", "reigns as"
- Imagery: "breathtakingly beautiful", "dramatic natural amphitheater"

**Technical Precision:**
- Specific wave terminology: "A-frame", "barreling sections", "cutbacks"
- Geological terms: "volcanic reef", "shifting sandbanks", "coastal geometry"
- Measurement references: "365 days a year", "multiple sections"

**Narrative Voice:**
- Experienced surfer perspective
- Authoritative knowledge
- Passionate but objective
- Respect for local culture and spots

#### Engagement Techniques:

**Storytelling Elements:**
- Create a narrative journey for the reader
- Build anticipation and excitement
- Include transformational aspects
- Use dramatic tension (hazards vs. rewards)

**Sensory Details:**
- Visual: "stunning cliffs", "turquoise waters", "colorful boats"
- Physical: "raw power", "hollow barrels", "gentler walls"
- Emotional: "terrifying and transformative", "peaceful escape"

**Reader Connection:**
- Address different ability levels
- Create aspiration (wanting to surf there)
- Provide practical insight
- Share "insider" knowledge

## 3. Information Sourcing and Research Standards

### 3.1. Primary Research Sources

**Local Knowledge Requirements:**
- Direct surfing experience at the spot
- Interviews with local surfers and residents
- Historical knowledge from long-time residents
- Understanding of spot-specific nuances

**Technical Sources:**
- Satellite imagery and aerial photography
- Nautical charts and coastal surveys
- Official tourism and maritime authorities
- Scientific studies of coastal geography

**Cross-Referencing Requirements:**
- Multiple surf guides and websites
- Local surf school information
- Weather and swell pattern analysis
- Historical consistency checks

### 3.2. Information Verification Process

**Geographic Verification:**
1. Confirm exact location using multiple mapping sources
2. Verify landmark references (lighthouses, villages, points)
3. Cross-check coastal geography descriptions
4. Validate relationship to nearby spots

**Technical Wave Verification:**
1. Confirm wave type and direction with multiple sources
2. Verify bottom composition and reef structure
3. Cross-check ability level assessments
4. Validate seasonal and condition patterns

**Cultural and Historical Verification:**
1. Confirm alternative names and local terminology
2. Verify historical significance or stories
3. Check cultural references and traditions
4. Validate access and journey descriptions

### 3.3. Quality Assurance for Descriptions

**Content Validation Checklist:**
- [ ] All technical information verified from multiple sources
- [ ] Geographic context accurate and detailed
- [ ] Wave analysis technically precise
- [ ] Ability level assessment appropriate
- [ ] Cultural references respectful and accurate
- [ ] Safety information clear and responsible

**Writing Quality Standards:**
- [ ] Follows established narrative structure
- [ ] Meets minimum 200-word requirement
- [ ] Uses sophisticated but accessible language
- [ ] Maintains consistent tone with database
- [ ] Includes appropriate technical terminology
- [ ] Creates engaging reading experience

## 4. Editorial Standards & Writing Guidelines

### 4.1. Character Encoding Standards

**Unicode Character Requirements:**
- All Spanish characters MUST be properly encoded: `Pájara`, `Jandía`, `El Cotillo`
- Validate JSON encoding after making changes
- Ensure consistent accent usage across all fields
- Test character display in application

### 4.2. Data Quality Standards

**Coordinate Accuracy:**
- Minimum 6 decimal places for GPS coordinates
- Accuracy field must be "verified" or "unverified"
- Verification requires multiple reliable sources
- Document verification method

**Enumeration Compliance:**
- Use only allowed values for all controlled fields
- Maintain consistency with existing entries
- Validate against data structure documentation
- Update documentation if adding new values

### 4.3. Content Creation Workflow

**Research Phase:**
1. Gather information from multiple primary sources
2. Cross-reference all technical details
3. Collect local knowledge and cultural context
4. Verify safety and access information

**Writing Phase:**
1. Follow four-paragraph narrative structure
2. Include all required content categories
3. Apply sophisticated writing style
4. Meet minimum 200-word requirement

**Review Phase:**
1. Technical accuracy verification
2. Writing quality assessment
3. Consistency check with database
4. Final validation against guidelines

## 5. Examples of Excellence

### 5.1. Model Analysis: El Pozo (246 words)

**Paragraph 1 - Identity & Setting:**
"The southernmost sentinel of Fuerteventura's surfing coastline, El Pozo commands a premium position directly in front of the iconic Jandía lighthouse at the island's very tip. This strategic location creates perfect conditions for clean, wind-swell-generated left-hand waves that benefit from consistent offshore winds, establishing El Pozo as the ultimate summer favorite when other spots struggle."

*Elements: Geographic position, landmark reference, wave type, seasonal reliability*

**Paragraph 2 - Technical Analysis:**
"El Pozo offers remarkable wave versatility that caters to different skill levels and riding styles. Immediately in front of the lighthouse, a hollow and steep section develops, producing perfect tube opportunities for advanced surfers seeking that dream barrel. Further down the beach, the wave transforms into longer, gentler walls that provide ideal practice grounds for intermediates and endless fun for longboarders."

*Elements: Wave versatility, technical detail, ability levels, spot progression*

**Paragraph 3 - Experience & Atmosphere:**
"This natural progression within one spot makes El Pozo uniquely accommodating, offering everything from high-performance tube riding to mellow cruising sessions. What truly elevates El Pozo above other southern spots is its remarkable reliability during summer months, when consistent offshore winds groom wind swells into pristine left-handers."

*Elements: Unique characteristics, reliability factors, comparison to other spots*

**Paragraph 4 - Context & Conclusion:**
"The spot's unique positioning provides natural wind protection while maintaining wave quality that rarely falls flat. The iconic Jandía lighthouse serves not just as a navigational aid but as a symbol of the spot's premium status - this is where Fuerteventura's surfing journey begins or ends, depending on your perspective, making it an essential destination for any surfer exploring the island's southern reaches."

*Elements: Broader context, landmark significance, emotional conclusion, travel recommendation*

### 5.2. Excellence Patterns Identified

**Opening Hooks:**
- Geographic superlatives: "The crown jewel", "The southernmost sentinel"
- Nickname explanations: "known affectionately as 'El Viejo Rey'"
- Dramatic positioning: "commands a premium position"

**Technical Sophistication:**
- Specific wave mechanics: "hollow and steep section develops"
- Bottom interaction: "breaks over treacherous volcanic reef"
- Condition specificity: "when consistent offshore winds groom wind swells"

**Narrative Devices:**
- Transformation themes: "terrifying and transformative"
- Journey metaphors: "pilgrimage destination"
- Duality concepts: "mellow beach breaks for those seeking solitude and perfect peaks"

## 6. Update and Maintenance Protocols

### 6.1. Review Schedule

- **Quarterly**: Coordinate accuracy and safety information
- **Semi-annually**: Description quality and technical details
- **Annually**: Complete narrative review and enhancement

### 6.2. Update Categories

**Critical Updates** (Immediate):
- Safety information changes
- Access restrictions or closures
- Environmental changes affecting waves

**Quality Updates** (Next cycle):
- Enhanced description narratives
- Improved technical accuracy
- Additional historical context

**Enhancement Updates** (Ongoing):
- Literary quality improvements
- Additional comparative analysis
- Cultural context enrichment

---

This document serves as the authoritative guide for maintaining the highest standards in surf spot content creation. Every description should be considered a piece of technical literature that combines practical surfing knowledge with engaging narrative storytelling.

For technical structure specifications, refer to [`surf-spots-data-structure.md`](surf-spots-data-structure.md).
For implementation details, refer to [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md).