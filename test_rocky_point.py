#!/usr/bin/env python3
"""
Test script to analyze Rocky Point spot guide content
"""

import json
import cloudscraper
import time
from bs4 import BeautifulSoup
import re

def analyze_rocky_point():
    """Analyze Rocky Point pages in detail"""
    base_url = "https://www.surfline.com/surf-report/rocky-point/584204204e65fad6a77096a0"
    spot_guide_url = base_url + '/spot-guide'

    # Create cloudscraper
    scraper = cloudscraper.create_scraper(
        browser={'browser': 'chrome', 'platform': 'darwin', 'desktop': True, 'mobile': False},
        delay=10,
        allow_brotli=True
    )

    # Try both URLs
    urls_to_test = [
        ("Main Surf Report", base_url),
        ("Spot Guide", spot_guide_url)
    ]

    for url_name, url in urls_to_test:
        print(f"\n{'='*50}")
        print(f"Testing Rocky Point {url_name}: {url}")
        print(f"{'='*50}")

        try:
            response = scraper.get(url, timeout=30)
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # Print page title
                title = soup.find('title')
                if title:
                    print(f"Title: {title.get_text()}")

                # Look for various data structures
                print("\n=== LOOKING FOR STRUCTURED DATA ===")

                # Check for JSON data in script tags
                scripts = soup.find_all('script', type='application/ld+json')
                for i, script in enumerate(scripts):
                    print(f"\n--- LD+JSON Script {i+1} ---")
                    try:
                        data = json.loads(script.string)
                        print(json.dumps(data, indent=2))
                    except:
                        print(f"Could not parse JSON: {script.string[:200]}...")

                # Look for other script tags with data
                all_scripts = soup.find_all('script')
                for i, script in enumerate(all_scripts):
                    if script.string and ('window' in script.string or 'surfline' in script.string.lower()):
                        print(f"\n--- Script {i+1} (contains window/surfline) ---")
                        content = script.string
                        if len(content) > 500:
                            print(content[:500] + "...[truncated]")
                        else:
                            print(content)

                # Look for specific data attributes
                print("\n=== LOOKING FOR DATA ATTRIBUTES ===")

                # Find elements with data-* attributes
                for element in soup.find_all(attrs={'data-spot-id': True}):
                    print(f"Element with data-spot-id: {element.name} - {element.get('data-spot-id')}")

                for element in soup.find_all(attrs={'data-lat': True}):
                    print(f"Element with lat: {element.get('data-lat')}, lon: {element.get('data-lon')}")

                # Look for class names that might contain data
                data_classes = ['spot-info', 'spot-details', 'wave-info', 'surf-info', 'break-info']
                for class_name in data_classes:
                    elements = soup.find_all(class_=lambda x: x and class_name in str(x).lower())
                    if elements:
                        print(f"\n--- Elements with class containing '{class_name}' ---")
                        for element in elements[:3]:  # Limit to first 3
                            print(f"{element.name}: {element.get_text()[:200]}...")

                # Look for headings and following content
                print("\n=== LOOKING FOR HEADINGS AND CONTENT ===")
                headings = soup.find_all(['h1', 'h2', 'h3', 'h4'])
                for heading in headings:
                    text = heading.get_text().strip()
                    if len(text) > 3:
                        print(f"\nHeading: {text}")
                        # Get next paragraph or list
                        next_element = heading.find_next(['p', 'ul', 'div'])
                        if next_element:
                            content = next_element.get_text().strip()
                            if len(content) > 10:
                                print(f"Content: {content[:200]}...")

                # Look for tables or lists with data
                print("\n=== LOOKING FOR TABLES AND LISTS ===")
                tables = soup.find_all('table')
                for i, table in enumerate(tables):
                    print(f"\n--- Table {i+1} ---")
                    rows = table.find_all('tr')
                    for row in rows[:5]:  # Limit to first 5 rows
                        cells = [cell.get_text().strip() for cell in row.find_all(['td', 'th'])]
                        if cells:
                            print(f"Row: {' | '.join(cells)}")

                lists = soup.find_all(['ul', 'ol'])
                for i, lst in enumerate(lists):
                    items = [li.get_text().strip() for li in lst.find_all('li')]
                    if items and any(len(item) > 10 for item in items):
                        print(f"\n--- List {i+1} ---")
                        for item in items[:5]:  # Limit to first 5 items
                            if len(item) > 10:
                                print(f"- {item}")

                # Save full HTML for manual inspection
                filename = f"rocky_point_{url_name.lower().replace(' ', '_')}.html"
                with open(f'/Users/frederic/github/lavolcanica/{filename}', 'w', encoding='utf-8') as f:
                    f.write(str(soup.prettify()))
                print(f"\nFull HTML saved to: {filename}")

        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    analyze_rocky_point()