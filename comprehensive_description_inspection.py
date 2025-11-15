#!/usr/bin/env python3
"""
Comprehensive Description Inspection Against Individual Markdown Research Files
Compare all JSON descriptions with corresponding research files for completeness and accuracy
"""

import json
import os
import re
from typing import Dict, List, Tuple, Optional

def load_all_data():
    """Load all necessary data files"""
    # Load main surf spots database
    with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r', encoding='utf-8') as f:
        spots_data = json.load(f)

    # Load Google Maps sources for comparison
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

def get_research_file_path(spot_id: str, spot_name: str) -> Optional[str]:
    """Find the research file path for a spot using multiple methods"""
    research_dir = "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-research"

    # Method 1: Exact match with spot_id
    exact_match = os.path.join(research_dir, f"{spot_id}-research.md")
    if os.path.exists(exact_match):
        return exact_match

    # Method 2: Try different naming variations
    variations = [
        f"{spot_id.replace('-', '_')}-research.md",
        f"{spot_name.lower().replace(' ', '-')}-research.md",
        f"{spot_name.lower().replace(' ', '_')}-research.md"
    ]

    for variation in variations:
        path = os.path.join(research_dir, variation)
        if os.path.exists(path):
            return path

    # Method 3: Search for files containing the spot name
    try:
        for file in os.listdir(research_dir):
            if file.endswith('.md'):
                file_path = os.path.join(research_dir, file)
                # Check if file contains spot name variations
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().lower()
                    if (spot_id.replace('-', '') in content or
                        spot_name.lower() in content):
                        return file_path
    except Exception as e:
        print(f"Error searching for research file for {spot_name}: {str(e)}")

    return None

def extract_google_maps_descriptions(spot_name: str, alternative_names: List[str], google_maps_sources: Dict) -> List[Dict]:
    """Extract all Google Maps descriptions for a spot"""
    descriptions = []
    search_names = [spot_name.lower()] + [name.lower() for name in alternative_names]

    for source_name, spots in google_maps_sources.items():
        for gm_spot in spots:
            if not gm_spot or not gm_spot.get('name'):
                continue

            gm_name = gm_spot['name'].lower()
            gm_desc = gm_spot.get('description', '')

            # Check for name match
            for search_name in search_names:
                if search_name in gm_name or gm_name in search_name:
                    if gm_desc and len(gm_desc.strip()) > 20 and gm_desc != 'Surf Spot':
                        descriptions.append({
                            'source': source_name.replace('_', ' ').title(),
                            'google_name': gm_spot['name'],
                            'description': gm_desc,
                            'url': gm_spot.get('url', None)
                        })
                    break

    return descriptions

def extract_useful_info_from_description(description: str) -> Dict[str, str]:
    """Extract structured information from descriptions"""
    if not description or len(description.strip()) < 10:
        return {}

    useful_info = {}
    desc = description.lower()

    # Wave characteristics
    if any(word in desc for word in ['reef break', 'reef']):
        useful_info['wave_type'] = 'reef_break'
    elif any(word in desc for word in ['beach break', 'beach']):
        useful_info['wave_type'] = 'beach_break'
    elif any(word in desc for word in ['point break', 'point']):
        useful_info['wave_type'] = 'point_break'

    # Ability level
    if 'beginner' in desc:
        useful_info['ability_level'] = 'beginner_friendly'
    elif 'intermediate' in desc:
        useful_info['ability_level'] = 'intermediate_suitable'
    elif any(word in desc for word in ['advanced', 'expert', 'pro']):
        useful_info['ability_level'] = 'advanced_expert_only'

    # Wave characteristics
    if 'barrel' in desc or 'tube' in desc or 'tub' in desc:
        useful_info['wave_shape'] = 'barreling_sections'
    if 'hollow' in desc:
        useful_info['wave_shape'] = 'hollow_waves'
    if 'powerful' in desc or 'strong' in desc:
        useful_info['wave_power'] = 'powerful_waves'
    if 'fast' in desc:
        useful_info['wave_speed'] = 'fast_waves'
    if 'mellow' in desc or 'gentle' in desc or 'easy' in desc:
        useful_info['wave_power'] = 'mellow_waves'

    # Bottom type
    if 'sand' in desc:
        useful_info['bottom'] = 'sand'
    elif any(word in desc for word in ['rock', 'rocks']):
        useful_info['bottom'] = 'rocky'
    elif 'lava' in desc:
        useful_info['bottom'] = 'volcanic_lava'
    elif 'reef' in desc:
        useful_info['bottom'] = 'reef'

    # Best conditions
    if any(word in desc for word in ['works best', 'best', 'ideal', 'optimal']):
        useful_info['has_best_conditions'] = True

    # Facilities/access
    if 'parking' in desc:
        useful_info['has_parking'] = True
    if 'facilities' in desc:
        useful_info['has_facilities'] = True
    if any(word in desc for word in ['beginner', 'school', 'teach']):
        useful_info['good_for_learning'] = True

    return useful_info

