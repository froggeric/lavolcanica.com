/**
 * @jest-environment node
 */

import { test, expect } from '@playwright/test';
import { surfSpotDataTestData } from './test-data/test-spots.test.js';

// This test file outlines the cross-browser compatibility testing strategy.
// Actual cross-browser testing would be executed via a CI/CD pipeline
// using Playwright's browser configurations (chromium, firefox, webkit)
// and potentially integrated with services like BrowserStack or Sauce Labs.

const testPagePath = 'http://localhost:8080/test-surf-spot-panel.html'; // Assuming a local server is running

test.describe('SurfSpotPanel Browser Compatibility', () => {
    let mockSpotData;

    test.beforeAll(async () => {
        mockSpotData = surfSpotDataTestData.theBubble;
    });

    // Define a function to setup the panel on the page
    const setupPanel = async (page, data) => {
        await page.goto(testPagePath);
        await page.evaluate((spotData) => {
            window.SurfSpotPanelInstance = new SurfSpotPanel({
                container: document.getElementById('panel-container'),
                enableAnimations: false,
                enableTooltips: false,
                enableKeyboardNav: false,
                enablePerformanceOptimizations: false,
            });
            window.mockSpotData = spotData;
            const fragment = window.SurfSpotPanelInstance.generateContent(window.mockSpotData);
            document.getElementById('panel-container').innerHTML = '';
            document.getElementById('panel-container').appendChild(fragment);
        }, data);
        await page.waitForSelector('.surf-spot-panel', { state: 'visible' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500); // Give some time for rendering to settle
    };

    // Define a function to clean up the panel on the page
    const cleanupPanel = async (page) => {
        await page.evaluate(() => {
            if (window.SurfSpotPanelInstance) {
                window.SurfSpotPanelInstance.destroy();
                window.SurfSpotPanelInstance = null;
            }
            document.getElementById('panel-container').innerHTML = '<p>Select a surf spot to view its details</p>';
        });
    };

    // Array of browsers to test (Chromium covers Chrome and Edge)
    const browsers = ['chromium', 'firefox', 'webkit'];

    // Array of devices/viewports to test
    const devices = [
        { name: 'Desktop Large', viewport: { width: 1920, height: 1080 } },
        { name: 'Desktop Medium', viewport: { width: 1366, height: 768 } },
        { name: 'iPad (Portrait)', device: 'iPad (gen 7)', isMobile: true, viewport: { width: 768, height: 1024 } },
        { name: 'iPad (Landscape)', device: 'iPad (gen 7)', isMobile: true, viewport: { width: 1024, height: 768 } },
        { name: 'iPhone 12', device: 'iPhone 12', isMobile: true, viewport: { width: 390, height: 844 } },
        { name: 'Galaxy S20', device: 'Galaxy S20', isMobile: true, viewport: { width: 360, height: 800 } },
    ];

    // Placeholder for browser versions: Actual testing would involve configuring Playwright's `projects`
    // in playwright.config.js to run against different browser versions (e.g., stable, beta, old stable).
    // This file focuses on the test logic, assuming the Playwright setup handles versioning.

    browsers.forEach(browserType => {
        test.describe(`Panel Functionality on ${browserType}`, () => {
            devices.forEach(deviceConfig => {
                test(`renders and interacts correctly on ${deviceConfig.name}`, async ({ page, browserName }) => {
                    // Skip if browserType doesn't match current browserName
                    if (browserName !== browserType) {
                        test.skip();
                        return;
                    }

                    let currentPage = page; // Use a mutable variable for page

                    if (deviceConfig.device) {
                        // Use Playwright's built-in device emulation
                        const context = await page.context().browser().newContext({
                            ...test.devices[deviceConfig.device],
                            viewport: deviceConfig.viewport
                        });
                        currentPage = await context.newPage();
                    } else {
                        // Set custom viewport for desktop sizes
                        await currentPage.setViewportSize(deviceConfig.viewport);
                    }

                    // Set isMobile flag for internal logic if needed
                    if (deviceConfig.isMobile) {
                        await currentPage.evaluate(() => {
                            window.SurfSpotPanelInstance.isTouchDevice = true;
                        });
                    }

                    await setupPanel(currentPage, mockSpotData);

                    // --- Core Functionality Tests ---
                    await expect(currentPage.locator('.surf-spot-primary-name')).toHaveText(mockSpotData.primaryName);
                    await expect(currentPage.locator('.location-info')).toContainText(mockSpotData.location.area);

                    // Tab navigation
                    await currentPage.click('[data-tab-id="waves"]');
                    await expect(currentPage.locator('#panel-waves')).not.toHaveAttribute('hidden');
                    await expect(currentPage.locator('#tab-waves')).toHaveClass(/active/);

                    await currentPage.click('[data-tab-id="practicalities"]');
                    await expect(currentPage.locator('#panel-practicalities')).not.toHaveAttribute('hidden');
                    await expect(currentPage.locator('#tab-practicalities')).toHaveClass(/active/);

                    // Expandable section
                    const accessSectionHeader = currentPage.locator('.expandable-section[data-section-id="access"] .section-header');
                    const accessSectionContent = currentPage.locator('.expandable-section[data-section-id="access"] .section-content');
                    await accessSectionHeader.click(); // Collapse it
                    await expect(accessSectionContent).toHaveAttribute('hidden');
                    await accessSectionHeader.click(); // Expand it
                    await expect(accessSectionContent).not.toHaveAttribute('hidden');

                    // Close button
                    await currentPage.click('.close-button');
                    await expect(currentPage.locator('.surf-spot-panel')).not.toBeVisible();
                    await expect(currentPage.locator('#panel-container')).toContainText('Select a surf spot to view its details');

                    // Re-setup panel for further tests
                    await setupPanel(currentPage, mockSpotData);

                    // --- Responsive Design Checks ---
                    if (deviceConfig.viewport.width < 768) { // Assuming 768px is mobile breakpoint
                        await expect(currentPage.locator('.surf-spot-panel')).toHaveClass(/mobile-view/);
                        await expect(currentPage.locator('.seasonal-calendar')).toHaveClass(/mobile-calendar/);
                    } else {
                        await expect(currentPage.locator('.surf-spot-panel')).not.toHaveClass(/mobile-view/);
                        await expect(currentPage.locator('.seasonal-calendar')).not.toHaveClass(/mobile-calendar/);
                    }

                    // Basic layout check (e.g., flexbox/grid applied)
                    const navTabs = currentPage.locator('.surf-spot-nav');
                    await expect(navTabs).toHaveCSS('display', 'flex'); // Assuming nav is flexbox

                    const characteristicsGrid = currentPage.locator('.characteristics-grid');
                    await expect(characteristicsGrid).toHaveCSS('display', 'grid'); // Assuming characteristics are grid

                    // --- Feature Support (Conceptual) ---
                    // Intersection Observer support: Verify lazy loading behavior
                    // This is hard to test directly without mocking, but we can check if data-src is removed.
                    const heroImage = currentPage.locator('.hero-image');
                    await expect(heroImage).not.toHaveAttribute('data-src'); // Should be loaded and src set
                    await expect(heroImage).toHaveClass(/lazy-loaded/);

                    // Performance (basic responsiveness check)
                    // This is more complex and usually involves dedicated performance tests.
                    // Here, we just ensure the UI remains interactive.
                    const startTime = performance.now();
                    await currentPage.click('[data-tab-id="waves"]');
                    const endTime = performance.now();
                    expect(endTime - startTime).toBeLessThan(500); // Interaction should be fast

                    await cleanupPanel(currentPage);
                });
            });
        });
    });

    // Error Handling in different browser environments
    test('should handle missing data gracefully across browsers', async ({ page }) => {
        const minimalSpotData = {
            id: 'minimal-spot',
            primaryName: 'Minimal Spot',
            location: { area: 'Minimal Area', coordinates: { lat: 0, lng: 0 } },
            waveDetails: { abilityLevel: { primary: 'Beginner' } },
            characteristics: { crowdFactor: 'Low', bottom: [], waterQuality: 'Clean' },
            practicalities: {}
        };
        await setupPanel(page, minimalSpotData);
        await expect(page.locator('.surf-spot-primary-name')).toHaveText('Minimal Spot');
        await expect(page.locator('.description-text')).toBeEmpty(); // No description in minimal data
        await cleanupPanel(page);
    });
});