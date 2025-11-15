#!/usr/bin/env python3
"""
Debug the extraction logic for Rocky Point
"""

import sys
sys.path.append('/Users/frederic/github/lavolcanica')

from surf_spot_scraper import SurfSpotScraper
from bs4 import BeautifulSoup
import json

def debug_rocky_point_extraction():
    """Debug Rocky Point extraction"""
    json_file = "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/surfline fuerteventura surf spots.json"

    # Create scraper
    scraper = SurfSpotScraper(json_file)

    # Find Rocky Point
    for spot in scraper.spots_data['surf_spots']:
        if 'Rocky Point' in spot['name']:
            print(f"Debugging extraction for: {spot['name']}")

            # Get the spot guide content
            soup = scraper.get_spot_guide_content(spot['url'])

            if soup:
                print("✅ Successfully fetched content")

                # Debug: Look for headings
                print("\n=== DEBUGGING HEADINGS ===")
                headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                for i, heading in enumerate(headings):
                    text = heading.get_text().strip()
                    if text:
                        print(f"{i+1}. {heading.name}: '{text}'")

                        # Try to get content after this heading
                        content = scraper.get_content_after_heading(heading)
                        if content:
                            print(f"   Content: {content[:100]}...")
                        else:
                            print(f"   Content: None")

                # Debug: Look for specific text we know exists
                print("\n=== DEBUGGING SPECIFIC TEXT ===")
                text_content = soup.get_text()
                known_phrases = [
                    "Ideal Surf Conditions",
                    "Swell Direction",
                    "Wind",
                    "Surf Height",
                    "Tide",
                    "Ability Level",
                    "Hazards",
                    "Big NW",
                    "Waist high to overhead"
                ]

                for phrase in known_phrases:
                    if phrase in text_content:
                        print(f"✅ Found: {phrase}")
                        # Find surrounding context
                        index = text_content.find(phrase)
                        context = text_content[max(0, index-50):index+100]
                        print(f"   Context: ...{context}...")
                    else:
                        print(f"❌ Missing: {phrase}")

                # Debug: Save HTML for manual inspection
                with open('/Users/frederic/github/lavolcanica/debug_rocky_point.html', 'w', encoding='utf-8') as f:
                    f.write(str(soup.prettify()))
                print(f"\n💾 HTML saved to: debug_rocky_point.html")

                # Try extraction again with verbose output
                print("\n=== RETRYING EXTRACTION ===")
                characteristics = scraper.extract_spot_characteristics(soup)
                print(f"Extracted {len(characteristics)} characteristics")
                for key, value in characteristics.items():
                    print(f"  {key}: {value}")

            break

if __name__ == "__main__":
    debug_rocky_point_extraction()