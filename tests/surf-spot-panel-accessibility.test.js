/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { surfSpotDataTestData } from './test-data/test-spots.test.js';
import { SurfSpotPanel } from '../scripts/surf-map/surf-spot-panel-optimized.js';
import { axe, toHaveNoViolations } from 'jest-axe'; // Import axe and custom matcher

// Extend Jest with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('SurfSpotPanel Accessibility', () => {
    let panel;
    let container;
    let mockSpotData;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        panel = new SurfSpotPanel({
            container: container,
            enableAnimations: false,
            enableTooltips: false,
            enableKeyboardNav: true,
            enablePerformanceOptimizations: true,
            onTabChange: jest.fn(),
            onSectionToggle: jest.fn(),
            onClose: jest.fn()
        });

        mockSpotData = surfSpotDataTestData.theBubble;

        // Mock performance APIs
        global.performance = {
            now: jest.fn(() => Date.now()),
            mark: jest.fn(),
            measure: jest.fn(),
            getEntriesByName: jest.fn(() => []),
            getEntriesByType: jest.fn(() => []),
            memory: {
                usedJSHeapSize: 0
            }
        };
        
        // Mock IntersectionObserver
        global.IntersectionObserver = class IntersectionObserver {
            constructor(callback) {
                this.callback = callback;
                this.entries = [];
            }
            observe(element) {
                this.entries.push({ target: element, isIntersecting: true });
                // Simulate immediate intersection for testing purposes
                this.callback(this.entries);
            }
            disconnect() {}
            unobserve() {}
        };

        // Mock requestAnimationFrame
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
        global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));
    });

    afterEach(() => {
        panel.destroy();
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    // WCAG Compliance
    it('should have no accessibility violations when rendered with valid data', async () => {
        panel.generateContent(mockSpotData);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations when rendered with minimal data', async () => {
        const minimalSpotData = {
            id: 'minimal-spot',
            primaryName: 'Minimal Spot',
            location: { area: 'Minimal Area', coordinates: { lat: 0, lng: 0 } },
            waveDetails: { abilityLevel: { primary: 'Beginner' } },
            characteristics: { crowdFactor: 'Low', bottom: [], waterQuality: 'Clean' },
            practicalities: {}
        };
        panel.generateContent(minimalSpotData);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    // Screen Reader Support
    it('should announce tab changes to screen readers', async () => {
        const announceSpy = jest.spyOn(panel, '_announceToScreenReader');
        panel.generateContent(mockSpotData);
        
        const wavesTab = container.querySelector('[data-tab-id="waves"]');
        wavesTab.click();

        expect(announceSpy).toHaveBeenCalledWith('Switched to Wave Details tab. Content has been updated.');
        announceSpy.mockRestore();
    });

    it('should announce section toggles to screen readers', async () => {
        const announceSpy = jest.spyOn(panel, '_announceToScreenReader');
        panel.generateContent(mockSpotData);
        
        const sectionHeader = container.querySelector('.section-header');
        const sectionTitle = sectionHeader.querySelector('h3').textContent;
        sectionHeader.click(); // Expand

        expect(announceSpy).toHaveBeenCalledWith(`${sectionTitle} section expanded`);
        announceSpy.mockRestore();
    });

    it('should have a visually hidden live region for screen reader announcements', () => {
        panel.generateContent(mockSpotData);
        const liveRegion = document.getElementById('sr-live-region');
        expect(liveRegion).toBeTruthy();
        expect(liveRegion).toHaveAttribute('aria-live', 'polite');
        expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
        expect(liveRegion.classList.contains('sr-only')).toBe(true);
    });

    // Keyboard Navigation
    it('should allow tabbing through all interactive elements', () => {
        panel.generateContent(mockSpotData);
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        expect(focusableElements.length).toBeGreaterThan(0);

        // Test that each element can be focused
        focusableElements.forEach(el => {
            el.focus();
            expect(document.activeElement).toBe(el);
        });
    });

    it('should manage focus trapping within the panel', async () => {
        panel.generateContent(mockSpotData);
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        firstElement.focus();
        // Simulate tabbing forward from the last element to loop to the first
        fireEvent.keyDown(lastElement, { key: 'Tab' });
        expect(document.activeElement).toBe(firstElement);

        // Simulate tabbing backward from the first element to loop to the last
        fireEvent.keyDown(firstElement, { key: 'Tab', shiftKey: true });
        expect(document.activeElement).toBe(lastElement);
    });

    it('should allow keyboard navigation for compass points', async () => {
        panel.generateContent(mockSpotData);
        const firstCompassPoint = container.querySelector('.compass-point');
        firstCompassPoint.focus();

        expect(document.activeElement).toBe(firstCompassPoint);

        // Simulate ArrowRight
        fireEvent.keyDown(firstCompassPoint, { key: 'ArrowRight' });
        const nextCompassPoint = firstCompassPoint.nextElementSibling;
        expect(document.activeElement).toBe(nextCompassPoint);
    });

    it('should allow keyboard navigation for calendar months', async () => {
        panel.generateContent(mockSpotData);
        const firstMonthCell = container.querySelector('.month-cell');
        firstMonthCell.focus();

        expect(document.activeElement).toBe(firstMonthCell);

        // Simulate ArrowDown
        fireEvent.keyDown(firstMonthCell, { key: 'ArrowDown' });
        const nextMonthCell = firstMonthCell.nextElementSibling; // Assuming linear for simplicity
        expect(document.activeElement).toBe(nextMonthCell);
    });

    // Focus Management
    it('should return focus to the first interactive element of a newly activated tab', async () => {
        panel.generateContent(mockSpotData);
        const wavesTab = container.querySelector('[data-tab-id="waves"]');
        
        wavesTab.click(); // Activate waves tab

        const wavesPanel = container.querySelector('#panel-waves');
        const firstFocusableInWavesPanel = wavesPanel.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // Wait for the setTimeout in _handleTabClick to execute
        await new Promise(resolve => setTimeout(resolve, 100)); // Adjust timeout as per _handleTabClick

        expect(document.activeElement).toBe(firstFocusableInWavesPanel);
    });

    // Color Contrast (conceptual - typically done with automated tools or manual review)
    it('should ensure sufficient color contrast ratios (conceptual test)', async () => {
        // This test is conceptual and relies on `jest-axe` to catch contrast issues.
        // For more detailed color contrast testing, dedicated tools or manual review are often used.
        // `jest-axe` will flag common contrast issues if they are present in the DOM.
        panel.generateContent(mockSpotData);
        const results = await axe(container);
        expect(results).toHaveNoViolations(); // This implicitly checks contrast if configured in axe-core
    });

    // Reduced Motion Support
    it('should support prefers-reduced-motion CSS media query (conceptual test)', () => {
        // This is primarily a CSS concern, but the JS could conditionally apply/remove animations.
        // For this test, we can check if the enableAnimations option is respected.
        const panelNoAnimations = new SurfSpotPanel({
            container: container,
            enableAnimations: false // Explicitly disable animations
        });
        panelNoAnimations.generateContent(mockSpotData);

        const sectionHeader = container.querySelector('.section-header');
        const sectionContent = sectionHeader.nextElementSibling;

        // When enableAnimations is false, _animateSectionToggle should not be called
        const animateSpy = jest.spyOn(panelNoAnimations, '_animateSectionToggle');
        sectionHeader.click();
        expect(animateSpy).not.toHaveBeenCalled();
        animateSpy.mockRestore();
        panelNoAnimations.destroy();
    });
});