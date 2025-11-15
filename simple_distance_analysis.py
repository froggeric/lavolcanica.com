#!/usr/bin/env python3
"""
Simple distance analysis for unmatched spots.
"""

import json
import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance between two points on earth."""
    R = 6371  # Earth's radius in kilometers

    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def load_google_spots():
    """Load all Google Maps surf spots."""
    spots = []
    files = [
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/Surfspots Fuerteventura Planet Surfcamps.json",
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/Surf and Unwind surf guide Fuerteventura.json",
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/surfermap Fuerteventura.json",
        "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/FreshSurf surfspots aus Fuerteventura.json"
    ]

    for file_path in files:
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
                source = data.get('source_info', {}).get('site', data.get('source_info', {}).get('website_name', file_path.split('/')[-1]))

                for spot in data.get('surf_spots', []):
                    if 'gps' in spot and spot['gps']:
                        spots.append({
                            'name': spot['name'],
                            'latitude': spot['gps']['latitude'],
                            'longitude': spot['gps']['longitude'],
                            'source': source,
                            'description': spot.get('description', '')
                        })
        except Exception as e:
            print(f"Error loading {file_path}: {e}")

    return spots

# Unmatched spots from our database
unmatched_spots = [
    {'id': 'campo-de-futbol', 'name': 'Campo de Futbol', 'latitude': 28.231527, 'longitude': -14.215697},
    {'id': 'el-pozo', 'name': 'El Pozo', 'latitude': 28.065700, 'longitude': -14.507100},
    {'id': 'esquinzo', 'name': 'Esquinzo', 'latitude': 28.071400, 'longitude': -14.304000},
    {'id': 'la-turbia', 'name': 'Playa de la Turbia', 'latitude': 28.084800, 'longitude': -14.492100},
    {'id': 'las-playas-muelle', 'name': 'Las Playas Muelle', 'latitude': 28.227745, 'longitude': -13.985124},
    {'id': 'las-salinas', 'name': 'Las Salinas', 'latitude': 28.075600, 'longitude': -14.471900},
    {'id': 'los-hoteles', 'name': 'Los Hoteles', 'latitude': 28.7127, 'longitude': -13.8395},
    {'id': 'pico-de-las-motos', 'name': 'Pico de las Motos', 'latitude': 28.5167, 'longitude': -13.8667},
    {'id': 'punta-del-tigre', 'name': 'Punta del Tigre', 'latitude': 28.0806, 'longitude': -14.504485}
]

# Load Google Maps spots
google_spots = load_google_spots()
print(f"Loaded {len(google_spots)} Google Maps spots")

# Analyze each unmatched spot
for unmatched in unmatched_spots:
    print(f"\n{'='*60}")
    print(f"ANALYZING: {unmatched['name']} ({unmatched['id']})")
    print(f"Coordinates: {unmatched['latitude']:.6f}, {unmatched['longitude']:.6f}")
    print(f"{'='*60}")

    # Find spots within 10km
    close_matches = []
    for spot in google_spots:
        distance = haversine_distance(
            unmatched['latitude'], unmatched['longitude'],
            spot['latitude'], spot['longitude']
        )
        if distance <= 10.0:  # Within 10km
            close_matches.append({
                'name': spot['name'],
                'distance': distance,
                'latitude': spot['latitude'],
                'longitude': spot['longitude'],
                'source': spot['source']
            })

    # Sort by distance
    close_matches.sort(key=lambda x: x['distance'])

    if close_matches:
        print(f"\nFound {len(close_matches)} spots within 10km:")
        for i, match in enumerate(close_matches[:10], 1):  # Show top 10
            print(f"\n{i}. {match['name']}")
            print(f"   Distance: {match['distance']:.3f} km")
            print(f"   Coordinates: {match['latitude']:.6f}, {match['longitude']:.6f}")
            print(f"   Source: {match['source']}")
    else:
        print("\n❌ No spots found within 10km")

    # Look for potential name matches (regardless of distance)
    name_matches = []
    search_terms = [
        unmatched['id'].replace('-', ' '),
        unmatched['id'].split('-')[-1],  # Last part of ID
        unmatched['name'].lower().split()[-1]  # Last word of name
    ]

    for spot in google_spots:
        if not spot['name']:  # Skip if name is None or empty
            continue
        spot_name_lower = spot['name'].lower()
        for term in search_terms:
            if term.lower() in spot_name_lower or spot_name_lower in term.lower():
                distance = haversine_distance(
                    unmatched['latitude'], unmatched['longitude'],
                    spot['latitude'], spot['longitude']
                )
                name_matches.append({
                    'name': spot['name'],
                    'distance': distance,
                    'latitude': spot['latitude'],
                    'longitude': spot['longitude'],
                    'source': spot['source'],
                    'match_term': term
                })
                break

    if name_matches:
        print(f"\n🎯 Potential name matches:")
        for match in name_matches:
            print(f"   - {match['name']} ({match['distance']:.3f} km) - matched term: '{match['match_term']}'")

    print()  # Spacing