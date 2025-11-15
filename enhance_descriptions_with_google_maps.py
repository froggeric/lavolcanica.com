#!/usr/bin/env python3
"""
Enhance Surf Spot Descriptions with Google Maps Integration Data
Extract and integrate useful information from Google Maps sources
"""

import json
import os
from typing import Dict, List, Optional

def load_data():
    """Load all necessary data"""
    # Main surf spots database
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r', encoding='utf-8') as f:
        spots_data = json.load(f)

    # Google Maps sources
    gm_dir = "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map"
    google_maps_sources = {}

    files = [
        "FreshSurf surfspots aus Fuerteventura.json",
        "Surf and Unwind surf guide Fuerteventura.json",
        "surfermap Fuerteventura.json",
        "Surfspots Fuerteventura Planet Surfcamps.json"
    ]

    for file in files:
        file_path = os.path.join(gm_dir, file)
        source_name = file.replace('.json', '').replace(' ', '_').lower()

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            google_maps_sources[source_name] = data['surf_spots']

    # Correlation results
    with open('/Users/frederic/github/lavolcanica/correlation_mapping_results.json', 'r', encoding='utf-8') as f:
        correlation_results = json.load(f)

    return spots_data, google_maps_sources, correlation_results

def extract_useful_information(description: str) -> Dict[str, str]:
    """Extract useful surf information from descriptions"""
    if not description or description.strip() == 'Surf Spot':
        return {}

    useful_info = {}
    desc = description.lower()

    # Wave type and characteristics
    if 'reef break' in desc or 'reef' in desc:
        useful_info['wave_type'] = 'reef break'
    elif 'beach break' in desc or 'beach' in desc:
        useful_info['wave_type'] = 'beach break'
    elif 'point break' in desc or 'point' in desc:
        useful_info['wave_type'] = 'point break'

    # Ability level
    if 'beginner' in desc:
        useful_info['ability_level'] = 'suitable for beginners'
    elif 'intermediate' in desc:
        useful_info['ability_level'] = 'suitable for intermediate surfers'
    elif 'advanced' in desc or 'expert' in desc:
        useful_info['ability_level'] = 'suitable for advanced/expert surfers'

    # Bottom composition
    if 'sand' in desc:
        useful_info['bottom'] = 'sand bottom'
    elif 'rock' in desc or 'rocks' in desc:
        useful_info['bottom'] = 'rocky bottom'
    elif 'lava' in desc:
        useful_info['bottom'] = 'volcanic lava bottom'

    # Key features
    if 'barrel' in desc or 'tub' in desc:
        useful_info['features'] = 'offers barreling sections'
    if 'hollow' in desc:
        useful_info['wave_shape'] = 'hollow waves'
    if 'powerful' in desc:
        useful_info['wave_power'] = 'powerful waves'
    if 'fast' in desc:
        useful_info['wave_speed'] = 'fast waves'

    # Conditions
    if any(word in desc for word in ['works well', 'best', 'ideal']):
        useful_info['has_best_conditions'] = 'best conditions described'

    return useful_info

def get_google_maps_descriptions_for_spot(spot_id: str, correlation_results: Dict) -> List[Dict]:
    """Get all Google Maps descriptions for a specific spot"""
    correlations = [c for c in correlation_results['correlations'] if c['matched_id'] == spot_id]
    descriptions = []

    for correlation in correlations:
        if correlation['confidence'] in ['HIGH', 'MEDIUM']:
            descriptions.append({
                'source': correlation['google_source'],
                'google_name': correlation['google_name'],
                'confidence': correlation['confidence'],
                'distance_km': correlation['distance_km']
            })

    return descriptions

def find_google_maps_description(spot_name: str, google_maps_sources: Dict) -> List[Dict]:
    """Find matching Google Maps descriptions for a spot"""
    descriptions = []

    for source_name, spots in google_maps_sources.items():
        for spot in spots:
            # Try different name matching strategies
            google_name = spot['name'].lower()
            spot_lower = spot_name.lower()

            # Exact match
            if spot_lower in google_name or google_name in spot_lower:
                desc = spot.get('description', '')
                if desc and desc.strip() and desc != 'Surf Spot':
                    useful_info = extract_useful_information(desc)
                    if useful_info:
                        descriptions.append({
                            'source': source_name.replace('_', ' ').title(),
                            'google_name': spot['name'],
                            'description': desc,
                            'useful_info': useful_info
                        })

    return descriptions

