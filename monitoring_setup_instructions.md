# Automated Monitoring Setup
# Add this line to your crontab (crontab -e) to run monitoring daily at 9 AM:

0 9 * * * cd /Users/frederic/github/lavolcanica && /usr/bin/python3 /Users/frederic/github/lavolcanica/automated-monitoring-system.py >> /Users/frederic/github/lavolcanica/monitoring.log 2>&1

# Or run hourly for more frequent monitoring:
# 0 * * * * cd /Users/frederic/github/lavolcanica && /usr/bin/python3 /Users/frederic/github/lavolcanica/automated-monitoring-system.py >> /Users/frederic/github/lavolcanica/monitoring.log 2>&1