def analyze_description_completeness(json_desc: str, research_content: str, google_maps_descs: List[Dict]) -> Dict:
    """Analyze completeness and quality of descriptions"""
    analysis = {
        'json_description_length': len(json_desc) if json_desc else 0,
        'research_file_exists': bool(research_content),
        'research_content_length': len(research_content) if research_content else 0,
        'google_maps_descriptions_count': len(google_maps_descs),
        'completeness_score': 0,
        'information_gaps': [],
        'enhancement_opportunities': [],
        'quality_rating': 'UNKNOWN'
    }

    # Calculate completeness score (0-100)
    score = 0

    # JSON description quality (40 points)
    if json_desc:
        if len(json_desc) > 500:
            score += 40
        elif len(json_desc) > 200:
            score += 30
        elif len(json_desc) > 100:
            score += 20
        elif len(json_desc) > 50:
            score += 10
    else:
        analysis['information_gaps'].append('No description in JSON')

    # Research file quality (30 points)
    if research_content:
        if len(research_content) > 5000:
            score += 30
        elif len(research_content) > 2000:
            score += 25
        elif len(research_content) > 1000:
            score += 20
        elif len(research_content) > 500:
            score += 15
        elif len(research_content) > 200:
            score += 10
    else:
        analysis['information_gaps'].append('No research file found')

    # Google Maps descriptions (30 points)
    if google_maps_descs:
        score += min(len(google_maps_descs) * 10, 30)
    else:
        analysis['information_gaps'].append('No Google Maps descriptions')

    analysis['completeness_score'] = score

    # Determine quality rating
    if score >= 80:
        analysis['quality_rating'] = 'EXCELLENT'
    elif score >= 60:
        analysis['quality_rating'] = 'GOOD'
    elif score >= 40:
        analysis['quality_rating'] = 'FAIR'
    else:
        analysis['quality_rating'] = 'POOR'

    # Identify enhancement opportunities
    if not research_content:
        analysis['enhancement_opportunities'].append('Create research file')

    if not google_maps_descs:
        analysis['enhancement_opportunities'].append('Find Google Maps representation')

    if json_desc and len(json_desc) < 200:
        analysis['enhancement_opportunities'].append('Enhance JSON description')

    # Check for Google Maps integration
    if json_desc and 'Google Maps' not in json_desc and google_maps_descs:
        analysis['enhancement_opportunities'].append('Integrate Google Maps content')

    return analysis

def perform_description_inspection():
    """Perform comprehensive description inspection"""
    print("🔍 Starting comprehensive description inspection...")

    spots_data, google_maps_sources = load_all_data()

    print(f"Loaded {len(spots_data['spots'])} surf spots from JSON database")
    print(f"Loaded Google Maps data from {len(google_maps_sources)} sources")

    inspection_results = []

    print("\n" + "="*80)
    print("COMPREHENSIVE DESCRIPTION INSPECTION")
    print("="*80)

    for i, spot in enumerate(spots_data['spots'], 1):
        spot_id = spot['id']
        spot_name = spot['primaryName']
        alternative_names = spot.get('alternativeNames', [])
        json_description = spot.get('description', '')

        # Get research file content
        research_path = get_research_file_path(spot_id, spot_name)
        research_content = ""
        if research_path:
            try:
                with open(research_path, 'r', encoding='utf-8') as f:
                    research_content = f.read()
            except Exception as e:
                print(f"Error reading research file for {spot_name}: {str(e)}")

        # Get Google Maps descriptions
        google_maps_descs = extract_google_maps_descriptions(spot_name, alternative_names, google_maps_sources)

        # Analyze completeness
        analysis = analyze_description_completeness(json_description, research_content, google_maps_descs)

        # Extract useful information
        useful_info = {}
        all_descriptions = [json_description] + [gm['description'] for gm in google_maps_descs]
        for desc in all_descriptions:
            extracted = extract_useful_info_from_description(desc)
            useful_info.update(extracted)

        inspection_results.append({
            'index': i,
            'spot_id': spot_id,
            'spot_name': spot_name,
            'alternative_names': alternative_names,
            'json_description': json_description,
            'json_length': len(json_description) if json_description else 0,
            'research_file_path': research_path,
            'research_content_length': len(research_content) if research_content else 0,
            'google_maps_descriptions': google_maps_descs,
            'analysis': analysis,
            'useful_information': useful_info
        })

        # Display inspection results
        print(f"\n{i:2d}. {spot_name} ({spot_id})")
        print(f"    JSON Description Length: {len(json_description) if json_description else 0} chars")
        print(f"    Research File: {'✅ Found' if research_path else '❌ Missing'} ({len(research_content) if research_content else 0} chars)")
        print(f"    Google Maps Descriptions: {len(google_maps_descs)} sources")
        print(f"    Quality Rating: {analysis['quality_rating']} (Score: {analysis['completeness_score']}/100)")

        # Show useful info extracted
        if useful_info:
            print(f"    Extracted Info: {', '.join([f'{k}={v}' for k, v in useful_info.items()])}")

        # Show gaps and opportunities
        if analysis['information_gaps']:
            print(f"    Gaps: {', '.join(analysis['information_gaps'])}")
        if analysis['enhancement_opportunities']:
            print(f"    Opportunities: {', '.join(analysis['enhancement_opportunities'])}")

        # Show Google Maps descriptions if available
        if google_maps_descs:
            print(f"    Google Maps Sources:")
            for j, gm_desc in enumerate(google_maps_descs[:2], 1):  # Show top 2
                desc_preview = gm_desc['description'][:100] + "..." if len(gm_desc['description']) > 100 else gm_desc['description']
                print(f"      {j}. {gm_desc['source']}: {desc_preview}")

    return inspection_results

