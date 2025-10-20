/**
 * @jest-environment node
 */

import { test, expect } from '@playwright/test';
import { surfSpotDataTestData } from './test-data/test-spots.test.js';

const testPagePath = 'http://localhost:8080/test-surf-spot-panel.html'; // Assuming a local server is running

test.describe('SurfSpotPanel E2E Tests', () => {
    let page;
    let context;

    test.beforeAll(async ({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
        await page.goto(testPagePath);
    });

    test.afterAll(async () => {
        await context.close();
    });

    test.beforeEach(async () => {
        // Reset the panel content before each test
        await page.evaluate(() => {
            if (window.SurfSpotPanelInstance) {
                window.SurfSpotPanelInstance.destroy();
                window.SurfSpotPanelInstance = null;
            }
            document.getElementById('panel-container').innerHTML = '<p>Select a surf spot to view its details</p>';
            const spotSelect = document.getElementById('spot-select');
            if (spotSelect) {
                spotSelect.value = ''; // Reset dropdown
                spotSelect.dispatchEvent(new Event('change')); // Trigger change event
            }
        });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(100); // Small delay for DOM to settle
    });

    // Test Case 1: Panel Renders Correctly on Spot Selection
    test('should render the panel correctly when a surf spot is selected', async () => {
        await page.selectOption('#spot-select', 'the-bubble');
        await page.waitForSelector('.surf-spot-panel');

        await expect(page.locator('.surf-spot-primary-name')).toHaveText(surfSpotDataTestData.theBubble.primaryName);
        await expect(page.locator('.location-info')).toContainText(surfSpotDataTestData.theBubble.location.area);
        await expect(page.locator('.difficulty-indicator')).toHaveText(surfSpotDataTestData.theBubble.waveDetails.abilityLevel.primary);
    });

    // Test Case 2: Tab Navigation Functionality
    test('should navigate between tabs successfully', async () => {
        await page.selectOption('#spot-select', 'the-bubble');
        await page.waitForSelector('.surf-spot-panel');

        // Verify Overview tab is active by default
        await expect(page.locator('#tab-overview')).toHaveClass(/active/);
        await expect(page.locator('#panel-overview')).not.toHaveAttribute('hidden');

        // Click on Wave Details tab
        await page.click('[data-tab-id="waves"]');
        await expect(page.locator('#tab-waves')).toHaveClass(/active/);
        await expect(page.locator('#panel-waves')).not.toHaveAttribute('hidden');
        await expect(page.locator('#panel-overview')).toHaveAttribute('hidden');

        // Click on Practical Info tab
        await page.click('[data-tab-id="practicalities"]');
        await expect(page.locator('#tab-practicalities')).toHaveClass(/active/);
        await expect(page.locator('#panel-practicalities')).not.toHaveAttribute('hidden');
        await expect(page.locator('#panel-waves')).toHaveAttribute('hidden');
    });

    // Test Case 3: Expandable Sections Functionality
    test('should toggle expandable sections correctly', async () => {
        await page.selectOption('#spot-select', 'the-bubble');
        await page.waitForSelector('.surf-spot-panel');
        await page.click('[data-tab-id="practicalities"]'); // Navigate to practicalities tab

        const accessSectionHeader = page.locator('.expandable-section[data-section-id="access"] .section-header');
        const accessSectionContent = page.locator('.expandable-section[data-section-id="access"] .section-content');

        // Initially expanded
        await expect(accessSectionHeader).toHaveAttribute('aria-expanded', 'true');
        await expect(accessSectionContent).not.toHaveAttribute('hidden');

        // Collapse section
        await accessSectionHeader.click();
        await expect(accessSectionHeader).toHaveAttribute('aria-expanded', 'false');
        await expect(accessSectionContent).toHaveAttribute('hidden');

        // Expand section again
        await accessSectionHeader.click();
        await expect(accessSectionHeader).toHaveAttribute('aria-expanded', 'true');
        await expect(accessSectionContent).not.toHaveAttribute('hidden');
    });

    // Test Case 4: Close Button Functionality
    test('should close the panel when the close button is clicked', async () => {
        await page.selectOption('#spot-select', 'the-bubble');
        await page.waitForSelector('.surf-spot-panel');

        await page.click('.close-button');
        await expect(page.locator('.surf-spot-panel')).not.toBeVisible();
        await expect(page.locator('#panel-container')).toContainText('Select a surf spot to view its details');
    });

    // Test Case 5: Map Integration (Coordinates Button)
    test('should open Google Maps when coordinates button is clicked', async () => {
        await page.selectOption('#spot-select', 'the-bubble');
        await page.waitForSelector('.surf-spot-panel');

        const [popup] = await Promise.all([
            page.waitForEvent('popup'),
            page.click('.coords-button')
        ]);

        const expectedLat = surfSpotDataTestData.theBubble.location.coordinates.lat.toFixed(4);
        const expectedLng = surfSpotDataTestData.theBubble.location.coordinates.lng.toFixed(4);
        expect(popup.url()).toContain(`https://www.google.com/maps?q=${expectedLat},${expectedLng}`);
        await popup.close();
    });

    // Test Case 6: Share Functionality (conceptual for e2e, verifies notification)
    test('should show a notification when share button is clicked and Web Share API is not available', async () => {
        await page.selectOption('#spot-select', 'the-bubble');
        await page.waitForSelector('.surf-spot-panel');

        // Mock navigator.share to be undefined to force clipboard fallback
        await page.evaluate(() => {
            Object.defineProperty(navigator, 'share', { value: undefined, writable: true });
            Object.defineProperty(document, 'execCommand', { value: jest.fn(() => true), writable: true });
        });

        await page.click('.share-button');
        await expect(page.locator('.surf-spot-notification')).toBeVisible();
        await expect(page.locator('.surf-spot-notification')).toHaveText('Link copied to clipboard!');
    });

    // Test Case 7: Keyboard Navigation (Tab, Enter, Escape)
    test('should allow keyboard navigation and interaction', async () => {
        await page.selectOption('#spot-select', 'the-bubble');
        await page.waitForSelector('.surf-spot-panel');

        // Tab to the first tab (Overview)
        await page.press('body', 'Tab');
        await expect(page.locator('#tab-overview')).toBeFocused();

        // Navigate to Waves tab using ArrowRight
        await page.press('#tab-overview', 'ArrowRight');
        await expect(page.locator('#tab-waves')).toBeFocused();
        await expect(page.locator('#tab-waves')).toHaveClass(/active/);

        // Activate Practicalities tab using Enter
        await page.press('#tab-practicalities', 'Enter');
        await expect(page.locator('#tab-practicalities')).toHaveClass(/active/);
        await expect(page.locator('#panel-practicalities')).not.toHaveAttribute('hidden');

        // Tab to an expandable section header and activate it
        await page.press('#panel-practicalities', 'Tab'); // Focus first focusable in panel
        await page.press('Tab'); // Move to next focusable, likely a section header
        
        const sectionHeader = page.locator('.expandable-section[data-section-id="access"] .section-header');
        await expect(sectionHeader).toBeFocused();
        await expect(sectionHeader).toHaveAttribute('aria-expanded', 'true'); // Initially expanded

        await page.press(sectionHeader, 'Enter'); // Collapse
        await expect(sectionHeader).toHaveAttribute('aria-expanded', 'false');

        // Close panel using Escape
        await page.press('body', 'Escape');
        await expect(page.locator('.surf-spot-panel')).not.toBeVisible();
    });
});