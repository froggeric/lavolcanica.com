#!/usr/bin/env python3
"""
Test the improved extraction with Rocky Point
"""

import sys
sys.path.append('/Users/frederic/github/lavolcanica')

from surf_spot_scraper import SurfSpotScraper

def test_rocky_point_extraction():
    """Test Rocky Point extraction with improved methods"""
    json_file = "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/surfline fuerteventura surf spots.json"

    # Create scraper
    scraper = SurfSpotScraper(json_file)

    # Find Rocky Point in the data
    for spot in scraper.spots_data['surf_spots']:
        if 'Rocky Point' in spot['name']:
            print(f"Testing extraction for: {spot['name']}")
            print(f"URL: {spot['url']}")

            # Get the spot guide content
            soup = scraper.get_spot_guide_content(spot['url'])

            if soup:
                print("✅ Successfully fetched content")

                # Extract characteristics
                characteristics = scraper.extract_spot_characteristics(soup)

                print(f"\n📋 EXTRACTED CHARACTERISTICS:")
                print("=" * 50)

                if characteristics:
                    for key, value in characteristics.items():
                        print(f"{key}: {value}")
                else:
                    print("No characteristics extracted")

                # Save to test file
                enriched_spot = spot.copy()
                enriched_spot['surfline_characteristics'] = characteristics
                enriched_spot['gps_verified'] = True

                import json
                with open('/Users/frederic/github/lavolcanica/rocky_point_test_output.json', 'w', encoding='utf-8') as f:
                    json.dump([enriched_spot], f, indent=2, ensure_ascii=False)

                print(f"\n💾 Saved to: rocky_point_test_output.json")

            else:
                print("❌ Failed to fetch content")
            break

if __name__ == "__main__":
    test_rocky_point_extraction()