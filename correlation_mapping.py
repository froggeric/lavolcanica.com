#!/usr/bin/env python3
"""
Comprehensive Correlation Mapping for Fuerteventura Surf Spots
Matches Google Maps data with existing 42 surf spots database
"""

import json
import math
import re
from typing import Dict, List, Tuple, Optional

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on earth"""
    R = 6371  # Earth's radius in kilometers

    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    return R * c

def normalize_name(name: str) -> str:
    """Normalize spot name for comparison"""
    if not name:
        return ""

    name = str(name).lower()
    name = re.sub(r'[^\w\s]', '', name)
    name = re.sub(r'\b(playa|de|la|el|del|los|las|beach)\b', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def load_existing_spots() -> Dict[str, Dict]:
    """Load existing 42 surf spots from main database"""
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r') as f:
        data = json.load(f)

    spots = {}
    for spot in data['spots']:
        spots[spot['id']] = {
            'id': spot['id'],
            'primaryName': spot['primaryName'],
            'alternativeNames': spot.get('alternativeNames', []),
            'coordinates': spot['location']['coordinates'],
            'area': spot['location']['area']
        }

    return spots

def load_google_maps_spots() -> List[Dict]:
    """Load all Google Maps surf spots from 4 sources"""
    sources = [
        '/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/FreshSurf surfspots aus Fuerteventura.json',
        '/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/Surf and Unwind surf guide Fuerteventura.json',
        '/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/Surfspots Fuerteventura Planet Surfcamps.json',
        '/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/surfermap Fuerteventura.json'
    ]

    all_spots = []

    for source_file in sources:
        with open(source_file, 'r') as f:
            data = json.load(f)

        source_name = data.get('source_info', {}).get('site', data.get('source_info', {}).get('website_name', 'Unknown'))

        for spot in data['surf_spots']:
            all_spots.append({
                'name': spot['name'],
                'description': spot.get('description', ''),
                'latitude': spot['gps']['latitude'],
                'longitude': spot['gps']['longitude'],
                'source': source_name
            })

    return all_spots

def find_best_match(google_spot: Dict, existing_spots: Dict) -> Tuple[Optional[str], str, float]:
    """Find best matching existing spot for a Google Maps spot"""
    google_name = normalize_name(google_spot['name'])
    google_lat = google_spot['latitude']
    google_lng = google_spot['longitude']

    best_match = None
    best_score = 0
    best_reason = ""

    for spot_id, spot in existing_spots.items():
        # Check exact name matches
        spot_names = [normalize_name(spot['primaryName'])] + [normalize_name(name) for name in spot['alternativeNames']]

        # Name similarity scoring
        name_score = 0
        if google_name in spot_names:
            name_score = 100
        else:
            # Check partial matches
            for spot_name in spot_names:
                if google_name in spot_name or spot_name in google_name:
                    name_score = max(name_score, 70)
                elif any(word in spot_name for word in google_name.split() if len(word) > 2):
                    name_score = max(name_score, 50)

        # Distance calculation
        spot_lat = spot['coordinates']['lat']
        spot_lng = spot['coordinates']['lng']
        distance = haversine_distance(google_lat, google_lng, spot_lat, spot_lng)

        # Distance scoring (under 1km = 100pts, under 2km = 80pts, under 5km = 60pts)
        if distance < 1:
            distance_score = 100
        elif distance < 2:
            distance_score = 80
        elif distance < 5:
            distance_score = 60
        elif distance < 10:
            distance_score = 40
        else:
            distance_score = 0

        # Combined score (70% name, 30% distance)
        total_score = (name_score * 0.7) + (distance_score * 0.3)

        if total_score > best_score:
            best_score = total_score
            best_match = spot_id
            if name_score >= 100 and distance_score >= 80:
                best_reason = f"Exact name match, {distance:.1f}km from existing coordinates"
            elif name_score >= 70 and distance_score >= 60:
                best_reason = f"Partial name match, {distance:.1f}km from existing coordinates"
            elif distance_score >= 80 and name_score >= 50:
                best_reason = f"Close proximity ({distance:.1f}km), partial name match"
            else:
                best_reason = f"Weak match: {distance:.1f}km, name similarity {name_score:.0f}%"

    return best_match, best_reason, best_score

def determine_confidence(score: float, distance: float) -> str:
    """Determine confidence level based on score and distance"""
    if score >= 85 and distance < 2:
        return "HIGH"
    elif score >= 60 or (score >= 50 and distance < 5):
        return "MEDIUM"
    else:
        return "LOW"

# Special handling for known name variations and typos
SPECIAL_MAPPINGS = {
    "machanicho": "majanicho",
    "el hiero": "la-izquierda-del-hierro",
    "piedra playa el cotillo": "el-cotillo-piedra-playa",
    "playa ultima - el cotillo": "el-cotillo-piedra-playa",
    "rocky point": "punta-elena",
    "punta helena": "punta-elena",
    "los lobos": "isla-de-lobos",
    "cotillo": "el-cotillo-piedra-playa"
}

def apply_special_mappings(google_spot: Dict, existing_spots: Dict) -> Tuple[Optional[str], str, float]:
    """Apply special name mappings and typos"""
    google_name = normalize_name(google_spot['name'])

    for variant, correct_id in SPECIAL_MAPPINGS.items():
        if variant in google_name or google_name in variant:
            if correct_id in existing_spots:
                spot = existing_spots[correct_id]
                distance = haversine_distance(
                    google_spot['latitude'], google_spot['longitude'],
                    spot['coordinates']['lat'], spot['coordinates']['lng']
                )
                return correct_id, f"Special mapping applied: {variant} → {spot['primaryName']}, {distance:.1f}km", 90

    return None, "", 0

def main():
    print("Loading existing surf spots database...")
    existing_spots = load_existing_spots()
    print(f"Loaded {len(existing_spots)} existing spots")

    print("Loading Google Maps surf spots...")
    google_spots = load_google_maps_spots()
    print(f"Loaded {len(google_spots)} Google Maps spots")

    print("\nCreating correlation mapping...")

    correlations = []
    unmatched_google_spots = []
    matched_existing_spots = set()

    for google_spot in google_spots:
        # Try special mappings first
        special_match, special_reason, special_score = apply_special_mappings(google_spot, existing_spots)

        if special_match:
            correlations.append({
                'google_name': google_spot['name'],
                'google_source': google_spot['source'],
                'google_lat': google_spot['latitude'],
                'google_lng': google_spot['longitude'],
                'matched_id': special_match,
                'matched_name': existing_spots[special_match]['primaryName'],
                'existing_lat': existing_spots[special_match]['coordinates']['lat'],
                'existing_lng': existing_spots[special_match]['coordinates']['lng'],
                'distance_km': haversine_distance(
                    google_spot['latitude'], google_spot['longitude'],
                    existing_spots[special_match]['coordinates']['lat'],
                    existing_spots[special_match]['coordinates']['lng']
                ),
                'confidence': determine_confidence(special_score, haversine_distance(
                    google_spot['latitude'], google_spot['longitude'],
                    existing_spots[special_match]['coordinates']['lat'],
                    existing_spots[special_match]['coordinates']['lng']
                )),
                'reason': special_reason,
                'score': special_score
            })
            matched_existing_spots.add(special_match)
            continue

        # Regular matching
        best_match, reason, score = find_best_match(google_spot, existing_spots)

        if best_match:
            spot = existing_spots[best_match]
            distance = haversine_distance(
                google_spot['latitude'], google_spot['longitude'],
                spot['coordinates']['lat'], spot['coordinates']['lng']
            )

            correlations.append({
                'google_name': google_spot['name'],
                'google_source': google_spot['source'],
                'google_lat': google_spot['latitude'],
                'google_lng': google_spot['longitude'],
                'matched_id': best_match,
                'matched_name': spot['primaryName'],
                'existing_lat': spot['coordinates']['lat'],
                'existing_lng': spot['coordinates']['lng'],
                'distance_km': distance,
                'confidence': determine_confidence(score, distance),
                'reason': reason,
                'score': score
            })
            matched_existing_spots.add(best_match)
        else:
            unmatched_google_spots.append(google_spot)

    # Find existing spots that weren't matched
    unmatched_existing_spots = []
    for spot_id, spot in existing_spots.items():
        if spot_id not in matched_existing_spots:
            unmatched_existing_spots.append(spot)

    # Generate report
    print(f"\n=== CORRELATION MAPPING REPORT ===")
    print(f"Total Google Maps spots analyzed: {len(google_spots)}")
    print(f"Total matches found: {len(correlations)}")
    print(f"Unmatched Google Maps spots (new discoveries): {len(unmatched_google_spots)}")
    print(f"Unmatched existing spots: {len(unmatched_existing_spots)}")

    # Print correlations by confidence level
    high_confidence = [c for c in correlations if c['confidence'] == 'HIGH']
    medium_confidence = [c for c in correlations if c['confidence'] == 'MEDIUM']
    low_confidence = [c for c in correlations if c['confidence'] == 'LOW']

    print(f"\n--- HIGH CONFIDENCE MATCHES ({len(high_confidence)}) ---")
    for c in sorted(high_confidence, key=lambda x: x['distance_km']):
        print(f"{c['google_name']} → {c['matched_name']} | {c['distance_km']:.2f}km | {c['google_source']}")

    print(f"\n--- MEDIUM CONFIDENCE MATCHES ({len(medium_confidence)}) ---")
    for c in sorted(medium_confidence, key=lambda x: x['distance_km']):
        print(f"{c['google_name']} → {c['matched_name']} | {c['distance_km']:.2f}km | {c['google_source']}")

    print(f"\n--- LOW CONFIDENCE MATCHES ({len(low_confidence)}) ---")
    for c in sorted(low_confidence, key=lambda x: x['distance_km']):
        print(f"{c['google_name']} → {c['matched_name']} | {c['distance_km']:.2f}km | {c['google_source']}")

    print(f"\n--- NEW DISCOVERIES (Unmatched Google Maps spots) ---")
    for spot in unmatched_google_spots:
        print(f"{spot['name']} | {spot['source']} | {spot['latitude']:.6f}, {spot['longitude']:.6f}")

    print(f"\n--- UNMATCHED EXISTING SPOTS ---")
    for spot in unmatched_existing_spots:
        print(f"{spot['primaryName']} ({spot['id']}) | {spot['coordinates']['lat']:.6f}, {spot['coordinates']['lng']:.6f}")

    # Save detailed results to JSON
    results = {
        'summary': {
            'total_google_spots': len(google_spots),
            'total_matches': len(correlations),
            'high_confidence': len(high_confidence),
            'medium_confidence': len(medium_confidence),
            'low_confidence': len(low_confidence),
            'new_discoveries': len(unmatched_google_spots),
            'unmatched_existing': len(unmatched_existing_spots)
        },
        'correlations': correlations,
        'new_discoveries': unmatched_google_spots,
        'unmatched_existing': unmatched_existing_spots
    }

    with open('/Users/frederic/github/lavolcanica/correlation_mapping_results.json', 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"\nDetailed results saved to: correlation_mapping_results.json")

    return results

if __name__ == "__main__":
    results = main()