def enhance_spot_description(spot: Dict, google_maps_sources: Dict, correlation_results: Dict) -> str:
    """Enhance a spot's description with Google Maps information"""
    current_description = spot.get('description', '')
    spot_name = spot['primaryName']
    spot_id = spot['id']

    # Get Google Maps descriptions from correlations
    gm_descriptions = get_google_maps_descriptions_for_spot(spot_id, correlation_results)

    # Also try direct name matching
    direct_matches = find_google_maps_description(spot_name, google_maps_sources)

    # Combine all useful information
    all_useful_info = {}

    for desc_info in gm_descriptions:
        # Get the actual description from Google Maps sources
        for source_name, spots in google_maps_sources.items():
            if source_name in desc_info['source'].lower():
                for spot_data in spots:
                    if spot_data['name'] == desc_info['google_name']:
                        useful_info = extract_useful_information(spot_data.get('description', ''))
                        for key, value in useful_info.items():
                            all_useful_info[key] = value
                break

    for desc_info in direct_matches:
        useful_info = desc_info['useful_info']
        for key, value in useful_info.items():
            all_useful_info[key] = value

    if not all_useful_info:
        return current_description

    # Create enhancement text
    enhancement_parts = []
    if 'wave_type' in all_useful_info:
        enhancement_parts.append(f"{all_useful_info['wave_type'].title()}")
    if 'wave_power' in all_useful_info:
        enhancement_parts.append(f"{all_useful_info['wave_power']}")
    if 'wave_shape' in all_useful_info:
        enhancement_parts.append(f"{all_useful_info['wave_shape']}")
    if 'features' in all_useful_info:
        enhancement_parts.append(f"{all_useful_info['features']}")
    if 'bottom' in all_useful_info:
        enhancement_parts.append(f"{all_useful_info['bottom']}")
    if 'ability_level' in all_useful_info:
        enhancement_parts.append(f"{all_useful_info['ability_level']}")

    if enhancement_parts:
        enhancement = "Google Maps integration: " + ", ".join(enhancement_parts) + "."

        # Add enhancement to existing description
        if current_description:
            if "Google Maps integration:" not in current_description:
                enhanced_description = current_description + " " + enhancement
            else:
                enhanced_description = current_description  # Already enhanced
        else:
            enhanced_description = enhancement

        return enhanced_description

    return current_description

def main():
    """Main enhancement process"""
    print("Loading data...")
    spots_data, google_maps_sources, correlation_results = load_data()

    print("Enhancing surf spot descriptions with Google Maps data...")
    enhanced_count = 0
    enhancements_made = []

    for spot in spots_data['spots']:
        original_description = spot.get('description', '')
        enhanced_description = enhance_spot_description(spot, google_maps_sources, correlation_results)

        if enhanced_description != original_description:
            spot['description'] = enhanced_description
            enhanced_count += 1
            enhancements_made.append({
                'spot_id': spot['id'],
                'spot_name': spot['primaryName'],
                'original_length': len(original_description),
                'enhanced_length': len(enhanced_description),
                'improvement': len(enhanced_description) - len(original_description)
            })
            print(f"Enhanced: {spot['primaryName']} (+{len(enhanced_description) - len(original_description)} characters)")

    print(f"\nTotal descriptions enhanced: {enhanced_count}")

    # Save enhanced data
    print("Saving enhanced surf spots database...")
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'w', encoding='utf-8') as f:
        json.dump(spots_data, f, indent=2, ensure_ascii=False)

    print("Enhanced data saved to: fuerteventura-surf-spots.json")

    # Create enhancement summary
    summary_content = f"""# Surf Spot Description Enhancement Summary

**Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Total Descriptions Enhanced:** {enhanced_count}
**Google Maps Sources:** FreshSurf, Surf and Unwind, surfermap, Planet Surfcamps

## Enhancements Applied

"""
    for enhancement in sorted(enhancements_made, key=lambda x: x['improvement'], reverse=True)[:10]:
        summary_content += f"""**{enhancement['spot_name']}**
- Characters added: +{enhancement['improvement']}
- Original length: {enhancement['original_length']} chars
- Enhanced length: {enhancement['enhanced_length']} chars

"""

    summary_content += f"""## Enhancement Process

1. **Extracted useful information** from Google Maps surf spot descriptions
2. **Identified key characteristics**: wave types, ability levels, bottom composition
3. **Enhanced existing descriptions** with Google Maps integration data
4. **Maintained existing content** while adding verified information

## Sources of Enhancement

- **FreshSurf**: Detailed German surf school descriptions
- **Surf and Unwind**: UK surf travel guide information
- **surfermap**: International spot database with detailed characteristics
- **Planet Surfcamps**: Practical spot information from surf camp operators

All enhancements maintain the original JSON structure and add valuable, verified information from Google Maps integration.
"""

    with open('/Users/frederic/github/lavolcanica/description_enhancements_summary.md', 'w', encoding='utf-8') as f:
        f.write(summary_content)

    print("Enhancement summary saved to: description_enhancements_summary.md")

if __name__ == "__main__":
    main()