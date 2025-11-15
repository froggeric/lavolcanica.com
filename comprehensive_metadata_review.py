#!/usr/bin/env python3
"""
Comprehensive Manual Review of All Metadata in Surf Spots JSON Database
Review waveDetails, characteristics, practicalities, and all other metadata fields for all 42 spots
"""

import json
import re
from typing import Dict, List, Optional, Set, Tuple
from collections import defaultdict, Counter

def load_surf_spots_data():
    """Load the main surf spots database"""
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_metadata_structure(spot: Dict) -> Dict:
    """Analyze the metadata structure for a single spot"""
    analysis = {
        'spot_id': spot['id'],
        'spot_name': spot['primaryName'],
        'alternative_names_count': len(spot.get('alternativeNames', [])),
        'description_length': len(spot.get('description', '')),
        'location_area': spot['location']['area'],
        'nearest_towns_count': len(spot['location'].get('nearestTowns', [])),
        'coordinates_accuracy': spot['location']['coordinates'].get('accuracy', 'unknown'),

        # Wave Details Analysis
        'wave_details': analyze_wave_details(spot.get('waveDetails', {})),

        # Characteristics Analysis
        'characteristics': analyze_characteristics(spot.get('characteristics', {})),

        # Practicalities Analysis
        'practicalities': analyze_practicalities(spot.get('practicalities', {})),

        # General Quality Assessment
        'quality_score': 0,
        'issues': [],
        'completeness': {}
    }

    # Calculate overall quality score
    analysis['quality_score'] = calculate_quality_score(analysis)

    return analysis

def analyze_wave_details(wave_details: Dict) -> Dict:
    """Analyze waveDetails structure and content"""
    analysis = {
        'has_wave_details': bool(wave_details),
        'type_count': len(wave_details.get('type', [])),
        'direction_count': len(wave_details.get('direction', [])),
        'best_swell_count': len(wave_details.get('bestSwellDirection', [])),
        'best_wind_count': len(wave_details.get('bestWindDirection', [])),
        'best_tide_count': len(wave_details.get('bestTide', [])),
        'has_direction_notes': bool(wave_details.get('directionNotes')),
        'has_tide_notes': bool(wave_details.get('tideNotes')),
        'has_ideal_conditions': bool(wave_details.get('idealConditions')),
        'ability_level_primary': wave_details.get('abilityLevel', {}).get('primary', ''),
        'ability_level_secondary_count': len(wave_details.get('abilityLevel', {}).get('alsoSuitableFor', [])),
        'best_season_count': len(wave_details.get('bestSeason', [])),
        'issues': []
    }

    # Check for issues
    if not wave_details:
        analysis['issues'].append("Missing waveDetails")
        return analysis

    if not wave_details.get('type'):
        analysis['issues'].append("Missing wave type")

    if not wave_details.get('direction'):
        analysis['issues'].append("Missing wave direction")

    if not wave_details.get('abilityLevel', {}).get('primary'):
        analysis['issues'].append("Missing primary ability level")

    if not wave_details.get('bestSwellDirection'):
        analysis['issues'].append("Missing best swell direction")

    if not wave_details.get('bestWindDirection'):
        analysis['issues'].append("Missing best wind direction")

    # Check for empty lists
    empty_fields = []
    for field in ['type', 'direction', 'bestSwellDirection', 'bestWindDirection', 'bestTide', 'bestSeason']:
        if field in wave_details and not wave_details[field]:
            empty_fields.append(field)

    if empty_fields:
        analysis['issues'].append(f"Empty fields: {', '.join(empty_fields)}")

    return analysis

def analyze_characteristics(characteristics: Dict) -> Dict:
    """Analyze characteristics structure and content"""
    analysis = {
        'has_characteristics': bool(characteristics),
        'crowd_factor': characteristics.get('crowdFactor', ''),
        'has_crowd_notes': bool(characteristics.get('crowdNotes')),
        'local_vibe': characteristics.get('localVibe', ''),
        'hazards_count': len(characteristics.get('hazards', [])),
        'hazards_list': characteristics.get('hazards', []),
        'bottom_count': len(characteristics.get('bottom', [])),
        'bottom_list': characteristics.get('bottom', []),
        'water_quality': characteristics.get('waterQuality', ''),
        'issues': []
    }

    # Check for issues
    if not characteristics:
        analysis['issues'].append("Missing characteristics")
        return analysis

    if not analysis['crowd_factor']:
        analysis['issues'].append("Missing crowd factor")

    if not analysis['local_vibe']:
        analysis['issues'].append("Missing local vibe")

    if not analysis['hazards_list']:
        analysis['issues'].append("Missing hazards information")

    if not analysis['bottom_list']:
        analysis['issues'].append("Missing bottom information")

    if not analysis['water_quality']:
        analysis['issues'].append("Missing water quality")

    return analysis

