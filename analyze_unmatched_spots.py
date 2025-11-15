#!/usr/bin/env python3
"""
Systematic analysis of 9 unmatched surf spots against Google Maps data sources.
"""

import json
import math
from typing import Dict, List, Tuple, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on earth."""
    R = 6371  # Earth's radius in kilometers

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = (math.sin(dlat/2)**2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c

def load_google_maps_data() -> List[Dict]:
    """Load all Google Maps JSON files."""
    files = [
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/Surfspots Fuerteventura Planet Surfcamps.json",
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/Surf and Unwind surf guide Fuerteventura.json",
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/surfermap Fuerteventura.json",
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/FreshSurf surfspots aus Fuerteventura.json"
    ]

    all_spots = []
    for file_path in files:
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                source = data.get('source_info', {}).get('site', data.get('source_info', {}).get('website_name', 'Unknown'))

                for spot in data.get('surf_spots', []):
                    if 'gps' in spot and spot['gps']:
                        all_spots.append({
                            'name': spot['name'],
                            'latitude': spot['gps']['latitude'],
                            'longitude': spot['gps']['longitude'],
                            'source': source,
                            'description': spot.get('description', ''),
                            'url': spot.get('url', '')
                        })
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

    return all_spots

def find_nearby_spots(target_lat: float, target_lon: float, google_spots: List[Dict],
                     max_distance_km: float = 10.0) -> List[Dict]:
    """Find spots within max_distance_km of target coordinates."""
    nearby_spots = []

    for spot in google_spots:
        distance = haversine_distance(target_lat, target_lon, spot['latitude'], spot['longitude'])
        if distance <= max_distance_km:
            nearby_spots.append({
                **spot,
                'distance_km': distance
            })

    return sorted(nearby_spots, key=lambda x: x['distance_km'])

def find_potential_name_matches(spot_name: str, google_spots: List[Dict],
                               target_lat: float, target_lon: float) -> List[Dict]:
    """Find potential matches based on name variations."""
    potential_matches = []

    # Normalize the spot name for comparison
    normalized_name = spot_name.lower().replace('-', ' ').replace('_', ' ')

    # Common variations to check
    name_variations = [
        normalized_name,
        normalized_name.replace(' ', ''),
        normalized_name.split()[-1],  # Last word only
        normalized_name.split()[0],   # First word only
    ]

    # Special cases for common prefixes/suffixes
    if normalized_name.startswith('el '):
        name_variations.append(normalized_name[3:])
    if normalized_name.startswith('la '):
        name_variations.append(normalized_name[3:])
    if normalized_name.startswith('las '):
        name_variations.append(normalized_name[4:])
    if normalized_name.startswith('los '):
        name_variations.append(normalized_name[4:])

    # Add variations
    if 'playa' not in normalized_name:
        for var in name_variations:
            name_variations.extend([
                f"playa {var}",
                f"{var} beach",
                f"{var} surf"
            ])

    for spot in google_spots:
        spot_name_lower = spot['name'].lower()
        distance = haversine_distance(target_lat, target_lon, spot['latitude'], spot['longitude'])

        # Check for any name variation match
        is_name_match = any(var in spot_name_lower or spot_name_lower in var for var in name_variations)

        if is_name_match and distance <= 10.0:
            potential_matches.append({
                **spot,
                'distance_km': distance,
                'match_reason': 'Name variation match'
            })

    return sorted(potential_matches, key=lambda x: x['distance_km'])

# Unmatched spots from our database
unmatched_spots = [
    {
        'id': 'campo-de-futbol',
        'name': 'Campo de Futbol',
        'location': 'West',
        'latitude': 28.231527,
        'longitude': -14.215697
    },
    {
        'id': 'el-pozo',
        'name': 'El Pozo',
        'location': 'South',
        'latitude': 28.065700,
        'longitude': -14.507100
    },
    {
        'id': 'esquinzo',
        'name': 'Esquinzo',
        'location': 'South',
        'latitude': 28.071400,
        'longitude': -14.304000
    },
    {
        'id': 'la-turbia',
        'name': 'Playa de la Turbia',
        'location': 'South',
        'latitude': 28.084800,
        'longitude': -14.492100
    },
    {
        'id': 'las-playas-muelle',
        'name': 'Las Playas Muelle',
        'location': 'Southeast',
        'latitude': 28.227745,
        'longitude': -13.985124
    },
    {
        'id': 'las-salinas',
        'name': 'Las Salinas',
        'location': 'South',
        'latitude': 28.075600,
        'longitude': -14.471900
    },
    {
        'id': 'los-hoteles',
        'name': 'Los Hoteles',
        'location': 'North East',
        'latitude': 28.7127,
        'longitude': -13.8395
    },
    {
        'id': 'pico-de-las-motos',
        'name': 'Pico de las Motos',
        'location': 'East',
        'latitude': 28.5167,
        'longitude': -13.8667
    },
    {
        'id': 'punta-del-tigre',
        'name': 'Punta del Tigre',
        'location': 'South',
        'latitude': 28.0806,
        'longitude': -14.504485
    }
]

def analyze_spot(spot: Dict, google_spots: List[Dict]) -> Dict:
    """Analyze a single unmatched spot for potential matches."""
    print(f"\n{'='*60}")
    print(f"ANALYZING: {spot['name']} ({spot['id']})")
    print(f"Location: {spot['location']}")
    print(f"Coordinates: {spot['latitude']:.6f}, {spot['longitude']:.6f}")
    print(f"{'='*60}")

    # Find all spots within 10km
    nearby_spots = find_nearby_spots(spot['latitude'], spot['longitude'], google_spots, 10.0)

    # Find potential name matches
    name_matches = find_potential_name_matches(
        spot['id'].replace('-', ' '), google_spots,
        spot['latitude'], spot['longitude']
    )

    # Combine results, avoiding duplicates
    all_matches = []
    seen_names = set()

    for match in nearby_spots + name_matches:
        if match['name'] not in seen_names:
            all_matches.append(match)
            seen_names.add(match['name'])

    # Sort by distance
    all_matches.sort(key=lambda x: x['distance_km'])

    analysis = {
        'spot': spot,
        'nearby_spots_count': len(nearby_spots),
        'name_matches_count': len(name_matches),
        'all_matches': all_matches
    }

    # Print results
    print(f"\nSpots within 10km: {len(nearby_spots)}")
    print(f"Potential name matches within 10km: {len(name_matches)}")

    if all_matches:
        print(f"\nTOP POTENTIAL MATCHES:")
        for i, match in enumerate(all_matches[:10], 1):  # Show top 10
            print(f"\n{i}. {match['name']}")
            print(f"   Source: {match['source']}")
            print(f"   Distance: {match['distance_km']:.3f} km")
            print(f"   Coordinates: {match['latitude']:.6f}, {match['longitude']:.6f}")
            if match.get('match_reason'):
                print(f"   Match reason: {match['match_reason']}")
            if match.get('description'):
                desc = match['description'][:100] + "..." if len(match['description']) > 100 else match['description']
                print(f"   Description: {desc}")
    else:
        print(f"\n❌ NO MATCHES FOUND within 10km")

    return analysis

def main():
    """Main analysis function."""
    print("Loading Google Maps data...")
    google_spots = load_google_maps_data()
    print(f"Loaded {len(google_spots)} surf spots from Google Maps sources")

    print(f"\nAnalyzing {len(unmatched_spots)} unmatched spots...")

    all_results = []
    for spot in unmatched_spots:
        result = analyze_spot(spot, google_spots)
        all_results.append(result)

    # Summary
    print(f"\n{'='*80}")
    print("ANALYSIS SUMMARY")
    print(f"{'='*80}")

    total_matches = 0
    strong_matches = 0

    for result in all_results:
        spot = result['spot']
        matches = result['all_matches']

        # Count strong matches (within 2km or name match)
        strong = [m for m in matches if m['distance_km'] <= 2.0 or m.get('match_reason')]

        print(f"\n{spot['name']}: {len(matches)} total matches, {len(strong)} strong matches")

        if strong:
            strong_matches += 1
            best_match = strong[0]
            print(f"  → Best: {best_match['name']} ({best_match['distance_km']:.3f}km)")

        total_matches += len(matches)

    print(f"\n{'='*80}")
    print(f"TOTALS:")
    print(f"- Total potential matches across all spots: {total_matches}")
    print(f"- Spots with at least one strong match: {strong_matches}/{len(unmatched_spots)}")
    print(f"- Spots with no matches: {len(unmatched_spots) - strong_matches}/{len(unmatched_spots)}")

    # Save detailed results
    with open('/Users/frederic/github/lavolcanica/unmatched_spots_analysis_results.json', 'w') as f:
        json.dump(all_results, f, indent=2)

    print(f"\nDetailed results saved to: unmatched_spots_analysis_results.json")

if __name__ == "__main__":
    main()