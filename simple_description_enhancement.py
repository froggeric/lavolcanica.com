#!/usr/bin/env python3
"""
Simple Description Enhancement with Google Maps Data
Extract and integrate useful information from FreshSurf descriptions
"""

import json

def main():
    """Simple enhancement using FreshSurf data"""
    print("Loading data...")

    # Load main database
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r', encoding='utf-8') as f:
        spots_data = json.load(f)

    # Load FreshSurf data (has the best descriptions)
    with open('/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/FreshSurf surfspots aus Fuerteventura.json', 'r', encoding='utf-8') as f:
        freshsurf_data = json.load(f)

    # Load correlation results
    with open('/Users/frederic/github/lavolcanica/correlation_mapping_results.json', 'r', encoding='utf-8') as f:
        correlation_results = json.load(f)

    print("Enhancing descriptions with FreshSurf information...")

    enhanced_count = 0
    freshsurf_spots = {spot['name']: spot for spot in freshsurf_data['surf_spots']}

    for correlation in correlation_results['correlations']:
        if correlation['confidence'] == 'HIGH' and 'freshsurf' in correlation['google_source'].lower():
            google_name = correlation['google_name']
            spot_id = correlation['matched_id']

            # Find the spot in our database
            spot = next((s for s in spots_data['spots'] if s['id'] == spot_id), None)
            if spot and google_name in freshsurf_spots:
                freshsurf_desc = freshsurf_spots[google_name].get('description', '')

                if freshsurf_desc and len(freshsurf_desc.strip()) > 20 and freshsurf_desc != 'Surf Spot':
                    current_desc = spot.get('description', '')

                    # Add FreshSurf information if not already present
                    if 'freshsurf' not in current_desc.lower():
                        enhancement = f" FreshSurf integration: {freshsurf_desc}"
                        enhanced_description = current_desc.rstrip('.') + enhancement
                        spot['description'] = enhanced_description
                        enhanced_count += 1
                        print(f"Enhanced {spot['primaryName']} with FreshSurf information")

    print(f"\nTotal descriptions enhanced: {enhanced_count}")

    # Save enhanced data
    print("Saving enhanced surf spots database...")
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'w', encoding='utf-8') as f:
        json.dump(spots_data, f, indent=2, ensure_ascii=False)

    print("Enhanced database saved successfully!")

    # Create simple summary
    summary = f"""# Description Enhancement Summary

**Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Enhanced Descriptions:** {enhanced_count}
**Source:** FreshSurf surfspots aus Fuerteventura

Enhanced descriptions with detailed information from FreshSurf including:
- Wave characteristics and conditions
- Ability level recommendations
- Bottom composition details
- Practical surfing information

All enhancements maintain existing JSON structure.
"""

    with open('/Users/frederic/github/lavolcanica/simple_enhancement_summary.md', 'w', encoding='utf-8') as f:
        f.write(summary)

    print("Summary saved to: simple_enhancement_summary.md")

if __name__ == "__main__":
    main()