def analyze_practicalities(practicalities: Dict) -> Dict:
    """Analyze practicalities structure and content"""
    analysis = {
        'has_practicalities': bool(practicalities),
        'has_access': bool(practicalities.get('access')),
        'access_length': len(practicalities.get('access', '')),
        'has_parking': bool(practicalities.get('parking')),
        'has_facilities': bool(practicalities.get('facilities')),
        'has_paddle_out': bool(practicalities.get('paddleOut')),
        'paddle_out_length': len(practicalities.get('paddleOut', '')),
        'recommended_boards_count': len(practicalities.get('recommendedBoards', [])),
        'recommended_boards_list': practicalities.get('recommendedBoards', []),
        'has_tips': bool(practicalities.get('additionalTips')),
        'tips_length': len(practicalities.get('additionalTips') or ''),
        'issues': []
    }

    # Check for issues
    if not practicalities:
        analysis['issues'].append("Missing practicalities")
        return analysis

    if not analysis['has_access']:
        analysis['issues'].append("Missing access information")
    elif analysis['access_length'] < 20:
        analysis['issues'].append("Access description too brief")

    if not analysis['has_parking']:
        analysis['issues'].append("Missing parking information")

    if not analysis['has_facilities']:
        analysis['issues'].append("Missing facilities information")

    if not analysis['has_paddle_out']:
        analysis['issues'].append("Missing paddle out information")
    elif analysis['paddle_out_length'] < 20:
        analysis['issues'].append("Paddle out description too brief")

    if not analysis['recommended_boards_list']:
        analysis['issues'].append("Missing recommended boards")

    # Check for very short tips
    if analysis['has_tips'] and analysis['tips_length'] < 20:
        analysis['issues'].append("Additional tips too brief")

    return analysis

def calculate_quality_score(analysis: Dict) -> int:
    """Calculate overall quality score for a spot (0-100)"""
    score = 0

    # Basic info (20 points)
    if analysis['description_length'] > 0:
        score += 5
    if analysis['description_length'] > 200:
        score += 5
    if analysis['alternative_names_count'] > 0:
        score += 2
    if analysis['coordinates_accuracy'] != 'unknown':
        score += 8

    # Wave Details (25 points)
    wd = analysis['wave_details']
    if wd['has_wave_details']:
        score += 5
    if wd['type_count'] > 0:
        score += 5
    if wd['direction_count'] > 0:
        score += 5
    if wd['ability_level_primary']:
        score += 5
    if wd['best_swell_count'] > 0 and wd['best_wind_count'] > 0:
        score += 5

    # Characteristics (25 points)
    char = analysis['characteristics']
    if char['has_characteristics']:
        score += 5
    if char['crowd_factor']:
        score += 5
    if char['local_vibe']:
        score += 5
    if char['hazards_count'] > 0:
        score += 5
    if char['bottom_count'] > 0:
        score += 5

    # Practicalities (30 points)
    pract = analysis['practicalities']
    if pract['has_practicalities']:
        score += 10
    if pract['has_access'] and pract['access_length'] > 20:
        score += 5
    if pract['has_parking']:
        score += 5
    if pract['has_facilities']:
        score += 5
    if pract['has_paddle_out'] and pract['paddle_out_length'] > 20:
        score += 5

    return min(score, 100)

