#!/usr/bin/env python3
"""
Surf Spot Information Scraper for Fuerteventura
Processes surf spots from JSON file and enriches them with data from Surfline spot guides
"""

import json
import requests
import cloudscraper
import time
import re
import random
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs
import os
from typing import Dict, List, Optional, Tuple

class SurfSpotScraper:
    def __init__(self, json_file_path: str):
        self.json_file_path = json_file_path
        self.session = requests.Session()
        self.cloudscraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'darwin',
                'desktop': True,
                'mobile': False
            },
            delay=10,  # Add delay between requests
            allow_brotli=True
        )
        self.setup_session()
        self.spots_data = self.load_json_data()

    def get_random_user_agent(self) -> str:
        """Get a random user agent to avoid detection"""
        user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
        ]
        return random.choice(user_agents)

    def setup_session(self):
        """Setup session with headers to avoid bot detection"""
        headers = {
            'User-Agent': self.get_random_user_agent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'Sec-GPC': '1',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"macOS"',
        }
        self.session.headers.update(headers)

    def load_json_data(self) -> Dict:
        """Load the JSON file containing surf spots"""
        with open(self.json_file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def extract_gps_from_google_maps(self, maps_url: str) -> Optional[Tuple[float, float]]:
        """Extract GPS coordinates from Google Maps URL"""
        try:
            # Handle different Google Maps URL formats
            if '@' in maps_url:
                # Format: https://www.google.com/maps/@28.3464,-14.1784,15z
                coords_part = maps_url.split('@')[1].split(',')[0:2]
                if len(coords_part) == 2:
                    lat = float(coords_part[0])
                    lon = float(coords_part[1])
                    return (lat, lon)

            # Parse query parameters for coordinates
            parsed = urlparse(maps_url)
            params = parse_qs(parsed.query)

            if 'q' in params:
                # Format might be "lat,lon" or address
                q = params['q'][0]
                coord_match = re.search(r'(-?\d+\.?\d*),\s*(-?\d+\.?\d*)', q)
                if coord_match:
                    lat = float(coord_match.group(1))
                    lon = float(coord_match.group(2))
                    return (lat, lon)

        except Exception as e:
            print(f"Error extracting GPS from {maps_url}: {e}")

        return None

    def get_spot_guide_content(self, base_url: str) -> Optional[BeautifulSoup]:
        """Get content from the spot guide page with advanced bot evasion"""
        # Try spot-guide first
        spot_guide_url = base_url.rstrip('/') + '/spot-guide'
        urls_to_try = [spot_guide_url, base_url]  # Fallback to main surf report

        for url in urls_to_try:
            # Add random delay to avoid rate limiting
            delay = random.uniform(2, 5)
            time.sleep(delay)

            # Try cloudscraper first (best for Cloudflare-protected sites)
            try:
                print(f"Fetching with cloudscraper: {url}")
                response = self.cloudscraper.get(url, timeout=20)

                if response.status_code == 200:
                    print("✅ Cloudscraper successful!")
                    return BeautifulSoup(response.content, 'html.parser')
                else:
                    print(f"Cloudscraper failed: HTTP {response.status_code}")

            except Exception as e:
                print(f"Cloudscraper error: {e}")

            # Fallback to regular session with randomized headers
            try:
                # Randomize headers for each request
                self.session.headers.update({'User-Agent': self.get_random_user_agent()})
                print(f"Fetching with session: {url}")
                response = self.session.get(url, timeout=15)

                if response.status_code == 200:
                    print("✅ Session fallback successful!")
                    return BeautifulSoup(response.content, 'html.parser')
                else:
                    print(f"Session fallback failed: HTTP {response.status_code}")

            except requests.RequestException as e:
                print(f"Session error: {e}")

        return None

    
    def extract_spot_characteristics(self, soup: BeautifulSoup) -> Dict:
        """Extract surf spot characteristics from the page"""
        characteristics = {}

        if not soup:
            return characteristics

        try:
            # Look for Google Maps link first (works on most pages)
            maps_link = soup.find('a', href=re.compile(r'google\.com/maps'))
            if maps_link and maps_link.get('href'):
                characteristics['google_maps_url'] = maps_link.get('href')
                gps_coords = self.extract_gps_from_google_maps(maps_link.get('href'))
                if gps_coords:
                    characteristics['extracted_gps'] = {
                        'latitude': gps_coords[0],
                        'longitude': gps_coords[1]
                    }

            # Extract structured spot guide information using headings
            self.extract_spot_guide_info(soup, characteristics)

            # Extract general spot information from text content
            self.extract_general_spot_info(soup, characteristics)

        except Exception as e:
            print(f"Error extracting characteristics: {e}")

        return characteristics

    def extract_spot_guide_info(self, soup: BeautifulSoup, characteristics: Dict):
        """Extract information from spot guide section using headings"""
        # Look for specific sections based on headings
        headings = soup.find_all(['h2', 'h3', 'h4'])

        for heading in headings:
            heading_text = heading.get_text().strip().lower()

            # Map heading text to characteristic keys
            characteristic_mapping = {
                'ideal surf conditions': 'ideal_conditions',
                'swell direction': 'swell_direction',
                'wind': 'wind_direction',
                'surf height': 'surf_height',
                'tide': 'tide_conditions',
                'ability level': 'ability_level',
                'local vibe': 'local_vibe',
                'crowd factor': 'crowd_factor',
                'spot rating': 'spot_rating',
                'shoulder burn': 'shoulder_burn',
                'water quality': 'water_quality',
                'hazards': 'hazards',
                'bring your': 'recommended_gear',
                'access': 'access_info',
                'bottom': 'bottom_type',
                'best season': 'best_season'
            }

            # Find matching characteristic
            for key_phrase, characteristic_key in characteristic_mapping.items():
                if key_phrase in heading_text:
                    # Get the content following this heading
                    content = self.get_content_after_heading(heading)
                    if content and len(content.strip()) > 3:
                        characteristics[characteristic_key] = content.strip()
                    break

    def get_content_after_heading(self, heading) -> str:
        """Get the text content that follows a heading"""
        try:
            # Look for content in the next element or siblings
            next_element = heading.find_next_sibling(['p', 'div', 'span', 'ul', 'ol'])
            if next_element:
                if next_element.name in ['ul', 'ol']:
                    # For lists, join all items
                    items = [li.get_text().strip() for li in next_element.find_all('li')]
                    return '; '.join(items)
                else:
                    return next_element.get_text().strip()

            # If no next sibling, try parent's next sibling
            parent = heading.parent
            if parent:
                next_parent = parent.find_next_sibling(['p', 'div', 'span', 'ul', 'ol'])
                if next_parent:
                    if next_parent.name in ['ul', 'ol']:
                        items = [li.get_text().strip() for li in next_parent.find_all('li')]
                        return '; '.join(items)
                    else:
                        return next_parent.get_text().strip()

        except Exception as e:
            print(f"Error getting content after heading: {e}")

        return ""

    def extract_general_spot_info(self, soup: BeautifulSoup, characteristics: Dict):
        """Extract general spot information from text content"""
        # Look for specific patterns in text content
        text_content = soup.get_text()

        # Extract wave type information
        wave_patterns = [
            r'(reef break|point break|beach break|rivermouth|point/reef)',
            r'(right hander|left hander|right-left|left-right)',
            r'(fast|hollow|slow|mushy|powerful|gentle)'
        ]

        pattern_names = ['wave_type', 'wave_direction', 'wave_character']
        for pattern, name in zip(wave_patterns, pattern_names):
            matches = re.findall(pattern, text_content, re.IGNORECASE)
            if matches and name not in characteristics:
                characteristics[name] = '; '.join(set(matches))

        # Extract skill level information
        skill_patterns = [
            r'(beginner|intermediate|advanced|expert|all levels)',
            r'(beginner.*intermediate|intermediate.*advanced)'
        ]

        for pattern in skill_patterns:
            matches = re.findall(pattern, text_content, re.IGNORECASE)
            if matches and 'ability_level' not in characteristics:
                characteristics['ability_level'] = matches[0]
                break

    
    def verify_gps_coordinates(self, original_gps: Dict, extracted_gps: Optional[Dict]) -> bool:
        """Verify if extracted GPS coordinates match original ones"""
        if not extracted_gps:
            return True  # Can't verify if no extracted coordinates

        orig_lat = round(original_gps['latitude'], 4)
        orig_lon = round(original_gps['longitude'], 4)
        ext_lat = round(extracted_gps['latitude'], 4)
        ext_lon = round(extracted_gps['longitude'], 4)

        lat_diff = abs(orig_lat - ext_lat)
        lon_diff = abs(orig_lon - ext_lon)

        # Allow small differences (up to 0.001 degrees, which is ~100m)
        tolerance = 0.001

        return lat_diff <= tolerance and lon_diff <= tolerance

    def process_spot(self, spot: Dict, index: int, total: int) -> Dict:
        """Process a single surf spot"""
        name = spot.get('name', 'Unknown')
        print(f"\nProcessing spot {index + 1}/{total}: {name}")

        # Get spot guide content
        soup = self.get_spot_guide_content(spot['url'])

        if not soup:
            print(f"Could not fetch content for {name}")
            return spot

        # Extract characteristics
        characteristics = self.extract_spot_characteristics(soup)

        # Verify GPS coordinates
        gps_match = True
        if 'extracted_gps' in characteristics:
            gps_match = self.verify_gps_coordinates(spot['gps'], characteristics['extracted_gps'])
            if not gps_match:
                print(f"⚠️  GPS MISMATCH for {name}:")
                print(f"   Original: {spot['gps']['latitude']}, {spot['gps']['longitude']}")
                print(f"   Extracted: {characteristics['extracted_gps']['latitude']}, {characteristics['extracted_gps']['longitude']}")

        # Add characteristics to spot data
        enriched_spot = spot.copy()
        enriched_spot['surfline_characteristics'] = characteristics
        enriched_spot['gps_verified'] = gps_match

        # Delay is now handled in get_spot_guide_content to avoid rate limiting

        return enriched_spot

    def process_all_spots(self, test_mode: bool = False, max_spots: int = None) -> List[Dict]:
        """Process all surf spots or a subset for testing"""
        spots = self.spots_data['surf_spots']

        if test_mode and max_spots:
            spots = spots[:max_spots]

        total_spots = len(spots)

        print(f"Processing {total_spots} surf spots {'(TEST MODE)' if test_mode else ''}...")

        enriched_spots = []
        gps_mismatches = []

        for index, spot in enumerate(spots):
            enriched_spot = self.process_spot(spot, index, total_spots)

            if not enriched_spot.get('gps_verified', True):
                gps_mismatches.append(enriched_spot)

            enriched_spots.append(enriched_spot)

            # In test mode, exit after processing the requested number
            if test_mode and index + 1 >= max_spots:
                break

        # Report GPS mismatches
        if gps_mismatches:
            print(f"\n⚠️  GPS COORDINATE MISMATCHES FOUND:")
            for spot in gps_mismatches:
                print(f"   - {spot['name']}")

        return enriched_spots

    def save_enriched_data(self, enriched_spots: List[Dict], output_file: str = None):
        """Save the enriched data back to JSON"""
        if not output_file:
            output_file = self.json_file_path.replace('.json', '_enriched.json')

        enriched_data = {
            'source_info': self.spots_data['source_info'],
            'enrichment_info': {
                'total_spots': len(enriched_spots),
                'gps_mismatches': len([s for s in enriched_spots if not s.get('gps_verified', True)]),
                'enrichment_date': time.strftime('%Y-%m-%d %H:%M:%S')
            },
            'surf_spots': enriched_spots
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enriched_data, f, indent=2, ensure_ascii=False)

        print(f"\nEnriched data saved to: {output_file}")
        return output_file

def main():
    import sys

    # Path to the JSON file
    json_file = "/Users/frederic/github/lavolcanica/docs/surf-spots-coordinates-google-map/surfline fuerteventura surf spots.json"

    # Check for test mode command line arguments
    test_mode = "--test" in sys.argv
    max_spots = 1  # Default to 1 spot for testing

    # Parse number of spots for testing if provided
    if test_mode and len(sys.argv) > 2:
        try:
            max_spots = int(sys.argv[2])
        except ValueError:
            print("Invalid number for test spots. Using default of 1.")
            max_spots = 1

    # Create scraper instance
    scraper = SurfSpotScraper(json_file)

    if test_mode:
        print(f"🧪 TEST MODE: Processing only {max_spots} spot(s)")
        # Process test spots
        enriched_spots = scraper.process_all_spots(test_mode=True, max_spots=max_spots)
        # Save test output
        output_file = scraper.save_enriched_data(enriched_spots,
                                                json_file.replace('.json', f'_test_{max_spots}.json'))
    else:
        # Process all spots
        enriched_spots = scraper.process_all_spots()
        # Save enriched data
        output_file = scraper.save_enriched_data(enriched_spots)

    print(f"\n✅ Completed processing {len(enriched_spots)} surf spots")
    print(f"📄 Output saved to: {output_file}")

if __name__ == "__main__":
    main()