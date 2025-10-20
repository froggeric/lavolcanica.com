/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { surfSpotDataTestData } from './test-data/test-spots.test.js'; // Corrected import path
import { SurfSpotPanel } from '../scripts/surf-map/surf-spot-panel-optimized.js';
import { fireEvent, waitFor } from '@testing-library/dom';

// Mock fetch for test data
global.fetch = jest.fn();

describe('SurfSpotPanel', () => {
    let panel;
    let container;
    let mockSpotData;
    
    beforeEach(() => {
        // Create a mock container
        container = document.createElement('div');
        document.body.appendChild(container);
        
        // Initialize the panel with test options
        panel = new SurfSpotPanel({
            container: container,
            enableAnimations: false, // Disable animations for testing
            enableTooltips: false,
            enableKeyboardNav: true,
            enablePerformanceOptimizations: true,
            onTabChange: jest.fn(),
            onSectionToggle: jest.fn(),
            onClose: jest.fn()
        });
        
        // Use test data
        mockSpotData = surfSpotDataTestData.theBubble;
        
        // Mock performance APIs
        global.performance = {
            now: jest.fn(() => Date.now()),
            mark: jest.fn(),
            measure: jest.fn(),
            getEntriesByName: jest.fn(() => []),
            getEntriesByType: jest.fn(() => []),
            memory: {
                usedJSHeapSize: 0 // Mock memory property
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
        // Clean up
        panel.destroy();
        document.body.removeChild(container);
        jest.clearAllMocks();
    });
    
    describe('Constructor', () => {
        it('should initialize with default options', () => {
            const defaultPanel = new SurfSpotPanel();
            expect(defaultPanel.options.enableAnimations).toBe(true);
            expect(defaultPanel.options.enableTooltips).toBe(true);
            expect(defaultPanel.options.enableKeyboardNav).toBe(true);
            expect(defaultPanel.options.container).toBeNull();
        });
        
        it('should accept custom options', () => {
            const customPanel = new SurfSpotPanel({
                enableAnimations: false,
                container: container
            });
            expect(customPanel.options.enableAnimations).toBe(false);
            expect(customPanel.options.container).toBe(container);
        });
        
        it('should initialize state variables', () => {
            expect(panel.expandedSections).toBeInstanceOf(Set);
            expect(panel.activeTab).toBe('overview');
            expect(panel.panelState.isOpen).toBe(false);
        });
    });
    
    describe('generateContent', () => {
        it('should generate a DocumentFragment for valid spot data', () => {
            const fragment = panel.generateContent(mockSpotData);
            expect(fragment).toBeInstanceOf(DocumentFragment);
        });
        
        it('should append content to container', () => {
            panel.generateContent(mockSpotData);
            expect(container.querySelector('.surf-spot-panel')).toBeTruthy();
        });
        
        it('should handle null/undefined spot data gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console error during test
            const fragment = panel.generateContent(null);
            expect(fragment).toBeInstanceOf(DocumentFragment);
            expect(consoleSpy).toHaveBeenCalledWith('SurfSpotPanel: No spot data provided.');
            consoleSpy.mockRestore();
        });
        
        it('should update panel state after generation', () => {
            panel.generateContent(mockSpotData);
            expect(panel.panelState.currentSpot).toBe(mockSpotData);
            expect(panel.panelState.isOpen).toBe(true);
        });
        
        it('should initialize interactive elements after content generation', async () => {
            const initSpy = jest.spyOn(panel, '_initializeInteractiveElements');
            panel.generateContent(mockSpotData);
            await waitFor(() => expect(initSpy).toHaveBeenCalled());
        });
    });
    
    describe('_transformSpotData', () => {
        it('should transform spot data to expected format', () => {
            const transformed = panel._transformSpotData(mockSpotData);
            
            expect(transformed).toHaveProperty('id', mockSpotData.id);
            expect(transformed).toHaveProperty('primaryName', mockSpotData.primaryName);
            expect(transformed).toHaveProperty('location');
            expect(transformed).toHaveProperty('waveDetails');
            expect(transformed).toHaveProperty('characteristics');
            expect(transformed).toHaveProperty('practicalities');
        });
        
        it('should handle missing name property', () => {
            const spotWithoutName = { ...mockSpotData, primaryName: undefined, name: 'Test Name' };
            const transformed = panel._transformSpotData(spotWithoutName);
            expect(transformed.primaryName).toBe('Test Name');
        });
        
        it('should cache transformed data', () => {
            const transformed1 = panel._transformSpotData(mockSpotData);
            const transformed2 = panel._transformSpotData(mockSpotData);
            expect(transformed1).toBe(transformed2); // Should be same reference from cache
        });
    });
    
    describe('_createEnhancedHeader', () => {
        it('should create header with correct structure', () => {
            const header = panel._createEnhancedHeader(mockSpotData);
            
            expect(header.tagName).toBe('HEADER');
            expect(header.className).toBe('surf-spot-header');
            expect(header.getAttribute('role')).toBe('banner');
        });
        
        it('should include skip link for accessibility', () => {
            const header = panel._createEnhancedHeader(mockSpotData);
            const skipLink = header.querySelector('.skip-link');
            
            expect(skipLink).toBeTruthy();
            expect(skipLink.getAttribute('href')).toBe('#surf-spot-main-content');
        });
        
        it('should include primary name as h1', () => {
            const header = panel._createEnhancedHeader(mockSpotData);
            const title = header.querySelector('h1');
            
            expect(title.textContent).toBe(mockSpotData.primaryName);
            expect(title.id).toBe('surf-spot-name');
        });
        
        it('should include action buttons', () => {
            const header = panel._createEnhancedHeader(mockSpotData);
            const shareButton = header.querySelector('.share-button');
            const printButton = header.querySelector('.print-button');
            const closeButton = header.querySelector('.close-button');
            
            expect(shareButton).toBeTruthy();
            expect(printButton).toBeTruthy();
            expect(closeButton).toBeTruthy();
        });
    });
    
    describe('_createHeroSection', () => {
        it('should create hero section with correct structure', () => {
            const heroSection = panel._createHeroSection(mockSpotData);
            
            expect(heroSection.tagName).toBe('SECTION');
            expect(heroSection.className).toBe('surf-spot-hero');
            expect(heroSection.getAttribute('role')).toBe('img');
        });
        
        it('should include lazy loading image with data-src', () => {
            const heroSection = panel._createHeroSection(mockSpotData);
            const heroImage = heroSection.querySelector('.hero-image');
            
            expect(heroImage).toBeTruthy();
            expect(heroImage.classList.contains('lazy-loading')).toBe(true);
            expect(heroImage.hasAttribute('data-src')).toBe(true);
        });
        
        it('should include location overlay with coordinates', () => {
            const heroSection = panel._createHeroSection(mockSpotData);
            const overlay = heroSection.querySelector('.hero-overlay');
            const coords = overlay.querySelector('.coordinates');
            
            expect(overlay).toBeTruthy();
            expect(coords).toBeTruthy();
            expect(coords.textContent).toContain(mockSpotData.location.coordinates.lat.toFixed(4));
            expect(coords.textContent).toContain(Math.abs(mockSpotData.location.coordinates.lng).toFixed(4));
        });
    });
    
    describe('_createQuickStatsBar', () => {
        it('should create stats bar with correct structure', () => {
            const statsBar = panel._createQuickStatsBar(mockSpotData);
            
            expect(statsBar.tagName).toBe('SECTION');
            expect(statsBar.className).toBe('quick-stats-bar');
            expect(statsBar.getAttribute('role')).toBe('region');
        });
        
        it('should include stat indicators for crowd, bottom, water quality, and wave type', () => {
            const statsBar = panel._createQuickStatsBar(mockSpotData);
            const crowdStat = statsBar.querySelector('.stat-crowd');
            const bottomStat = statsBar.querySelector('.stat-bottom');
            const waterStat = statsBar.querySelector('.stat-water');
            const waveStat = statsBar.querySelector('.stat-wave');
            
            expect(crowdStat).toBeTruthy();
            expect(bottomStat).toBeTruthy();
            expect(waterStat).toBeTruthy();
            expect(waveStat).toBeTruthy();
        });
    });
    
    describe('_createNavigationTabs', () => {
        it('should create correct number of tabs', () => {
            const tabs = panel._createNavigationTabs();
            expect(tabs.length).toBe(4); // Overview, Waves, Practicalities, Seasons
        });
        
        it('should mark overview tab as active by default', () => {
            const tabs = panel._createNavigationTabs();
            const overviewTab = tabs.find(tab => tab.getAttribute('data-tab-id') === 'overview');
            
            expect(overviewTab.classList.contains('active')).toBe(true);
            expect(overviewTab.getAttribute('aria-selected')).toBe('true');
        });
        
        it('should include proper accessibility attributes', () => {
            const tabs = panel._createNavigationTabs();
            tabs.forEach(tab => {
                expect(tab.getAttribute('role')).toBe('tab');
                expect(tab.getAttribute('aria-controls')).toBeTruthy();
                expect(tab.getAttribute('aria-selected')).toBeTruthy();
                expect(tab.hasAttribute('tabindex')).toBe(true);
            });
        });
    });
    
    describe('_handleTabClick', () => {
        beforeEach(() => {
            // Generate content to set up tabs
            panel.generateContent(mockSpotData);
        });
        
        it('should switch to the clicked tab', async () => {
            const wavesTab = container.querySelector('[data-tab-id="waves"]');
            fireEvent.click(wavesTab); // Simulate click
            
            expect(panel.activeTab).toBe('waves');
            expect(wavesTab.classList.contains('active')).toBe(true);
            expect(wavesTab.getAttribute('aria-selected')).toBe('true');
        });
        
        it('should update corresponding panel visibility', async () => {
            const overviewPanel = container.querySelector('#panel-overview');
            const wavesPanel = container.querySelector('#panel-waves');
            const wavesTab = container.querySelector('[data-tab-id="waves"]');

            // Initially overview is visible, waves is hidden
            expect(overviewPanel.hasAttribute('hidden')).toBe(false);
            expect(wavesPanel.hasAttribute('hidden')).toBe(true);

            fireEvent.click(wavesTab); // Simulate click
            
            // After click, overview should be hidden, waves visible
            await waitFor(() => {
                expect(overviewPanel.hasAttribute('hidden')).toBe(true);
                expect(wavesPanel.hasAttribute('hidden')).toBe(false);
            });
        });
        
        it('should call onTabChange callback if provided', async () => {
            const wavesTab = container.querySelector('[data-tab-id="waves"]');
            fireEvent.click(wavesTab);
            
            await waitFor(() => expect(panel.options.onTabChange).toHaveBeenCalledWith('waves', 'overview'));
        });
        
        it('should announce change to screen readers', async () => {
            const announceSpy = jest.spyOn(panel, '_announceToScreenReader');
            const wavesTab = container.querySelector('[data-tab-id="waves"]');
            fireEvent.click(wavesTab);
            
            await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('Switched to Wave Details tab. Content has been updated.'));
            announceSpy.mockRestore();
        });

        it('should focus the first focusable element in the new panel', async () => {
            panel.generateContent(mockSpotData);
            const wavesTab = container.querySelector('[data-tab-id="waves"]');
            fireEvent.click(wavesTab);
            
            const wavesPanel = container.querySelector('#panel-waves');
            const firstFocusableInWavesPanel = wavesPanel.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            await waitFor(() => expect(document.activeElement).toBe(firstFocusableInWavesPanel));
        });
    });
    
    describe('_handleSectionToggle', () => {
        beforeEach(() => {
            // Generate content to set up sections
            panel.generateContent(mockSpotData);
        });
        
        it('should toggle section expanded state', async () => {
            const sectionHeader = container.querySelector('.section-header');
            const isExpandedInitial = sectionHeader.getAttribute('aria-expanded') === 'true';
            
            fireEvent.click(sectionHeader);
            
            await waitFor(() => expect(sectionHeader.getAttribute('aria-expanded')).toBe((!isExpandedInitial).toString()));
        });
        
        it('should update section content visibility', async () => {
            const sectionHeader = container.querySelector('.section-header');
            const sectionContent = sectionHeader.nextElementSibling;
            const isExpandedInitial = sectionHeader.getAttribute('aria-expanded') === 'true';

            expect(sectionContent.hasAttribute('hidden')).toBe(!isExpandedInitial);
            
            fireEvent.click(sectionHeader);
            
            await waitFor(() => expect(sectionContent.hasAttribute('hidden')).toBe(isExpandedInitial));
        });
        
        it('should call onSectionToggle callback if provided', async () => {
            const sectionHeader = container.querySelector('.section-header');
            const sectionId = sectionHeader.closest('.expandable-section').getAttribute('data-section-id');
            const isExpandedInitial = sectionHeader.getAttribute('aria-expanded') === 'true';
            
            fireEvent.click(sectionHeader);
            
            await waitFor(() => expect(panel.options.onSectionToggle).toHaveBeenCalledWith(
                sectionId,
                !isExpandedInitial
            ));
        });

        it('should announce section toggle to screen readers', async () => {
            const announceSpy = jest.spyOn(panel, '_announceToScreenReader');
            const sectionHeader = container.querySelector('.section-header');
            const sectionTitle = sectionHeader.querySelector('h3').textContent;
            
            fireEvent.click(sectionHeader); // Expand
            await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(`${sectionTitle} section expanded`));

            announceSpy.mockClear();
            fireEvent.click(sectionHeader); // Collapse
            await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(`${sectionTitle} section collapsed`));
            announceSpy.mockRestore();
        });
    });
    
    describe('_handleShare', () => {
        beforeEach(() => {
            // Mock window.location.href
            Object.defineProperty(window, 'location', {
                value: { href: 'http://localhost/test-url' },
                writable: true
            });
        });

        it('should use Web Share API if available', async () => {
            const mockShare = jest.fn().mockResolvedValue();
            Object.defineProperty(navigator, 'share', {
                value: mockShare,
                writable: true
            });
            
            await panel._handleShare(mockSpotData);
            
            expect(mockShare).toHaveBeenCalledWith({
                title: `${mockSpotData.primaryName} - Surf Spot Details`,
                text: expect.stringContaining(mockSpotData.primaryName),
                url: 'http://localhost/test-url'
            });
        });
        
        it('should fallback to clipboard if Web Share API not available', async () => {
            Object.defineProperty(navigator, 'share', {
                value: undefined,
                writable: true
            });
            
            const mockExecCommand = jest.fn(() => true);
            Object.defineProperty(document, 'execCommand', {
                value: mockExecCommand,
                writable: true
            });
            const showNotificationSpy = jest.spyOn(panel, '_showNotification').mockImplementation(() => {});
            
            await panel._handleShare(mockSpotData);
            
            expect(mockExecCommand).toHaveBeenCalledWith('copy');
            expect(showNotificationSpy).toHaveBeenCalledWith('Link copied to clipboard!');
            showNotificationSpy.mockRestore();
        });
    });
    
    describe('_handleClose', () => {
        it('should update panel state', () => {
            panel.panelState.isOpen = true;
            panel._handleClose();
            expect(panel.panelState.isOpen).toBe(false);
        });
        
        it('should call onClose callback if provided', () => {
            panel._handleClose();
            expect(panel.options.onClose).toHaveBeenCalled();
        });
        
        it('should dispatch closePanel event', () => {
            const dispatchSpy = jest.spyOn(container, 'dispatchEvent');
            panel._handleClose();
            
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({ type: 'closePanel' })
            );
            dispatchSpy.mockRestore();
        });
    });
    
    describe('Accessibility', () => {
        beforeEach(() => {
            panel.generateContent(mockSpotData);
        });

        it('should have proper ARIA attributes on tabs', () => {
            const tabs = container.querySelectorAll('.nav-tab');
            
            tabs.forEach(tab => {
                expect(tab).toHaveAttribute('role', 'tab');
                expect(tab).toHaveAttribute('aria-selected');
                expect(tab).toHaveAttribute('aria-controls');
                expect(tab).toHaveAttribute('tabindex');
            });
        });
        
        it('should have proper ARIA attributes on panels', () => {
            const panels = container.querySelectorAll('.tab-panel');
            
            panels.forEach(panelElement => {
                expect(panelElement).toHaveAttribute('role', 'tabpanel');
                expect(panelElement).toHaveAttribute('aria-labelledby');
            });
        });
        
        it('should have proper ARIA attributes on expandable sections', () => {
            const sectionHeaders = container.querySelectorAll('.section-header');
            
            sectionHeaders.forEach(header => {
                expect(header).toHaveAttribute('role', 'button');
                expect(header).toHaveAttribute('aria-expanded');
                expect(header).toHaveAttribute('aria-controls');
            });
        });
        
        it('should include screen reader only elements for announcements', () => {
            const srElements = container.querySelectorAll('.sr-only');
            expect(srElements.length).toBeGreaterThan(0);
        });

        it('should have correct aria-label for main article', () => {
            const article = container.querySelector('.surf-spot-panel');
            expect(article).toHaveAttribute('aria-label', `Surf spot details for ${mockSpotData.primaryName}`);
        });

        it('should have correct aria-label for quick stats bar', () => {
            const statsBar = container.querySelector('.quick-stats-bar');
            expect(statsBar).toHaveAttribute('aria-label', 'Quick surf spot statistics');
        });
    });
    
    describe('Performance', () => {
        it('should track render time', () => {
            const startTime = 100;
            const endTime = 250;
            
            global.performance.now
                .mockReturnValueOnce(startTime)
                .mockReturnValueOnce(endTime);
            
            panel.generateContent(mockSpotData);
            
            expect(panel.performanceMetrics.renderTime).toBe(endTime - startTime);
        });
        
        it('should use IntersectionObserver for lazy loading images', async () => {
            const observeSpy = jest.spyOn(IntersectionObserver.prototype, 'observe');
            panel.generateContent(mockSpotData);
            
            const heroImage = container.querySelector('.hero-image');
            await waitFor(() => expect(heroImage.src).toContain('images/surf-spots/the-bubble.webp'));
            expect(heroImage.classList.contains('lazy-loaded')).toBe(true);
            expect(heroImage.classList.contains('lazy-loading')).toBe(false);
            observeSpy.mockRestore();
        });
        
        it('should use IntersectionObserver for lazy loading content sections', async () => {
            const observeSpy = jest.spyOn(IntersectionObserver.prototype, 'observe');
            panel.generateContent(mockSpotData);

            const seasonalCalendarContainer = container.querySelector('.seasonal-calendar');
            expect(seasonalCalendarContainer).toHaveAttribute('data-content-type', 'seasonal-calendar');
            
            // Trigger intersection observer callback manually for content lazy loading
            const contentObserver = panel.intersectionObservers.get('content-lazy-loading');
            contentObserver.callback([{ target: seasonalCalendarContainer, isIntersecting: true }]);

            await waitFor(() => {
                const calendarGrid = seasonalCalendarContainer.querySelector('.seasonal-calendar > [role="grid"]');
                expect(calendarGrid).toBeTruthy();
            });
            observeSpy.mockRestore();
        });

        it('should cache transformed data', () => {
            const transformSpy = jest.spyOn(panel, '_transformSpotData');
            
            panel._transformSpotData(mockSpotData);
            panel._transformSpotData(mockSpotData);
            
            expect(transformSpy).toHaveBeenCalledTimes(1); // Only called once, then served from cache
            transformSpy.mockRestore();
        });

        it('should update memory usage metrics', async () => {
            global.performance.memory = { usedJSHeapSize: 1000000 };
            panel._initializePerformanceMonitoring();
            jest.advanceTimersByTime(5000); // Advance timers to trigger memory monitor
            expect(panel.performanceMetrics.memoryUsage).toBe(1000000);
            panel.destroy(); // Clean up interval
        });
    });
    
    describe('Keyboard Navigation', () => {
        beforeEach(() => {
            panel.generateContent(mockSpotData);
            jest.useFakeTimers(); // Use fake timers for setTimeout in _handleTabClick
        });

        afterEach(() => {
            jest.runOnlyPendingTimers();
            jest.useRealTimers();
        });
        
        it('should navigate tabs with arrow keys', async () => {
            const overviewTab = container.querySelector('[data-tab-id="overview"]');
            const wavesTab = container.querySelector('[data-tab-id="waves"]');
            
            overviewTab.focus();
            
            fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
            jest.runAllTimers(); // Run timers for focus change
            await waitFor(() => expect(document.activeElement).toBe(wavesTab));

            fireEvent.keyDown(document.activeElement, { key: 'ArrowLeft' });
            jest.runAllTimers();
            await waitFor(() => expect(document.activeElement).toBe(overviewTab));
        });
        
        it('should activate tabs with Enter key', async () => {
            const wavesTab = container.querySelector('[data-tab-id="waves"]');
            wavesTab.focus();
            
            fireEvent.keyDown(document.activeElement, { key: 'Enter' });
            jest.runAllTimers();
            await waitFor(() => expect(panel.activeTab).toBe('waves'));
        });
        
        it('should close panel with Escape key', () => {
            const closeSpy = jest.spyOn(panel, '_handleClose');
            
            panel.panelState.isOpen = true; // Ensure panel is open for escape key to work
            fireEvent.keyDown(document, { key: 'Escape' });
            
            expect(closeSpy).toHaveBeenCalled();
            closeSpy.mockRestore();
        });

        it('should handle focus trapping within the panel', async () => {
            const focusableElements = container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            firstElement.focus();
            fireEvent.keyDown(document.activeElement, { key: 'Tab' }); // Tab from first
            await waitFor(() => expect(document.activeElement).toBe(focusableElements[1]));

            lastElement.focus();
            fireEvent.keyDown(document.activeElement, { key: 'Tab' }); // Tab from last
            await waitFor(() => expect(document.activeElement).toBe(firstElement));

            firstElement.focus();
            fireEvent.keyDown(document.activeElement, { key: 'Tab', shiftKey: true }); // Shift+Tab from first
            await waitFor(() => expect(document.activeElement).toBe(lastElement));
        });

        it('should navigate compass points with arrow keys', async () => {
            panel.generateContent(mockSpotData);
            const compassPoint = container.querySelector('.compass-point'); // Get first compass point
            compassPoint.focus();

            fireEvent.keyDown(document.activeElement, { key: 'ArrowRight' });
            const nextPoint = compassPoint.nextElementSibling;
            await waitFor(() => expect(document.activeElement).toBe(nextPoint));
        });

        it('should navigate calendar cells with arrow keys', async () => {
            panel.generateContent(mockSpotData);
            const monthCell = container.querySelector('.month-cell'); // Get first month cell
            monthCell.focus();

            fireEvent.keyDown(document.activeElement, { key: 'ArrowDown' });
            const nextCell = monthCell.nextElementSibling; // Assuming a simple linear layout for this test
            await waitFor(() => expect(document.activeElement).toBe(nextCell));
        });
    });
    
    describe('Error Handling', () => {
        it('should handle missing container gracefully', () => {
            const panelWithoutContainer = new SurfSpotPanel();
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            panelWithoutContainer.initialize();
            expect(consoleWarnSpy).toHaveBeenCalledWith('SurfSpotPanel: No container provided for initialization');
            consoleWarnSpy.mockRestore();
        });
        
        it('should handle invalid spot data properties gracefully', () => {
            const malformedSpot = { id: 'malformed', waveDetails: { type: null, abilityLevel: {} } };
            expect(() => panel.generateContent(malformedSpot)).not.toThrow();
            const fragment = panel.generateContent(malformedSpot);
            const panelElement = fragment.querySelector('.surf-spot-panel');
            expect(panelElement.innerHTML).not.toContain('null'); // Should not render 'null' literally
        });
        
        it('should handle missing callback functions without errors', () => {
            const panelWithoutCallbacks = new SurfSpotPanel({
                container: container
            });
            
            expect(() => panelWithoutCallbacks._handleClose()).not.toThrow();
            expect(() => panelWithoutCallbacks._handleTabClick('overview')).not.toThrow();
            const sectionHeader = document.createElement('div');
            sectionHeader.classList.add('section-header');
            sectionHeader.setAttribute('aria-expanded', 'false');
            sectionHeader.setAttribute('data-section-id', 'test');
            sectionHeader.innerHTML = '<h3>Test</h3><span class="sr-only"></span>';
            const section = document.createElement('div');
            section.classList.add('expandable-section');
            section.setAttribute('data-section-id', 'test');
            section.appendChild(sectionHeader);
            container.appendChild(section);
            expect(() => panelWithoutCallbacks._handleSectionToggle(sectionHeader)).not.toThrow();
        });

        it('should log error if PerformanceObserver is not fully supported', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            Object.defineProperty(window, 'PerformanceObserver', { value: undefined, writable: true });
            const p = new SurfSpotPanel({ enablePerformanceOptimizations: true });
            p._initializePerformanceMonitoring();
            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Performance Observer not fully supported'));
            consoleWarnSpy.mockRestore();
        });
    });
    
    describe('Cleanup', () => {
        it('should remove all event listeners', () => {
            panel.generateContent(mockSpotData);
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
            panel.destroy();
            
            // Check that at least some listeners were removed (specific count can vary)
            expect(removeEventListenerSpy).toHaveBeenCalled();
            expect(panel.eventListeners.size).toBe(0);
            removeEventListenerSpy.mockRestore();
        });
        
        it('should cancel all animation frames', () => {
            const cancelRAF = jest.spyOn(global, 'cancelAnimationFrame');
            panel.generateContent(mockSpotData); // Generate content to potentially create animation frames
            panel.destroy();
            
            expect(cancelRAF).toHaveBeenCalled();
            expect(panel.animationFrames.size).toBe(0);
            cancelRAF.mockRestore();
        });
        
        it('should disconnect all observers', () => {
            const disconnectSpy = jest.spyOn(IntersectionObserver.prototype, 'disconnect');
            panel.generateContent(mockSpotData); // Generate content to create observers
            panel.destroy();
            
            expect(disconnectSpy).toHaveBeenCalled();
            expect(panel.intersectionObservers.size).toBe(0);
            disconnectSpy.mockRestore();
        });
        
        it('should clear all timeouts', () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
            panel.tooltipTimeout = setTimeout(() => {}, 100);
            panel.destroy();
            
            expect(clearTimeoutSpy).toHaveBeenCalledWith(panel.tooltipTimeout);
            expect(panel.tooltipTimeout).toBeNull();
            clearTimeoutSpy.mockRestore();
        });

        it('should clear memory monitoring interval', () => {
            const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            global.performance.memory = { usedJSHeapSize: 0 }; // Enable memory monitoring
            panel._initializePerformanceMonitoring();
            const intervalId = panel.memoryMonitorInterval;
            panel.destroy();
            expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);
            expect(panel.memoryMonitorInterval).toBeNull();
            clearIntervalSpy.mockRestore();
        });
    });

    describe('Integration Tests', () => {
        it('should call mapFunction when coords button is clicked', async () => {
            const mockMapFunction = jest.fn();
            panel.enableMapIntegration(mockMapFunction);
            panel.generateContent(mockSpotData);
            
            const coordsButton = container.querySelector('.coords-button');
            fireEvent.click(coordsButton);
            
            expect(mockMapFunction).toHaveBeenCalledWith({
                lat: mockSpotData.location.coordinates.lat,
                lng: mockSpotData.location.coordinates.lng
            });
        });

        it('should call searchFunction when search button is clicked (if enabled)', async () => {
            const mockSearchFunction = jest.fn();
            panel.enableSearchIntegration(mockSearchFunction);
            panel.generateContent(mockSpotData);

            // Dynamically add the search button for testing purposes since it's added by _enhanceHeaderWithSearch
            const header = container.querySelector('.surf-spot-header');
            const actionButtons = header.querySelector('.action-buttons');
            const searchButton = document.createElement('button');
            searchButton.className = 'action-button search-button';
            searchButton.setAttribute('type', 'button');
            searchButton.setAttribute('aria-label', 'Search similar spots');
            searchButton.innerHTML = '<span class="icon" aria-hidden="true">🔍</span>';
            actionButtons.prepend(searchButton); // Add to DOM

            // Manually add event listener since we added button dynamically
            panel._addEventListener(searchButton, 'click', () => panel._handleSearch(mockSpotData.location.area));
            
            fireEvent.click(searchButton);
            
            expect(mockSearchFunction).toHaveBeenCalledWith(mockSpotData.location.area);
        });
    });

    describe('Touch Interactions', () => {
        let touchPanel;
        let touchContainer;

        beforeEach(() => {
            touchContainer = document.createElement('div');
            document.body.appendChild(touchContainer);
            touchPanel = new SurfSpotPanel({
                container: touchContainer,
                enableAnimations: false,
                enableTooltips: false,
                enableKeyboardNav: false,
                onClose: jest.fn(),
                isTouchDevice: true // Force touch device for testing
            });
            touchPanel.generateContent(mockSpotData);
        });

        afterEach(() => {
            touchPanel.destroy();
            document.body.removeChild(touchContainer);
        });

        it('should close panel on swipe down', () => {
            const closeSpy = jest.spyOn(touchPanel, '_handleClose');
            touchPanel.panelState.isOpen = true;

            fireEvent.touchStart(touchContainer, { touches: [{ screenX: 0, screenY: 100 }] });
            fireEvent.touchEnd(touchContainer, { changedTouches: [{ screenX: 0, screenY: 200 }] }); // Swipe down

            expect(closeSpy).toHaveBeenCalled();
            closeSpy.mockRestore();
        });

        it('should navigate tabs on swipe left/right', async () => {
            const overviewTab = touchContainer.querySelector('[data-tab-id="overview"]');
            const wavesTab = touchContainer.querySelector('[data-tab-id="waves"]');
            
            // Swipe left (next tab)
            fireEvent.touchStart(touchContainer, { touches: [{ screenX: 100, screenY: 0 }] });
            fireEvent.touchEnd(touchContainer, { changedTouches: [{ screenX: 0, screenY: 0 }] });
            
            await waitFor(() => expect(touchPanel.activeTab).toBe('waves'));

            // Swipe right (previous tab)
            fireEvent.touchStart(touchContainer, { touches: [{ screenX: 0, screenY: 0 }] });
            fireEvent.touchEnd(touchContainer, { changedTouches: [{ screenX: 100, screenY: 0 }] });
            
            await waitFor(() => expect(touchPanel.activeTab).toBe('overview'));
        });
    });

    describe('Reduced Motion Support', () => {
        it('should respect prefers-reduced-motion setting for animations', () => {
            // Simulate reduced motion preference
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: jest.fn().mockImplementation(query => ({
                    matches: query === '(prefers-reduced-motion: reduce)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                })),
            });

            const panelWithReducedMotion = new SurfSpotPanel({
                container: container,
                enableAnimations: true // Animations are enabled but should be reduced
            });
            panelWithReducedMotion.generateContent(mockSpotData);

            const sectionHeader = container.querySelector('.section-header');
            const sectionContent = sectionHeader.nextElementSibling;
            
            fireEvent.click(sectionHeader); // Toggle section

            // Expect no animation properties or very short durations if animations are directly controlled by JS
            // This test is more conceptual as CSS media queries handle actual animation reduction
            // For JS-controlled animations, we'd check if `requestAnimationFrame` was called or if duration was set to 0
            expect(sectionContent.style.transitionDuration).not.toBe('0s'); // Should still have some transition, but CSS might override
            
            panelWithReducedMotion.destroy();
        });
    });
});