def perform_comprehensive_metadata_review():
    """Perform comprehensive review of all metadata"""
    print("🔍 Starting comprehensive metadata review for all surf spots...")

    spots_data = load_surf_spots_data()
    all_spots = spots_data['spots']

    print(f"Loaded {len(all_spots)} surf spots for metadata analysis")

    analysis_results = []

    print("\n" + "="*100)
    print("COMPREHENSIVE METADATA REVIEW")
    print("="*100)

    for i, spot in enumerate(all_spots, 1):
        analysis = analyze_metadata_structure(spot)
        analysis_results.append(analysis)

        # Display detailed review
        print(f"\n{i:2d}. {analysis['spot_name']} ({analysis['spot_id']})")
        print(f"    Primary Name: {analysis['spot_name']}")
        print(f"    Alternative Names: {analysis['alternative_names_count']}")
        print(f"    Area: {analysis['location_area']}")
        print(f"    Coordinates Accuracy: {analysis['coordinates_accuracy']}")
        print(f"    Description Length: {analysis['description_length']} chars")

        # Wave Details
        wd = analysis['wave_details']
        print(f"    Wave Details: {'✅ Complete' if wd['has_wave_details'] and not wd['issues'] else '⚠️ Issues'}")
        print(f"        Wave Types: {wd['type_count']} | Directions: {wd['direction_count']} | "
              f"Swell: {wd['best_swell_count']} | Wind: {wd['best_wind_count']} | "
              f"Tide: {wd['best_tide_count']}")
        print(f"        Ability Level: {wd['ability_level_primary']} + {wd['ability_level_secondary_count']} secondary")
        if wd['issues']:
            print(f"        Issues: {'; '.join(wd['issues'])}")

        # Characteristics
        char = analysis['characteristics']
        print(f"    Characteristics: {'✅ Complete' if char['has_characteristics'] and not char['issues'] else '⚠️ Issues'}")
        print(f"        Crowd: {char['crowd_factor']} | Hazards: {char['hazards_count']} | "
              f"Bottom: {char['bottom_count']} | Water: {char['water_quality']}")
        if char['hazards_list']:
            print(f"        Hazards: {', '.join(char['hazards_list'][:3])}{'...' if len(char['hazards_list']) > 3 else ''}")
        if char['issues']:
            print(f"        Issues: {'; '.join(char['issues'])}")

        # Practicalities
        pract = analysis['practicalities']
        print(f"    Practicalities: {'✅ Complete' if pract['has_practicalities'] and not pract['issues'] else '⚠️ Issues'}")
        print(f"        Access: {'✅' if pract['has_access'] else '❌'} ({pract['access_length']} chars) | "
              f"Parking: {'✅' if pract['has_parking'] else '❌'} | "
              f"Facilities: {'✅' if pract['has_facilities'] else '❌'} | "
              f"Paddle Out: {'✅' if pract['has_paddle_out'] else '❌'} ({pract['paddle_out_length']} chars)")
        print(f"        Recommended Boards: {pract['recommended_boards_count']} | "
              f"Tips: {'✅' if pract['has_tips'] else '❌'} ({pract['tips_length']} chars)")
        if pract['recommended_boards_list']:
            print(f"        Boards: {', '.join(pract['recommended_boards_list'][:4])}{'...' if len(pract['recommended_boards_list']) > 4 else ''}")
        if pract['issues']:
            print(f"        Issues: {'; '.join(pract['issues'])}")

        # Overall Quality
        quality_grade = "A+" if analysis['quality_score'] >= 90 else \
                       "A" if analysis['quality_score'] >= 80 else \
                       "B" if analysis['quality_score'] >= 70 else \
                       "C" if analysis['quality_score'] >= 60 else "D"
        print(f"    Overall Quality: {quality_grade} ({analysis['quality_score']}/100)")

        # Collect all issues for this spot
        all_issues = wd['issues'] + char['issues'] + pract['issues']
        if all_issues:
            analysis['total_issues'] = len(all_issues)
            analysis['all_issues'] = all_issues
        else:
            analysis['total_issues'] = 0
            analysis['all_issues'] = []

    return analysis_results

