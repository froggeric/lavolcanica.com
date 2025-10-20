/**
 * @jest-environment node
 */

import { test, expect, devices } from '@playwright/test';
import { surfSpotDataTestData } from './test-data/test-spots.test.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// This test file assumes Playwright is installed and configured to run tests.
// It also assumes a local server is running the test-surf-spot-panel.html file.
// For Percy integration, additional setup would be required in playwright.config.js
// and the use of `await page.percySnapshot('Snapshot Name')` or similar.

const testPagePath = 'http://localhost:8080/test-surf-spot-panel.html'; // Assuming a local server is running

test.describe('SurfSpotPanel Visual Regression', () => {
    let mockSpotData;

    test.beforeAll(async () => {
        // Load mock data once for all tests
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

    // Array of devices/viewports to test
    const viewports = [
        { name: 'Desktop Large', viewport: { width: 1920, height: 1080 } },
        { name: 'Desktop Medium', viewport: { width: 1366, height: 768 } },
        { name: 'iPad (Portrait)', device: devices['iPad (gen 7)'], isMobile: true },
        { name: 'iPad (Landscape)', device: devices['iPad (gen 7)'], isMobile: true, viewport: { width: 1024, height: 768 } },
        { name: 'iPhone 12', device: devices['iPhone 12'], isMobile: true },
        { name: 'Galaxy S20', device: devices['Galaxy S20'], isMobile: true },
    ];

    // Test default panel view across different viewports
    viewports.forEach(viewportConfig => {
        test(`should render the default panel view correctly on ${viewportConfig.name}`, async ({ page }) => {
            if (viewportConfig.device) {
                // Use Playwright's built-in device emulation
                const context = await page.context().browser().newContext({
                    ...viewportConfig.device,
                    viewport: viewportConfig.viewport || viewportConfig.device.defaultViewport
                });
                page = await context.newPage();
            } else {
                // Set custom viewport for desktop sizes
                await page.setViewportSize(viewportConfig.viewport);
            }
            
            await setupPanel(page, mockSpotData);
            await expect(page.locator('.surf-spot-panel')).toHaveScreenshot(`panel-default-${viewportConfig.name.replace(/\s+/g, '-').toLowerCase()}.png`);
            await cleanupPanel(page);
        });
    });

    // Test different tabs on a medium desktop screen
    test.describe('Tab Navigation Visuals', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 1366, height: 768 });
            await setupPanel(page, mockSpotData);
        });

        test('should render the waves tab correctly', async ({ page }) => {
            await page.click('[data-tab-id="waves"]');
            await page.waitForSelector('#panel-waves:not([hidden])');
            await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-waves-tab-desktop-medium.png');
        });

        test('should render the practicalities tab correctly', async ({ page }) => {
            await page.click('[data-tab-id="practicalities"]');
            await page.waitForSelector('#panel-practicalities:not([hidden])');
            await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-practicalities-tab-desktop-medium.png');
        });
    });

    // Test expandable sections on a medium desktop screen
    test.describe('Expandable Section Visuals', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 1366, height: 768 });
            await setupPanel(page, mockSpotData);
            await page.click('[data-tab-id="practicalities"]');
            await page.waitForSelector('#panel-practicalities:not([hidden])');
        });

        test('should render an expanded section correctly', async ({ page }) => {
            const sectionHeader = page.locator('.expandable-section[data-section-id="access"] .section-header');
            await sectionHeader.click(); // Expand the section
            await page.waitForFunction(header => header.getAttribute('aria-expanded') === 'true', sectionHeader);
            await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-expanded-section-desktop-medium.png');
        });

        test('should render a collapsed section correctly', async ({ page }) => {
            const sectionHeader = page.locator('.expandable-section[data-section-id="access"] .section-header');
            // Ensure it's expanded first, then collapse
            await sectionHeader.click();
            await page.waitForFunction(header => header.getAttribute('aria-expanded') === 'true', sectionHeader);
            await sectionHeader.click(); // Collapse the section
            await page.waitForFunction(header => header.getAttribute('aria-expanded') === 'false', sectionHeader);
            await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-collapsed-section-desktop-medium.png');
        });
    });

    // Test with different spot data on a medium desktop screen
    test('should render with a different spot data correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        await setupPanel(page, surfSpotDataTestData.elCotillo); // Use a different spot
        await page.waitForSelector(`h1:has-text("${surfSpotDataTestData.elCotillo.primaryName}")`);
        await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-elcotillo-desktop-medium.png');
        await cleanupPanel(page);
    });

    // Test error state on a medium desktop screen
    test('should render error state correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        await page.evaluate(() => {
            window.SurfSpotPanelInstance.showErrorState('Failed to load spot details.');
        });
        await page.waitForSelector('.error-message');
        await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-error-state-desktop-medium.png');
        await cleanupPanel(page);
    });

    // Test focus states for accessibility on a medium desktop screen
    test('should render focus states correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        await setupPanel(page, mockSpotData);
        
        // Focus on the close button
        await page.focus('.close-button');
        await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-focus-close-button-desktop-medium.png');

        // Focus on a tab
        await page.focus('[data-tab-id="waves"]');
        await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-focus-waves-tab-desktop-medium.png');
        
        await cleanupPanel(page);
    });

    // Test hover states on a medium desktop screen
    test('should render hover states correctly', async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        await setupPanel(page, mockSpotData);
        
        // Hover over the close button
        await page.hover('.close-button');
        await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-hover-close-button-desktop-medium.png');

        // Hover over a tab
        await page.hover('[data-tab-id="waves"]');
        await expect(page.locator('.surf-spot-panel')).toHaveScreenshot('panel-hover-waves-tab-desktop-medium.png');
        
        await cleanupPanel(page);
    });
});