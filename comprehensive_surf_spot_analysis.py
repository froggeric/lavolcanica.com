#!/usr/bin/env python3
"""
Comprehensive GPS Coordinate Verification and Metadata Enrichment Script
Processes Google Maps data to improve surf spots database with documentation
"""

import json
import os
import re
import requests
from typing import Dict, List, Tuple, Optional
import math
from urllib.parse import urlparse
import time

class SurfSpotAnalyzer:
    def __init__(self):
        self.load_data()
        self.correlation_results = self.load_correlation_results()
        self.close_spot_threshold = 1.0  # 1km threshold for considering spots as potentially confused

    def load_data(self):
        """Load all necessary data files"""
        # Main surf spots database
        with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r', encoding='utf-8') as f:
            self.spots_data = json.load(f)

        # Google Maps sources
        gm_dir = "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map"
        self.google_maps_sources = {}

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
                self.google_maps_sources[source_name] = data['surf_spots']

    def load_correlation_results(self) -> Dict:
        """Load correlation mapping results"""
        with open('/Users/frederic/github/lavolcanica/correlation_mapping_results.json', 'r', encoding='utf-8') as f:
            return json.load(f)

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two coordinates in km"""
        R = 6371.0

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

    def get_research_file_path(self, spot_id: str) -> Optional[str]:
        """Get path to research file for a spot"""
        research_dir = "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-research"

        # Try different naming patterns
        patterns = [
            f"{spot_id}-research.md",
            f"{spot_id.replace('-', '_')}-research.md",
            f"{spot_id.title()}-research.md"
        ]

        for pattern in patterns:
            path = os.path.join(research_dir, pattern)
            if os.path.exists(path):
                return path

        # Search for any file containing the spot name
        for file in os.listdir(research_dir):
            if file.endswith('.md') and spot_id.replace('-', '') in file.replace('-', '').lower():
                return os.path.join(research_dir, file)

        return None

    def fetch_url_content(self, url: str) -> Optional[str]:
        """Fetch content from a URL with error handling"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.text[:2000]  # Limit content length

        except Exception as e:
            print(f"Failed to fetch {url}: {str(e)}")
            return None

    def extract_useful_info_from_content(self, content: str, spot_name: str) -> Dict[str, str]:
        """Extract useful surf information from web content"""
        if not content:
            return {}

        useful_info = {}

        # Look for surf-related information
        patterns = {
            'wave_characteristics': r'(wave|break|swell|surf).*?(?:is|provides|offers).*?[.!?]',
            'ability_level': r'(beginner|intermediate|advanced|expert|pro).*?(?:suitable|level|only)',
            'bottom_type': r'(bottom|reef|sand|rock|lava).*?(?:is|made of|consists)',
            'best_conditions': r'(best|ideal|optimal).*?(?:condition|time|season|wind|swell)',
            'hazards': r'(hazard|danger|risk|warning|careful).*?[.!?]',
            'access': r'(access|get|reach|park).*?[.!?]'
        }

        content_lower = content.lower()

        for category, pattern in patterns.items():
            matches = re.findall(pattern, content_lower, re.IGNORECASE)
            if matches:
                # Clean up matches and get the most relevant one
                best_match = max(matches, key=len) if matches else ""
                if len(best_match) > 10:  # Filter out very short matches
                    useful_info[category] = best_match[:200]  # Limit length

        return useful_info

    def analyze_spot_correlations(self, spot_id: str) -> Dict:
        """Analyze all correlations for a specific surf spot"""
        correlations = [c for c in self.correlation_results['correlations'] if c['matched_id'] == spot_id]

        if not correlations:
            return {'status': 'no_correlations_found'}

        # Group by confidence level
        high_conf = [c for c in correlations if c['confidence'] == 'HIGH']
        med_conf = [c for c in correlations if c['confidence'] == 'MEDIUM']
        low_conf = [c for c in correlations if c['confidence'] == 'LOW']

        # Calculate coordinate averages from high confidence matches
        if high_conf:
            avg_lat = sum(c['google_lat'] for c in high_conf) / len(high_conf)
            avg_lng = sum(c['google_lng'] for c in high_conf) / len(high_conf)

            # Calculate variance
            lat_variance = sum((c['google_lat'] - avg_lat) ** 2 for c in high_conf) / len(high_conf)
            lng_variance = sum((c['google_lng'] - avg_lng) ** 2 for c in high_conf) / len(high_conf)

            coordinate_variance = math.sqrt(lat_variance + lng_variance) * 111000  # Convert to meters
        else:
            avg_lat = avg_lng = None
            coordinate_variance = None

        return {
            'status': 'correlations_found',
            'total_correlations': len(correlations),
            'high_confidence': len(high_conf),
            'medium_confidence': len(med_conf),
            'low_confidence': len(low_conf),
            'high_confidence_matches': high_conf,
            'proposed_coordinates': {
                'lat': avg_lat,
                'lng': avg_lng,
                'variance_meters': coordinate_variance,
                'confidence': 'HIGH' if coordinate_variance and coordinate_variance < 100 else 'MEDIUM'
            } if avg_lat else None
        }

    def process_descriptions_from_sources(self, correlations: List[Dict]) -> Dict[str, List[Dict]]:
        """Process and extract information from Google Maps descriptions"""
        descriptions_by_source = {}

        for correlation in correlations:
            source = correlation['google_source']
            google_name = correlation['google_name']

            # Find the original Google Maps spot data to get description
            source_data = None
            for source_name, spots in self.google_maps_sources.items():
                if source_name in source.lower():
                    for spot in spots:
                        if spot['name'] == google_name:
                            source_data = spot
                            break
                    if source_data:
                        break

            if source_data and source_data.get('description'):
                desc = source_data['description']
                if desc and desc.strip() and desc != 'Surf Spot':  # Filter out generic descriptions
                    if source not in descriptions_by_source:
                        descriptions_by_source[source] = []

                    descriptions_by_source[source].append({
                        'google_name': google_name,
                        'description': desc,
                        'confidence': correlation['confidence'],
                        'distance_km': correlation['distance_km']
                    })

        return descriptions_by_source

    def process_urls_from_sources(self, correlations: List[Dict]) -> Dict[str, List[Dict]]:
        """Process URLs from surfermap and other sources"""
        url_data = {}

        for correlation in correlations:
            source = correlation['google_source']
            google_name = correlation['google_name']

            # Find the original Google Maps spot data to get URL
            source_data = None
            for source_name, spots in self.google_maps_sources.items():
                if source_name in source.lower():
                    for spot in spots:
                        if spot['name'] == google_name and 'url' in spot:
                            source_data = spot
                            break
                    if source_data:
                        break

            if source_data and source_data.get('url'):
                url = source_data['url']
                if source not in url_data:
                    url_data[source] = []

                url_data[source].append({
                    'google_name': google_name,
                    'url': url,
                    'confidence': correlation['confidence'],
                    'distance_km': correlation['distance_km'],
                    'extracted_content': None
                })

        return url_data

    def generate_research_update(self, spot_id: str) -> Dict:
        """Generate comprehensive research update for a surf spot"""
        spot = next((s for s in self.spots_data['spots'] if s['id'] == spot_id), None)
        if not spot:
            return {'error': f'Spot {spot_id} not found'}

        # Analyze correlations
        correlation_analysis = self.analyze_spot_correlations(spot_id)

        if correlation_analysis['status'] == 'no_correlations_found':
            return {'error': f'No correlations found for {spot_id}'}

        correlations = correlation_analysis['high_confidence_matches'] + correlation_analysis.get('medium_confidence_matches', [])

        # Process descriptions
        descriptions = self.process_descriptions_from_sources(correlations)

        # Process URLs
        url_data = self.process_urls_from_sources(correlations)

        # Extract content from URLs
        for source, urls in url_data.items():
            for url_info in urls:
                if url_info['url']:
                    content = self.fetch_url_content(url_info['url'])
                    useful_info = self.extract_useful_info_from_content(content, spot['primaryName'])
                    url_info['extracted_content'] = useful_info

        # Research file path
        research_path = self.get_research_file_path(spot_id)

        return {
            'spot_id': spot_id,
            'spot_name': spot['primaryName'],
            'current_coordinates': spot['location']['coordinates'],
            'research_file_path': research_path,
            'correlation_analysis': correlation_analysis,
            'descriptions_from_sources': descriptions,
            'url_data': url_data,
            'recommendations': self.generate_recommendations(correlation_analysis, descriptions, url_data)
        }

    def generate_recommendations(self, correlation_analysis: Dict, descriptions: Dict, url_data: Dict) -> List[str]:
        """Generate specific recommendations for spot updates"""
        recommendations = []

        # Coordinate recommendations
        if correlation_analysis.get('proposed_coordinates'):
            coords = correlation_analysis['proposed_coordinates']
            if coords['variance_meters'] and coords['variance_meters'] < 100:
                recommendations.append(
                    f"UPDATE COORDINATES to {coords['lat']:.7f}, {coords['lng']:.7f} "
                    f"(variance: {coords['variance_meters']:.0f}m, confidence: {coords['confidence']})"
                )
            else:
                recommendations.append(
                    f"REVIEW COORDINATES - high variance ({coords['variance_meters']:.0f}m) "
                    f"suggests potential spot confusion"
                )

        # Description recommendations
        if descriptions:
            total_useful_descriptions = sum(len(descs) for descs in descriptions.values())
            recommendations.append(f"ENHANCE DESCRIPTION with information from {total_useful_descriptions} Google Maps sources")

        # URL content recommendations
        if url_data:
            total_urls = sum(len(urls) for urls in url_data.values())
            recommendations.append(f"INTEGRATE URL CONTENT from {total_urls} external sources for enriched metadata")

        return recommendations

    def generate_markdown_update(self, research_data: Dict) -> str:
        """Generate markdown content for research file update"""
        if 'error' in research_data:
            return f"# Error\n\n{research_data['error']}"

        spot_name = research_data['spot_name']
        spot_id = research_data['spot_id']
        current_coords = research_data['current_coordinates']
        correlation_analysis = research_data['correlation_analysis']
        descriptions = research_data['descriptions_from_sources']
        url_data = research_data['url_data']
        recommendations = research_data['recommendations']

        markdown = f"""# {spot_name} GPS Coordinate Research - Google Maps Integration

**Spot ID:** {spot_id}
**Primary Name:** {spot_name}
**Current JSON Coordinates:** {current_coords['lat']}, {current_coords['lng']} ({current_coords.get('accuracy', 'unknown')})

## Google Maps Integration Analysis

### Correlation Summary
- **Total Google Maps Matches:** {correlation_analysis['total_correlations']}
- **High Confidence:** {correlation_analysis['high_confidence']}
- **Medium Confidence:** {correlation_analysis['medium_confidence']}
- **Low Confidence:** {correlation_analysis['low_confidence']}

"""

        # Coordinate analysis
        if correlation_analysis.get('proposed_coordinates'):
            coords = correlation_analysis['proposed_coordinates']
            markdown += f"""### Coordinate Verification Analysis

**Current JSON Coordinates:** {current_coords['lat']}, {current_coords['lng']}
**Google Maps Proposed:** {coords['lat']:.7f}, {coords['lng']:.7f}
**Coordinate Variance:** {coords['variance_meters']:.1f} meters
**Confidence Level:** {coords['confidence']}

"""

            if coords['variance_meters'] < 50:
                markdown += "**Assessment:** EXCELLENT coordinate match - Google Maps validates existing coordinates\n\n"
            elif coords['variance_meters'] < 100:
                markdown += "**Assessment:** GOOD coordinate match - minor adjustment recommended\n\n"
            else:
                markdown += "**Assessment:** REQUIRES REVIEW - high variance suggests potential spot confusion\n\n"

        # Source descriptions
        if descriptions:
            markdown += "### Google Maps Source Descriptions\n\n"
            for source, descs in descriptions.items():
                markdown += f"**{source}:**\n"
                for desc in descs:
                    if desc['description'] and len(desc['description'].strip()) > 10:
                        markdown += f"- {desc['description']} (confidence: {desc['confidence']}, distance: {desc['distance_km']:.2f}km)\n"
                markdown += "\n"

        # URL content
        if url_data:
            markdown += "### External Source Content Analysis\n\n"
            for source, urls in url_data.items():
                markdown += f"**{source} URLs:**\n"
                for url_info in urls:
                    markdown += f"- **{url_info['google_name']}**\n"
                    markdown += f"  URL: {url_info['url']}\n"
                    if url_info['extracted_content']:
                        extracted = url_info['extracted_content']
                        for category, info in extracted.items():
                            markdown += f"  - {category.replace('_', ' ').title()}: {info}\n"
                    markdown += "\n"

        # Recommendations
        if recommendations:
            markdown += "### Recommendations\n\n"
            for i, rec in enumerate(recommendations, 1):
                markdown += f"{i}. **{rec}**\n"
            markdown += "\n"

        # Sources section
        markdown += "### Google Maps Integration Sources\n\n"
        sources_mentioned = set()
        for correlation in correlation_analysis.get('high_confidence_matches', []):
            sources_mentioned.add(correlation['google_source'])

        for source in sorted(sources_mentioned):
            markdown += f"- {source}\n"

        return markdown

    def process_all_spots(self) -> Dict:
        """Process all surf spots and generate updates"""
        results = {}

        for spot in self.spots_data['spots']:
            spot_id = spot['id']
            print(f"Processing {spot_id}...")

            try:
                research_data = self.generate_research_update(spot_id)
                markdown_update = self.generate_markdown_update(research_data)

                results[spot_id] = {
                    'research_data': research_data,
                    'markdown_update': markdown_update
                }

                # Small delay to be respectful to web servers
                time.sleep(0.5)

            except Exception as e:
                print(f"Error processing {spot_id}: {str(e)}")
                results[spot_id] = {'error': str(e)}

        return results

def main():
    print("Starting comprehensive surf spot analysis...")

    analyzer = SurfSpotAnalyzer()

    # Process all spots
    results = analyzer.process_all_spots()

    # Save comprehensive results
    output_file = "/Users/frederic/github/lavolcanica/comprehensive_analysis_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"Comprehensive analysis saved to {output_file}")

    # Generate summary statistics
    successful = len([r for r in results.values() if 'error' not in r])
    total = len(results)

    print(f"\nSummary:")
    print(f"  Total spots processed: {total}")
    print(f"  Successful analyses: {successful}")
    print(f"  Errors: {total - successful}")

    return results

if __name__ == "__main__":
    main()