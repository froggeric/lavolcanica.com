#!/usr/bin/env python3
"""
Update Individual Research Files with Google Maps Integration Findings
"""

import json
import os
from datetime import datetime
from typing import Dict

def load_comprehensive_analysis():
    """Load the comprehensive analysis results"""
    with open('/Users/frederic/github/lavolcanica/comprehensive_analysis_results.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_research_file_path(spot_id: str) -> str:
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

def update_research_file(spot_id: str, analysis_data: Dict) -> bool:
    """Update individual research file with Google Maps findings"""
    research_path = get_research_file_path(spot_id)

    if not research_path:
        print(f"No research file found for {spot_id}")
        return False

    if 'error' in analysis_data:
        print(f"Error in analysis data for {spot_id}: {analysis_data['error']}")
        return False

    # Read existing file content
    try:
        with open(research_path, 'r', encoding='utf-8') as f:
            existing_content = f.read()
    except:
        existing_content = f"# {analysis_data['spot_name']} Research\n\nResearch file not found - creating new file.\n\n"

    # Get the markdown update
    markdown_update = analysis_data['markdown_update']

    # Combine existing content with new Google Maps integration section
    updated_content = f"""{existing_content}

---

## Google Maps Integration Research
*Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*

{markdown_update}

---

## Google Maps Integration Summary

**Sources Analyzed:**
- FreshSurf surfspots aus Fuerteventura
- Surf and Unwind surf guide Fuerteventura
- surfermap Fuerteventura
- Surfspots Fuerteventura Planet Surfcamps

**Coordinate Verification Status:**
{generate_coordinate_status(analysis_data)}

**Recommendations Implemented:**
{generate_recommendations_status(analysis_data)}

**Confidence Level:** {analysis_data['research_data']['correlation_analysis'].get('proposed_coordinates', {}).get('confidence', 'UNKNOWN')}
"""

    # Write updated content
    try:
        with open(research_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Updated research file: {research_path}")
        return True
    except Exception as e:
        print(f"Error updating {research_path}: {str(e)}")
        return False

def generate_coordinate_status(analysis_data: Dict) -> str:
    """Generate coordinate verification status"""
    corr_analysis = analysis_data['research_data']['correlation_analysis']

    if corr_analysis.get('proposed_coordinates'):
        coords = corr_analysis['proposed_coordinates']
        current = analysis_data['research_data']['current_coordinates']

        if coords['variance_meters'] and coords['variance_meters'] < 50:
            return f"✅ **VERIFIED** - Google Maps confirms existing coordinates within {coords['variance_meters']:.0f}m"
        elif coords['variance_meters'] and coords['variance_meters'] < 100:
            return f"⚠️ **MINOR UPDATE RECOMMENDED** - {coords['variance_meters']:.0f}m variance from Google Maps consensus"
        else:
            return f"🚨 **REVIEW REQUIRED** - High variance ({coords['variance_meters']:.0f}m) suggests potential coordinate error"
    else:
        return "❓ **INSUFFICIENT DATA** - No high-confidence coordinate matches found"

def generate_recommendations_status(analysis_data: Dict) -> str:
    """Generate recommendations implementation status"""
    recommendations = analysis_data['research_data']['recommendations']

    if not recommendations:
        return "No specific recommendations generated."

    status_lines = []
    for rec in recommendations:
        if "UPDATE COORDINATES" in rec:
            status_lines.append("📍 **Coordinate Update:** Ready for implementation")
        elif "REVIEW COORDINATES" in rec:
            status_lines.append("🔍 **Coordinate Review:** Manual verification required")
        elif "ENHANCE DESCRIPTION" in rec:
            status_lines.append("📝 **Description Enhancement:** Rich content available from Google Maps")
        elif "INTEGRATE URL CONTENT" in rec:
            status_lines.append("🌐 **URL Integration:** External content extracted and ready")

    return '\n'.join(status_lines) if status_lines else "Standard recommendations applied."

def create_coordinate_update_script() -> str:
    """Create a script with specific coordinate updates"""
    analysis = load_comprehensive_analysis()

    coordinate_updates = []

    for spot_id, data in analysis.items():
        if 'error' in data:
            continue

        research_data = data['research_data']
        corr_analysis = research_data['correlation_analysis']

        if corr_analysis.get('proposed_coordinates'):
            coords = corr_analysis['proposed_coordinates']
            current = research_data['current_coordinates']

            # Only include updates with reasonable variance
            if coords['variance_meters'] and coords['variance_meters'] < 500:
                coordinate_updates.append({
                    'spot_id': spot_id,
                    'spot_name': research_data['spot_name'],
                    'current_lat': current['lat'],
                    'current_lng': current['lng'],
                    'proposed_lat': coords['lat'],
                    'proposed_lng': coords['lng'],
                    'variance_meters': coords['variance_meters'],
                    'confidence': coords['confidence'],
                    'total_matches': corr_analysis['total_correlations'],
                    'high_conf_matches': corr_analysis['high_confidence']
                })

    # Sort by variance (lowest first)
    coordinate_updates.sort(key=lambda x: x['variance_meters'])

    # Generate the update script
    script_content = f'''#!/usr/bin/env python3
"""
GPS Coordinate Updates Based on Google Maps Integration Analysis
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Total Updates: {len(coordinate_updates)}
"""

import json

# Load current data
with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Coordinate updates based on Google Maps analysis
updates = {json.dumps(coordinate_updates, indent=2)}

# Apply updates
updated_spots = []
for spot in data['spots']:
    spot_id = spot['id']

    if spot_id in updates:
        update = updates[spot_id]

        # Update coordinates
        spot['location']['coordinates']['lat'] = update['proposed_lat']
        spot['location']['coordinates']['lng'] = update['proposed_lng']

        # Update accuracy status
        if update['variance_meters'] < 50:
            spot['location']['coordinates']['accuracy'] = 'google_maps_verified'
        elif update['variance_meters'] < 100:
            spot['location']['coordinates']['accuracy'] = 'google_maps_confirmed'
        else:
            spot['location']['coordinates']['accuracy'] = 'requires_review'

        print(f"Updated {{spot['primaryName']}}: {{update['current_lat']}} → {{update['proposed_lat']}} ({{update['variance_meters']:.1f}}m)")

    updated_spots.append(spot)

# Save updated data
data['spots'] = updated_spots

with open('/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\\nCoordinate updates completed. {{len([u for u in updates.values() if u['variance_meters'] < 100])}} spots verified with high confidence.")
'''

    return script_content

def main():
    """Main update process"""
    print("Loading comprehensive analysis results...")
    analysis = load_comprehensive_analysis()

    print(f"Processing {len(analysis)} surf spots for research file updates...")

    updated_count = 0
    error_count = 0

    for spot_id, data in analysis.items():
        try:
            if update_research_file(spot_id, data):
                updated_count += 1
            else:
                error_count += 1
        except Exception as e:
            print(f"Error processing {spot_id}: {str(e)}")
            error_count += 1

    print(f"\nResearch file updates completed:")
    print(f"  Successfully updated: {updated_count}")
    print(f"  Errors: {error_count}")

    # Create coordinate update script
    print("\nGenerating coordinate update script...")
    script_content = create_coordinate_update_script()

    with open('/Users/frederic/github/lavolcanica/apply_coordinate_updates.py', 'w', encoding='utf-8') as f:
        f.write(script_content)

    print("Coordinate update script created: apply_coordinate_updates.py")
    print("\nTo apply coordinate updates, run:")
    print("  python3 apply_coordinate_updates.py")

if __name__ == "__main__":
    main()