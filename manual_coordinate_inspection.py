#!/usr/bin/env python3
"""
Manual Inspection of All Surf Spots Coordinates Against Google Maps Sources
Comprehensive verification of all 42 spots against 4 Google Maps databases
"""

import json
import os
import math
from typing import Dict, List, Tuple, Optional

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in meters"""
    R = 6371000  # Earth's radius in meters

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

def load_all_data():
    """Load all necessary data files"""
    # Load main database
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r', encoding='utf-8') as f:
        spots_data = json.load(f)

    # Load Google Maps sources
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

    return spots_data, google_maps_sources

def find_google_matches_for_spot(spot_id: str, spot_name: str, alternative_names: List[str], google_maps_sources: Dict) -> List[Dict]:
    """Find all potential Google Maps matches for a spot"""
    matches = []

    # Create all possible names to match
    search_names = [spot_name.lower()] + [name.lower() for name in alternative_names]

    for source_name, spots in google_maps_sources.items():
        for gm_spot in spots:
            if not gm_spot or not gm_spot.get('name'):
                continue
            gm_name = gm_spot['name'].lower()

            # Check for exact matches
            for search_name in search_names:
                if search_name in gm_name or gm_name in search_name:
                    # Calculate distance if we have current coordinates
                    distance_km = None
                    # This will be calculated later when we have the spot data

                    matches.append({
                        'source': source_name,
                        'google_name': gm_spot['name'],
                        'google_lat': gm_spot['gps']['latitude'],
                        'google_lng': gm_spot['gps']['longitude'],
                        'google_description': gm_spot.get('description', ''),
                        'match_type': 'name_match',
                        'search_term': search_name
                    })
                    break

    return matches

def perform_manual_inspection():
    """Perform comprehensive manual inspection of all coordinates"""
    print("Loading all data sources...")
    spots_data, google_maps_sources = load_all_data()

    print(f"Loaded {len(spots_data['spots'])} surf spots from main database")

    total_google_spots = sum(len(spots) for spots in google_maps_sources.values())
    print(f"Loaded {total_google_spots} Google Maps entries from {len(google_maps_sources)} sources")

    inspection_results = []

    print("\n" + "="*80)
    print("MANUAL COORDINATE INSPECTION - ALL SURF SPOTS")
    print("="*80)

    for i, spot in enumerate(spots_data['spots'], 1):
        spot_id = spot['id']
        spot_name = spot['primaryName']
        alternative_names = spot.get('alternativeNames', [])
        current_lat = spot['location']['coordinates']['lat']
        current_lng = spot['location']['coordinates']['lng']
        current_accuracy = spot['location']['coordinates'].get('accuracy', 'unknown')

        # Find Google Maps matches
        matches = find_google_matches_for_spot(spot_id, spot_name, alternative_names, google_maps_sources)

        # Calculate distances for all matches
        matches_with_distance = []
        for match in matches:
            distance_m = calculate_distance(current_lat, current_lng, match['google_lat'], match['google_lng'])
            matches_with_distance.append({
                **match,
                'distance_m': distance_m,
                'distance_km': distance_m / 1000
            })

        # Sort by distance
        matches_with_distance.sort(key=lambda x: x['distance_km'])

        # Determine status
        if not matches_with_distance:
            status = "❌ NO MATCHES"
            recommended_action = "Investigate if spot exists or needs Google Maps submission"
        else:
            best_match = matches_with_distance[0]
            best_distance = best_match['distance_km']

            if best_distance < 0.5:  # Less than 500m
                status = "✅ EXCELLENT"
                recommended_action = "Coordinates confirmed accurate"
            elif best_distance < 2.0:  # Less than 2km
                status = "✅ GOOD"
                recommended_action = "Minor adjustment optional"
            elif best_distance < 5.0:  # Less than 5km
                status = "⚠️ FAIR"
                recommended_action = "Review recommended"
            else:
                status = "❌ POOR"
                recommended_action = "Coordinate correction needed"

        inspection_results.append({
            'index': i,
            'spot_id': spot_id,
            'spot_name': spot_name,
            'alternative_names': alternative_names,
            'current_lat': current_lat,
            'current_lng': current_lng,
            'current_accuracy': current_accuracy,
            'matches_count': len(matches_with_distance),
            'best_match': matches_with_distance[0] if matches_with_distance else None,
            'all_matches': matches_with_distance,
            'status': status,
            'recommended_action': recommended_action
        })

        # Display detailed inspection for this spot
        print(f"\n{i:2d}. {spot_name} ({spot_id})")
        print(f"    Current: {current_lat:.7f}, {current_lng:.7f} ({current_accuracy})")
        print(f"    Alternative Names: {', '.join(alternative_names) if alternative_names else 'None'}")
        print(f"    Status: {status}")
        print(f"    Google Maps Matches: {len(matches_with_distance)}")

        if matches_with_distance:
            best_match = matches_with_distance[0]
            print(f"    Best Match: {best_match['google_name']} ({best_match['source'].replace('_', ' ').title()})")
            print(f"               {best_match['google_lat']:.7f}, {best_match['google_lng']:.7f}")
            print(f"               Distance: {best_match['distance_km']:.2f}km ({best_match['distance_m']:.0f}m)")
            if best_match['google_description'] and len(best_match['google_description'].strip()) > 20:
                desc_preview = best_match['google_description'][:100] + "..." if len(best_match['google_description']) > 100 else best_match['google_description']
                print(f"               Description: {desc_preview}")
        else:
            print("    ⚠️ NO GOOGLE MAPS MATCHES FOUND")

        print(f"    Recommendation: {recommended_action}")

        # Show all matches if more than 1
        if len(matches_with_distance) > 1:
            print(f"    All Matches:")
            for j, match in enumerate(matches_with_distance[:5], 1):  # Show top 5
                print(f"      {j}. {match['google_name']} - {match['distance_km']:.2f}km ({match['source'].replace('_', ' ').title()})")

    # Summary statistics
    print("\n" + "="*80)
    print("INSPECTION SUMMARY")
    print("="*80)

    status_counts = {}
    action_counts = {}

    for result in inspection_results:
        status_counts[result['status']] = status_counts.get(result['status'], 0) + 1
        action_counts[result['recommended_action']] = action_counts.get(result['recommended_action'], 0) + 1

    print(f"Total Spots Inspected: {len(inspection_results)}")
    print(f"Status Distribution:")
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")

    print(f"\nAction Distribution:")
    for action, count in sorted(action_counts.items()):
        print(f"  {action}: {count}")

    # Identify spots needing immediate attention
    critical_spots = [r for r in inspection_results if r['status'] == '❌ POOR']
    print(f"\n⚠️ CRITICAL ISSUES ({len(critical_spots)} spots requiring immediate attention):")
    for spot in critical_spots:
        if spot['best_match']:
            print(f"  • {spot['spot_name']}: {spot['best_match']['distance_km']:.1f}km discrepancy")
        else:
            print(f"  • {spot['spot_name']}: No Google Maps matches")

    # Spots with no matches
    no_match_spots = [r for r in inspection_results if r['matches_count'] == 0]
    if no_match_spots:
        print(f"\n❌ SPOTS WITH NO GOOGLE MAPS MATCHES ({len(no_match_spots)}):")
        for spot in no_match_spots:
            print(f"  • {spot['spot_name']} ({spot['spot_id']})")

    return inspection_results

def generate_comparison_table(inspection_results: List[Dict]):
    """Generate detailed comparison table"""
    print("\nGenerating detailed comparison table...")

    table_content = "# Detailed Coordinate Comparison Table\n\n"
    table_content += "| # | Spot Name | Spot ID | Current Coordinates | Current Accuracy | Google Maps Match | Distance | Status | Action |\n"
    table_content += "|---|-----------|---------|-------------------|------------------|-------------------|----------|--------|--------|\n"

    for result in inspection_results:
        spot_name = result['spot_name']
        spot_id = result['spot_id']
        current_coords = f"{result['current_lat']:.7f}, {result['current_lng']:.7f}"
        current_accuracy = result['current_accuracy']

        if result['best_match']:
            gm_match = f"{result['best_match']['google_name']} ({result['best_match']['source'].replace('_', ' ').title()})"
            distance = f"{result['best_match']['distance_km']:.2f}km"
        else:
            gm_match = "No matches"
            distance = "N/A"

        status = result['status']
        action = result['recommended_action']

        table_content += f"| {result['index']} | {spot_name} | {spot_id} | {current_coords} | {current_accuracy} | {gm_match} | {distance} | {status} | {action} |\n"

    with open('/Users/frederic/github/lavolcanica/detailed_coordinate_comparison_table.csv', 'w', encoding='utf-8') as f:
        f.write(table_content)

    print("✅ Comparison table saved to: detailed_coordinate_comparison_table.csv")

def main():
    """Main manual inspection process"""
    print("🔍 Starting comprehensive manual coordinate inspection...")

    inspection_results = perform_manual_inspection()

    generate_comparison_table(inspection_results)

    # Save complete results
    results_data = {
        'inspection_date': '2025-11-14',
        'total_spots': len(inspection_results),
        'results': inspection_results
    }

    with open('/Users/frederic/github/lavolcanica/manual_coordinate_inspection_results.json', 'w', encoding='utf-8') as f:
        json.dump(results_data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Manual inspection completed!")
    print(f"📄 Results saved to: manual_coordinate_inspection_results.json")
    print(f"📊 Comparison table saved to: detailed_coordinate_comparison_table.csv")

    return inspection_results

if __name__ == "__main__":
    main()