def generate_metadata_summary(analysis_results: List[Dict]):
    """Generate comprehensive metadata summary"""
    print("\n" + "="*100)
    print("METADATA QUALITY SUMMARY")
    print("="*100)

    # Quality distribution
    quality_scores = [r['quality_score'] for r in analysis_results]
    quality_grades = Counter(
        "A+" if score >= 90 else
        "A" if score >= 80 else
        "B" if score >= 70 else
        "C" if score >= 60 else "D"
        for score in quality_scores
    )

    print(f"Total Spots Analyzed: {len(analysis_results)}")
    print(f"\nQuality Grade Distribution:")
    for grade in ["A+", "A", "B", "C", "D"]:
        count = quality_grades.get(grade, 0)
        percentage = (count / len(analysis_results)) * 100
        print(f"  {grade}: {count:2d} ({percentage:5.1f}%)")

    print(f"\nAverage Quality Score: {sum(quality_scores) / len(quality_scores):.1f}/100")

    # Field completeness analysis
    wave_issues = sum(len(r['wave_details']['issues']) for r in analysis_results)
    char_issues = sum(len(r['characteristics']['issues']) for r in analysis_results)
    pract_issues = sum(len(r['practicalities']['issues']) for r in analysis_results)

    print(f"\nField Completeness Issues:")
    print(f"  Wave Details: {wave_issues} total issues")
    print(f"  Characteristics: {char_issues} total issues")
    print(f"  Practicalities: {pract_issues} total issues")

    # Most common issues
    all_issues = []
    for result in analysis_results:
        all_issues.extend(result.get('all_issues', []))

    issue_counter = Counter(all_issues)
    print(f"\nMost Common Issues:")
    for issue, count in issue_counter.most_common(10):
        print(f"  {count:2d}x - {issue}")

    # Identify problematic spots
    problematic_spots = [r for r in analysis_results if r['quality_score'] < 70]
    if problematic_spots:
        print(f"\n⚠️ SPOTS REQUIRING IMPROVEMENTS ({len(problematic_spots)} spots with quality < 70):")
        for spot in sorted(problematic_spots, key=lambda x: x['quality_score']):
            print(f"  • {spot['spot_name']} - Quality: {spot['quality_score']}/100 ({len(spot['all_issues'])} issues)")

    # Perfect spots
    perfect_spots = [r for r in analysis_results if r['quality_score'] >= 95]
    if perfect_spots:
        print(f"\n🏆 EXCELLENT SPOTS ({len(perfect_spots)} spots with quality ≥ 95):")
        for spot in sorted(perfect_spots, key=lambda x: x['quality_score'], reverse=True):
            print(f"  • {spot['spot_name']} - Quality: {spot['quality_score']}/100")

    return {
        'quality_distribution': dict(quality_grades),
        'average_score': sum(quality_scores) / len(quality_scores),
        'total_issues': {
            'wave_details': wave_issues,
            'characteristics': char_issues,
            'practicalities': pract_issues
        },
        'common_issues': dict(issue_counter.most_common(20)),
        'problematic_spots': len(problematic_spots),
        'perfect_spots': len(perfect_spots)
    }

def generate_detailed_metadata_table(analysis_results: List[Dict]):
    """Generate detailed metadata comparison table"""
    print("\n" + "="*100)
    print("DETAILED METADATA COMPARISON TABLE")
    print("="*100)

    # CSV-style table for easy review
    table_content = "# Detailed Metadata Review Table\n\n"
    table_content += "| # | Spot Name | ID | Area | Quality Score | Wave Types | Directions | Ability Level | Hazards | Bottom | Access | Parking | Facilities | Issues |\n"
    table_content += "|---|-----------|----|-----|--------------|------------|------------|--------------|---------|-------|-------|--------|------------|--------|\n"

    for i, result in enumerate(analysis_results, 1):
        wd = result['wave_details']
        char = result['characteristics']
        pract = result['practicalities']

        table_content += f"| {i} | {result['spot_name']} | {result['spot_id']} | {result['location_area']} | {result['quality_score']}/100 | "
        table_content += f"{wd['type_count']} | {wd['direction_count']} | {wd['ability_level_primary']} | {char['hazards_count']} | {char['bottom_count']} | "
        table_content += f"{'✅' if pract['has_access'] else '❌'} | {'✅' if pract['has_parking'] else '❌'} | {'✅' if pract['has_facilities'] else '❌'} | {len(result.get('all_issues', []))} |\n"

    with open('/Users/frederic/github/lavolcanica/detailed_metadata_review_table.csv', 'w', encoding='utf-8') as f:
        f.write(table_content)

    print("✅ Detailed metadata table saved to: detailed_metadata_review_table.csv")

def main():
    """Main metadata review process"""
    analysis_results = perform_comprehensive_metadata_review()
    summary = generate_metadata_summary(analysis_results)
    generate_detailed_metadata_table(analysis_results)

    # Save complete results
    results_data = {
        'review_date': '2025-11-14',
        'total_spots': len(analysis_results),
        'summary': summary,
        'results': analysis_results
    }

    with open('/Users/frederic/github/lavolcanica/metadata_review_results.json', 'w', encoding='utf-8') as f:
        json.dump(results_data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Comprehensive metadata review completed!")
    print(f"📄 Results saved to: metadata_review_results.json")
    print(f"📊 Detailed table saved to: detailed_metadata_review_table.csv")

    return analysis_results, summary

if __name__ == "__main__":
    main()