def generate_description_summary(inspection_results: List[Dict]):
    """Generate comprehensive summary of description inspection"""
    print("\n" + "="*80)
    print("DESCRIPTION INSPECTION SUMMARY")
    print("="*80)

    # Quality rating distribution
    quality_counts = {}
    gap_counts = {}
    opportunity_counts = {}

    for result in inspection_results:
        rating = result['analysis']['quality_rating']
        quality_counts[rating] = quality_counts.get(rating, 0) + 1

        for gap in result['analysis']['information_gaps']:
            gap_counts[gap] = gap_counts.get(gap, 0) + 1

        for opportunity in result['analysis']['enhancement_opportunities']:
            opportunity_counts[opportunity] = opportunity_counts.get(opportunity, 0) + 1

    print(f"Total Spots Analyzed: {len(inspection_results)}")
    print(f"\nQuality Rating Distribution:")
    for rating in ['EXCELLENT', 'GOOD', 'FAIR', 'POOR']:
        count = quality_counts.get(rating, 0)
        percentage = (count / len(inspection_results)) * 100
        print(f"  {rating}: {count} ({percentage:.1f}%)")

    print(f"\nInformation Gaps (Issues to Address):")
    for gap, count in sorted(gap_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {gap}: {count} spots")

    print(f"\nEnhancement Opportunities:")
    for opportunity, count in sorted(opportunity_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {opportunity}: {count} spots")

    # Identify priority spots for enhancement
    poor_quality = [r for r in inspection_results if r['analysis']['quality_rating'] == 'POOR']
    fair_quality = [r for r in inspection_results if r['analysis']['quality_rating'] == 'FAIR']

    if poor_quality:
        print(f"\n🚨 PRIORITY FIXES NEEDED ({len(poor_quality)} spots with POOR quality):")
        for result in poor_quality:
            print(f"  • {result['spot_name']} (Score: {result['analysis']['completeness_score']})")

    if fair_quality:
        print(f"\n⚠️ IMPROVEMENTS RECOMMENDED ({len(fair_quality)} spots with FAIR quality):")
        for result in fair_quality:
            print(f"  • {result['spot_name']} (Score: {result['analysis']['completeness_score']})")

    return {
        'quality_counts': quality_counts,
        'gap_counts': gap_counts,
        'opportunity_counts': opportunity_counts,
        'poor_quality_spots': len(poor_quality),
        'fair_quality_spots': len(fair_quality)
    }

def main():
    """Main description inspection process"""
    inspection_results = perform_description_inspection()
    summary = generate_description_summary(inspection_results)

    # Save results
    results_data = {
        'inspection_date': '2025-11-14',
        'total_spots': len(inspection_results),
        'summary': summary,
        'results': inspection_results
    }

    with open('/Users/frederic/github/lavolcanica/description_inspection_results.json', 'w', encoding='utf-8') as f:
        json.dump(results_data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Description inspection completed!")
    print(f"📄 Results saved to: description_inspection_results.json")

    return inspection_results

if __name__ == "__main__":
    main()