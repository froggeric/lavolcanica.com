#!/usr/bin/env python3
"""
Automated Monitoring System for Fuerteventura Surf Spots Database
Monitors changes, validates data quality, and generates alerts
"""

import json
import os
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import requests
from dataclasses import dataclass

@dataclass
class ChangeAlert:
    """Represents a detected change that needs attention"""
    spot_id: str
    spot_name: str
    change_type: str
    old_value: str
    new_value: str
    confidence: str
    requires_action: bool

class SurfSpotMonitor:
    def __init__(self):
        self.data_file = "/Users/frederic/github/lavolcanica/data/fuerteventura-surf-spots.json"
        self.hash_file = "/Users/frederic/github/lavolcanica/data/.database_hash"
        self.alerts_file = "/Users/frederic/github/lavolcanica/monitoring_alerts.json"
        self.google_maps_sources = self.load_google_maps_sources()

    def load_google_maps_sources(self) -> Dict:
        """Load Google Maps source URLs for monitoring"""
        sources = {
            'freshsurf': 'https://www.freshsurf.de/en/spotfinder/',
            'surf_and_unwind': 'https://www.surfandunwind.com/surf-guide-fuerteventura/',
            'surfermap': 'https://surfermap.com/loc/fuerteventura/',
            'planet_surfcamps': 'https://planetsurfcamps.co.uk/surf-camps-canary-islands/surf-camp-fuerteventura/'
        }
        return sources

    def calculate_file_hash(self) -> str:
        """Calculate SHA256 hash of the database file"""
        with open(self.data_file, 'rb') as f:
            content = f.read()
        return hashlib.sha256(content).hexdigest()

    def load_previous_hash(self) -> Optional[str]:
        """Load the previous database hash"""
        if os.path.exists(self.hash_file):
            with open(self.hash_file, 'r') as f:
                return f.read().strip()
        return None

    def save_current_hash(self, hash_value: str):
        """Save current database hash"""
        with open(self.hash_file, 'w') as f:
            f.write(hash_value)

    def load_current_data(self) -> Dict:
        """Load current surf spots data"""
        with open(self.data_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def check_coordinate_accuracy(self, data: Dict) -> List[ChangeAlert]:
        """Check for coordinate accuracy issues"""
        alerts = []

        for spot in data['spots']:
            spot_id = spot['id']
            spot_name = spot['primaryName']
            coords = spot['location']['coordinates']
            accuracy = coords.get('accuracy', 'unknown')

            # Check for unverified coordinates
            if accuracy in ['unverified', 'unknown', 'requires_review']:
                alerts.append(ChangeAlert(
                    spot_id=spot_id,
                    spot_name=spot_name,
                    change_type='coordinate_accuracy',
                    old_value=accuracy,
                    new_value='verification_needed',
                    confidence='HIGH',
                    requires_action=True
                ))

            # Check for coordinate format issues
            try:
                lat = float(coords['lat'])
                lng = float(coords['lng'])

                # Basic geographic validation for Fuerteventura
                if not (28.0 <= lat <= 28.8) or not (-14.5 <= lng <= -13.8):
                    alerts.append(ChangeAlert(
                        spot_id=spot_id,
                        spot_name=spot_name,
                        change_type='coordinate_geographic_validation',
                        old_value=f"{lat}, {lng}",
                        new_value='outside_fuerteventura_bounds',
                        confidence='HIGH',
                        requires_action=True
                    ))

            except (ValueError, TypeError):
                alerts.append(ChangeAlert(
                    spot_id=spot_id,
                    spot_name=spot_name,
                    change_type='coordinate_format',
                    old_value=str(coords),
                    new_value='invalid_format',
                    confidence='HIGH',
                    requires_action=True
                ))

        return alerts

    def check_description_quality(self, data: Dict) -> List[ChangeAlert]:
        """Check description quality and completeness"""
        alerts = []

        for spot in data['spots']:
            spot_id = spot['id']
            spot_name = spot['primaryName']
            description = spot.get('description', '')

            # Check for empty descriptions
            if not description or len(description.strip()) < 50:
                alerts.append(ChangeAlert(
                    spot_id=spot_id,
                    spot_name=spot_name,
                    change_type='description_completeness',
                    old_value=f"length: {len(description)}",
                    new_value='needs_enhancement',
                    confidence='MEDIUM',
                    requires_action=False
                ))

            # Check for missing Google Maps integration
            if 'Google Maps' not in description and 'freshsurf' not in description.lower():
                alerts.append(ChangeAlert(
                    spot_id=spot_id,
                    spot_name=spot_name,
                    change_type='google_maps_integration',
                    old_value='no_google_maps_data',
                    new_value='integration_opportunity',
                    confidence='LOW',
                    requires_action=False
                ))

        return alerts

    def check_data_structure_integrity(self, data: Dict) -> List[ChangeAlert]:
        """Verify data structure integrity"""
        alerts = []

        required_fields = {
            'id', 'primaryName', 'description', 'location', 'waveDetails',
            'characteristics', 'practicalities'
        }

        for i, spot in enumerate(data.get('spots', [])):
            missing_fields = required_fields - set(spot.keys())

            if missing_fields:
                alerts.append(ChangeAlert(
                    spot_id=spot.get('id', f'index_{i}'),
                    spot_name=spot.get('primaryName', f'Spot {i}'),
                    change_type='data_structure',
                    old_value='complete',
                    new_value=f'missing_fields: {missing_fields}',
                    confidence='HIGH',
                    requires_action=True
                ))

        return alerts

    def monitor_google_maps_sources(self) -> List[ChangeAlert]:
        """Monitor Google Maps source availability"""
        alerts = []

        for source_name, url in self.google_maps_sources.items():
            try:
                response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                if response.status_code != 200:
                    alerts.append(ChangeAlert(
                        spot_id='system',
                        spot_name=f'Google Maps Source: {source_name}',
                        change_type='source_availability',
                        old_value='available',
                        new_value=f'http_{response.status_code}',
                        confidence='MEDIUM',
                        requires_action=True
                    ))
            except requests.RequestException as e:
                alerts.append(ChangeAlert(
                    spot_id='system',
                    spot_name=f'Google Maps Source: {source_name}',
                    change_type='source_availability',
                    old_value='available',
                    new_value=f'connection_error: {str(e)}',
                    confidence='MEDIUM',
                    requires_action=True
                ))

        return alerts

    def generate_monitoring_report(self, all_alerts: List[ChangeAlert]) -> str:
        """Generate comprehensive monitoring report"""
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        report = f"""# Surf Spots Database Monitoring Report

**Generated:** {current_time}
**Total Alerts:** {len(all_alerts)}
**Requiring Action:** {len([a for a in all_alerts if a.requires_action])}

## Alert Summary

### High Priority (Requires Action)
"""

        high_priority = [a for a in all_alerts if a.requires_action]
        for alert in high_priority:
            report += f"- **{alert.spot_name}** ({alert.spot_id}): {alert.change_type}\n"
            report += f"  - {alert.old_value} → {alert.new_value}\n"
            report += f"  - Confidence: {alert.confidence}\n\n"

        report += "\n### Medium Priority\n"
        medium_priority = [a for a in all_alerts if not a.requires_action and a.confidence == 'MEDIUM']
        for alert in medium_priority:
            report += f"- **{alert.spot_name}**: {alert.change_type}\n"

        report += "\n### Low Priority\n"
        low_priority = [a for a in all_alerts if not a.requires_action and a.confidence == 'LOW']
        for alert in low_priority:
            report += f"- **{alert.spot_name}**: {alert.change_type}\n"

        report += f"""

## Data Quality Metrics

- **Total Spots:** {len(self.load_current_data().get('spots', []))}
- **High Priority Issues:** {len(high_priority)}
- **Medium Priority Issues:** {len(medium_priority)}
- **Low Priority Issues:** {len(low_priority)}
- **Google Maps Sources Monitored:** {len(self.google_maps_sources)}

## Recommendations

### Immediate Actions Required
"""

        for alert in high_priority:
            if alert.change_type == 'coordinate_accuracy':
                report += f"- Verify coordinates for {alert.spot_name} using Google Maps\n"
            elif alert.change_type == 'coordinate_format':
                report += f"- Fix coordinate format for {alert.spot_name}\n"
            elif alert.change_type == 'data_structure':
                report += f"- Restore missing fields for {alert.spot_name}\n"

        report += "\n### Scheduled Improvements\n"
        report += "- Enhance descriptions for spots marked as needing improvement\n"
        report += "- Integrate Google Maps data where missing\n"
        report += "- Continue monitoring source availability\n"

        return report

    def save_alerts(self, alerts: List[ChangeAlert]):
        """Save alerts to JSON file"""
        alerts_data = {
            'timestamp': datetime.now().isoformat(),
            'total_alerts': len(alerts),
            'requiring_action': len([a for a in alerts if a.requires_action]),
            'alerts': [
                {
                    'spot_id': a.spot_id,
                    'spot_name': a.spot_name,
                    'change_type': a.change_type,
                    'old_value': a.old_value,
                    'new_value': a.new_value,
                    'confidence': a.confidence,
                    'requires_action': a.requires_action
                }
                for a in alerts
            ]
        }

        with open(self.alerts_file, 'w', encoding='utf-8') as f:
            json.dump(alerts_data, f, indent=2, ensure_ascii=False)

    def run_monitoring(self) -> Dict:
        """Run complete monitoring check"""
        print("Starting surf spots database monitoring...")

        # Check for file changes
        current_hash = self.calculate_file_hash()
        previous_hash = self.load_previous_hash()

        file_changed = current_hash != previous_hash

        # Load current data
        data = self.load_current_data()

        # Run all checks
        all_alerts = []

        # Data quality checks
        all_alerts.extend(self.check_coordinate_accuracy(data))
        all_alerts.extend(self.check_description_quality(data))
        all_alerts.extend(self.check_data_structure_integrity(data))

        # External source monitoring
        all_alerts.extend(self.monitor_google_maps_sources())

        # Save alerts and generate report
        self.save_alerts(all_alerts)

        report = self.generate_monitoring_report(all_alerts)

        # Save report
        with open('/Users/frederic/github/lavolcanica/monitoring_report.md', 'w', encoding='utf-8') as f:
            f.write(report)

        # Update hash if file changed
        if file_changed:
            self.save_current_hash(current_hash)

        return {
            'file_changed': file_changed,
            'total_alerts': len(all_alerts),
            'requiring_action': len([a for a in all_alerts if a.requires_action]),
            'report_generated': True
        }

    def setup_cron_job(self):
        """Generate instructions for setting up automated monitoring"""
        script_path = os.path.abspath(__file__)
        cron_instructions = f"""# Automated Monitoring Setup
# Add this line to your crontab (crontab -e) to run monitoring daily at 9 AM:

0 9 * * * cd /Users/frederic/github/lavolcanica && /usr/bin/python3 {script_path} >> /Users/frederic/github/lavolcanica/monitoring.log 2>&1

# Or run hourly for more frequent monitoring:
# 0 * * * * cd /Users/frederic/github/lavolcanica && /usr/bin/python3 {script_path} >> /Users/frederic/github/lavolcanica/monitoring.log 2>&1
"""

        with open('/Users/frederic/github/lavolcanica/monitoring_setup_instructions.md', 'w') as f:
            f.write(cron_instructions)

        print("Monitoring setup instructions saved to: monitoring_setup_instructions.md")

def main():
    """Main monitoring execution"""
    monitor = SurfSpotMonitor()

    # Run monitoring
    results = monitor.run_monitoring()

    print(f"\nMonitoring completed:")
    print(f"  File changed: {results['file_changed']}")
    print(f"  Total alerts: {results['total_alerts']}")
    print(f"  Requiring action: {results['requiring_action']}")
    print(f"  Report generated: monitoring_report.md")

    # Setup instructions
    monitor.setup_cron_job()

    return results

if __name__ == "__main__":
    main()