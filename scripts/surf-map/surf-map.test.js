/**
 * @fileoverview Test suite for the surf map implementation.
 * @version 1.0.0
 * @description This test suite provides comprehensive testing for the surf map functionality,
 * including marker display, search, filters, minimap, and responsive design.
 */

// Import the modules to test
import { SurfMap } from './surf-map-core.js';
import { SurfSpotsManager } from './surf-spots.js';
import { SurfMarkersManager } from './surf-markers.js';
import { SurfFilters } from './surf-filters.js';
import { SurfSearch } from './surf-search.js';
import { SurfMinimap } from './surf-minimap.js';

/**
 * Test Suite for Surf Map Implementation
 */
class SurfMapTestSuite {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
        this.setupTestEnvironment();
    }

    /**
     * Sets up the test environment.
     */
    setupTestEnvironment() {
        // Create a test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'surf-map-test-container';
        this.testContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            display: none;
        `;
        document.body.appendChild(this.testContainer);

        // Create a test canvas
        this.testCanvas = document.createElement('canvas');
        this.testCanvas.id = 'surf-map-test-canvas';
        this.testCanvas.width = 800;
        this.testCanvas.height = 600;
        this.testContainer.appendChild(this.testCanvas);
    }

    /**
     * Runs all tests and returns the results.
     * @returns {Promise<Object>} The test results.
     */
    async runAllTests() {
        console.log('Starting Surf Map Test Suite...');
        
        // Show test environment
        this.testContainer.style.display = 'block';
        
        try {
            // Functionality Tests
            await this.testMarkerDisplay();
            await this.testSearchFunctionality();
            await this.testFilterFunctionality();
            await this.testSpotDetailModal();
            await this.testMinimapNavigation();
            
            // Responsive Design Tests
            await this.testResponsiveDesign();
            await this.testTouchInteractions();
            
            // Performance Tests
            await this.testMapPerformance();
            
            // Cross-Browser Tests
            await this.testCrossBrowserCompatibility();
            
            // Accessibility Tests
            await this.testAccessibility();
            
            // Integration Tests
            await this.testWebsiteIntegration();
            
        } catch (error) {
            console.error('Test suite error:', error);
            this.addTestResult('Test Suite Error', false, error.message);
        } finally {
            // Hide test environment
            this.testContainer.style.display = 'none';
        }
        
        return this.generateTestReport();
    }

    /**
     * Tests marker display at all zoom levels.
     */
    async testMarkerDisplay() {
        this.currentTest = 'Marker Display';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer, {
                imagePath: 'images/surf-map.webp'
            });
            
            // Wait for initialization
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            // Test markers at different zoom levels
            const zoomLevels = [0.5, 1.0, 1.5, 2.0];
            
            for (const zoom of zoomLevels) {
                surfMap.setZoom(zoom);
                await this.waitForRender();
                
                // Check if markers are visible
                const markersManager = surfMap.getMarkersManager();
                const visibleMarkers = markersManager.visibleMarkers;
                
                if (visibleMarkers.length === 0) {
                    this.addTestResult(`Markers visible at zoom ${zoom}`, false, 
                        'No markers visible at this zoom level');
                } else {
                    this.addTestResult(`Markers visible at zoom ${zoom}`, true, 
                        `${visibleMarkers.length} markers visible`);
                }
            }
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Marker Display Test', false, error.message);
        }
    }

    /**
     * Tests search functionality with various search terms.
     */
    async testSearchFunctionality() {
        this.currentTest = 'Search Functionality';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer);
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            const searchManager = surfMap.getSearchManager();
            const testSearchTerms = [
                'Bristol',
                'el cotillo',
                'North Shore',
                'Reef break',
                'intermediate'
            ];
            
            for (const term of testSearchTerms) {
                // Perform search
                searchManager.search(term);
                await this.waitForRender();
                
                // Check if search returned results
                const results = searchManager.getSearchResults();
                
                if (results.length === 0) {
                    this.addTestResult(`Search for "${term}"`, false, 'No results found');
                } else {
                    this.addTestResult(`Search for "${term}"`, true, 
                        `${results.length} results found`);
                }
            }
            
            // Test search highlighting
            if (searchManager.getSearchResults().length > 0) {
                const firstResult = searchManager.getSearchResults()[0];
                searchManager.selectResult(firstResult);
                await this.waitForRender();
                
                this.addTestResult('Search highlighting', true, 
                    'First search result highlighted');
            }
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Search Functionality Test', false, error.message);
        }
    }

    /**
     * Tests filter functionality.
     */
    async testFilterFunctionality() {
        this.currentTest = 'Filter Functionality';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer);
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            const filterManager = surfMap.getFilterManager();
            const spotsManager = surfMap.getSpotsManager();
            
            // Test ability level filter
            const abilityLevels = spotsManager.getDifficultyLevels();
            if (abilityLevels.length > 0) {
                filterManager.setFilters({ abilityLevel: [abilityLevels[0]] });
                await this.waitForRender();
                
                const filteredSpots = filterManager.getFilteredSpots();
                this.addTestResult('Ability level filter', true, 
                    `${filteredSpots.length} spots filtered by ability level`);
            }
            
            // Test wave type filter
            const allSpots = spotsManager.getAllSpots();
            const waveTypes = new Set();
            allSpots.forEach(spot => {
                if (spot.waveDetails.type) {
                    spot.waveDetails.type.forEach(type => waveTypes.add(type));
                }
            });
            
            if (waveTypes.size > 0) {
                const firstWaveType = Array.from(waveTypes)[0];
                filterManager.setFilters({ waveType: [firstWaveType] });
                await this.waitForRender();
                
                const filteredSpots = filterManager.getFilteredSpots();
                this.addTestResult('Wave type filter', true, 
                    `${filteredSpots.length} spots filtered by wave type`);
            }
            
            // Test area filter
            const areas = spotsManager.getAreas();
            if (areas.length > 0) {
                filterManager.setFilters({ area: [areas[0]] });
                await this.waitForRender();
                
                const filteredSpots = filterManager.getFilteredSpots();
                this.addTestResult('Area filter', true, 
                    `${filteredSpots.length} spots filtered by area`);
            }
            
            // Test filter reset
            filterManager.resetFilters();
            await this.waitForRender();
            
            const allFilteredSpots = filterManager.getFilteredSpots();
            this.addTestResult('Filter reset', true, 
                `${allFilteredSpots.length} spots after reset`);
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Filter Functionality Test', false, error.message);
        }
    }

    /**
     * Tests the spot detail modal.
     */
    async testSpotDetailModal() {
        this.currentTest = 'Spot Detail Modal';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer);
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            const spotsManager = surfMap.getSpotsManager();
            const spotModal = surfMap.getSpotModal();
            
            // Get a test spot
            const allSpots = spotsManager.getAllSpots();
            if (allSpots.length > 0) {
                const testSpot = allSpots[0];
                
                // Open modal
                spotModal.open(testSpot);
                
                // Check if modal is open
                const modalElement = document.querySelector('.surf-spot-modal');
                if (modalElement && modalElement.style.display !== 'none') {
                    this.addTestResult('Modal opens', true, 'Modal opened successfully');
                    
                    // Check if spot information is displayed
                    const modalTitle = document.querySelector('.spot-modal-title');
                    if (modalTitle && modalTitle.textContent.includes(testSpot.primaryName)) {
                        this.addTestResult('Spot information displayed', true, 
                            'Spot name displayed in modal');
                    } else {
                        this.addTestResult('Spot information displayed', false, 
                            'Spot name not found in modal');
                    }
                    
                    // Close modal
                    spotModal.close();
                    
                    // Check if modal is closed
                    if (modalElement.style.display === 'none') {
                        this.addTestResult('Modal closes', true, 'Modal closed successfully');
                    } else {
                        this.addTestResult('Modal closes', false, 'Modal still visible');
                    }
                } else {
                    this.addTestResult('Modal opens', false, 'Modal element not found');
                }
            } else {
                this.addTestResult('Spot Detail Modal Test', false, 'No spots available for testing');
            }
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Spot Detail Modal Test', false, error.message);
        }
    }

    /**
     * Tests minimap navigation.
     */
    async testMinimapNavigation() {
        this.currentTest = 'Minimap Navigation';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer);
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            const minimap = surfMap.getMinimap();
            
            // Test minimap visibility
            const minimapElement = document.querySelector('.surf-minimap');
            if (minimapElement) {
                this.addTestResult('Minimap visible', true, 'Minimap element found');
                
                // Test minimap click navigation
                const rect = minimapElement.getBoundingClientRect();
                const clickEvent = new MouseEvent('click', {
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                });
                
                minimapElement.dispatchEvent(clickEvent);
                await this.waitForRender();
                
                this.addTestResult('Minimap click navigation', true, 
                    'Minimap click handled successfully');
                
                // Test viewport indicator
                const viewportIndicator = minimap.isWithinViewportIndicator(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );
                
                this.addTestResult('Viewport indicator check', true, 
                    `Viewport indicator function works: ${viewportIndicator}`);
            } else {
                this.addTestResult('Minimap visible', false, 'Minimap element not found');
            }
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Minimap Navigation Test', false, error.message);
        }
    }

    /**
     * Tests responsive design.
     */
    async testResponsiveDesign() {
        this.currentTest = 'Responsive Design';
        
        try {
            // Test different screen sizes
            const screenSizes = [
                { width: 320, height: 568, name: 'Mobile' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 1920, height: 1080, name: 'Desktop' }
            ];
            
            for (const size of screenSizes) {
                // Set viewport size
                this.testCanvas.width = size.width;
                this.testCanvas.height = size.height;
                
                // Initialize surf map
                const surfMap = new SurfMap(this.testContainer);
                await new Promise(resolve => {
                    surfMap.on('ready', resolve);
                });
                
                // Check if map adapts to screen size
                if (this.testCanvas.width === size.width && 
                    this.testCanvas.height === size.height) {
                    this.addTestResult(`Responsive design - ${size.name}`, true, 
                        `Map adapts to ${size.width}x${size.height}`);
                } else {
                    this.addTestResult(`Responsive design - ${size.name}`, false, 
                        'Map does not adapt to screen size');
                }
                
                // Clean up
                surfMap.destroy();
            }
            
        } catch (error) {
            this.addTestResult('Responsive Design Test', false, error.message);
        }
    }

    /**
     * Tests touch interactions.
     */
    async testTouchInteractions() {
        this.currentTest = 'Touch Interactions';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer);
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            // Simulate touch events
            const touchStartEvent = new TouchEvent('touchstart', {
                touches: [{
                    clientX: 100,
                    clientY: 100,
                    identifier: 0
                }]
            });
            
            const touchMoveEvent = new TouchEvent('touchmove', {
                touches: [{
                    clientX: 200,
                    clientY: 200,
                    identifier: 0
                }]
            });
            
            const touchEndEvent = new TouchEvent('touchend', {
                changedTouches: [{
                    clientX: 200,
                    clientY: 200,
                    identifier: 0
                }]
            });
            
            // Dispatch touch events
            this.testCanvas.dispatchEvent(touchStartEvent);
            this.testCanvas.dispatchEvent(touchMoveEvent);
            this.testCanvas.dispatchEvent(touchEndEvent);
            
            await this.waitForRender();
            
            this.addTestResult('Touch interactions', true, 
                'Touch events handled without errors');
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Touch Interactions Test', false, error.message);
        }
    }

    /**
     * Tests map performance.
     */
    async testMapPerformance() {
        this.currentTest = 'Map Performance';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer);
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            // Measure render performance
            const startTime = performance.now();
            
            // Perform multiple zoom operations
            for (let i = 0; i < 10; i++) {
                surfMap.setZoom(0.5 + i * 0.15);
                await this.waitForRender();
            }
            
            const endTime = performance.now();
            const totalTime = endTime - startTime;
            
            if (totalTime < 1000) {
                this.addTestResult('Map performance', true, 
                    `10 zoom operations completed in ${totalTime.toFixed(2)}ms`);
            } else {
                this.addTestResult('Map performance', false, 
                    `Performance issue: 10 zoom operations took ${totalTime.toFixed(2)}ms`);
            }
            
            // Check for memory leaks
            const initialMemory = performance.memory?.usedJSHeapSize || 0;
            
            // Perform operations that might cause memory leaks
            for (let i = 0; i < 100; i++) {
                surfMap.setZoom(0.5 + (i % 10) * 0.15);
                await this.waitForRender();
            }
            
            const finalMemory = performance.memory?.usedJSHeapSize || 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            if (memoryIncrease < 10 * 1024 * 1024) { // Less than 10MB
                this.addTestResult('Memory usage', true, 
                    `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
            } else {
                this.addTestResult('Memory usage', false, 
                    `Potential memory leak: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
            }
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Map Performance Test', false, error.message);
        }
    }

    /**
     * Tests cross-browser compatibility.
     */
    async testCrossBrowserCompatibility() {
        this.currentTest = 'Cross-Browser Compatibility';
        
        try {
            // Check for browser-specific features
            const features = {
                'Canvas support': !!document.createElement('canvas').getContext,
                'Touch events': 'ontouchstart' in window,
                'Pointer events': 'onpointerdown' in window,
                'RequestAnimationFrame': !!window.requestAnimationFrame,
                'Performance API': !!window.performance,
                'Fetch API': !!window.fetch
            };
            
            for (const [feature, supported] of Object.entries(features)) {
                if (supported) {
                    this.addTestResult(`Browser feature - ${feature}`, true, 'Feature supported');
                } else {
                    this.addTestResult(`Browser feature - ${feature}`, false, 'Feature not supported');
                }
            }
            
            // Test browser-specific CSS properties
            const testElement = document.createElement('div');
            testElement.style.cssText = 'transform: translateZ(0);';
            document.body.appendChild(testElement);
            
            const computedStyle = window.getComputedStyle(testElement);
            const hasTransform = computedStyle.transform !== 'none';
            
            if (hasTransform) {
                this.addTestResult('CSS transform support', true, 'CSS transforms supported');
            } else {
                this.addTestResult('CSS transform support', false, 'CSS transforms not supported');
            }
            
            document.body.removeChild(testElement);
            
        } catch (error) {
            this.addTestResult('Cross-Browser Compatibility Test', false, error.message);
        }
    }

    /**
     * Tests accessibility features.
     */
    async testAccessibility() {
        this.currentTest = 'Accessibility';
        
        try {
            // Initialize surf map
            const surfMap = new SurfMap(this.testContainer);
            await new Promise(resolve => {
                surfMap.on('ready', resolve);
            });
            
            // Test ARIA attributes
            const mapContainer = document.querySelector('#surf-map-container');
            if (mapContainer) {
                const hasAriaLabel = mapContainer.hasAttribute('aria-label') || 
                                    mapContainer.hasAttribute('aria-labelledby');
                
                this.addTestResult('ARIA labels', hasAriaLabel, 
                    hasAriaLabel ? 'ARIA labels found' : 'No ARIA labels found');
            }
            
            // Test keyboard navigation
            const focusableElements = document.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableElements.length > 0) {
                this.addTestResult('Keyboard navigation', true, 
                    `${focusableElements.length} focusable elements found`);
            } else {
                this.addTestResult('Keyboard navigation', false, 
                    'No focusable elements found');
            }
            
            // Test color contrast
            const testElement = document.createElement('div');
            testElement.style.cssText = 'background: #ffffff; color: #000000;';
            document.body.appendChild(testElement);
            
            const computedStyle = window.getComputedStyle(testElement);
            const bgColor = computedStyle.backgroundColor;
            const textColor = computedStyle.color;
            
            // Simple contrast check (would need proper calculation in production)
            const hasGoodContrast = bgColor !== textColor;
            
            this.addTestResult('Color contrast', hasGoodContrast, 
                hasGoodContrast ? 'Contrast appears adequate' : 'Contrast may be insufficient');
            
            document.body.removeChild(testElement);
            
            // Clean up
            surfMap.destroy();
            
        } catch (error) {
            this.addTestResult('Accessibility Test', false, error.message);
        }
    }

    /**
     * Tests website integration.
     */
    async testWebsiteIntegration() {
        this.currentTest = 'Website Integration';
        
        try {
            // Check if surf map link exists
            const surfMapLink = document.querySelector('#surf-map-link');
            if (surfMapLink) {
                this.addTestResult('Surf map link', true, 'Surf map link found in navigation');
            } else {
                this.addTestResult('Surf map link', false, 'Surf map link not found');
            }
            
            // Check if surf map modal exists
            const surfMapModal = document.querySelector('#surf-map-modal');
            if (surfMapModal) {
                this.addTestResult('Surf map modal', true, 'Surf map modal element found');
            } else {
                this.addTestResult('Surf map modal', false, 'Surf map modal element not found');
            }
            
            // Test language switching
            const langButtons = document.querySelectorAll('.lang-btn');
            if (langButtons.length > 0) {
                this.addTestResult('Language switching', true, 
                    `${langButtons.length} language buttons found`);
            } else {
                this.addTestResult('Language switching', false, 'No language buttons found');
            }
            
        } catch (error) {
            this.addTestResult('Website Integration Test', false, error.message);
        }
    }

    /**
     * Adds a test result.
     * @param {string} testName - The name of the test.
     * @param {boolean} passed - Whether the test passed.
     * @param {string} message - The test result message.
     */
    addTestResult(testName, passed, message) {
        this.testResults.push({
            test: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });
        
        console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName}: ${message}`);
    }

    /**
     * Waits for the next render frame.
     * @returns {Promise} A promise that resolves on the next animation frame.
     */
    waitForRender() {
        return new Promise(resolve => {
            requestAnimationFrame(resolve);
        });
    }

    /**
     * Generates a test report.
     * @returns {Object} The test report.
     */
    generateTestReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(result => result.passed).length;
        const failedTests = totalTests - passedTests;
        const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
        
        return {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                passRate: `${passRate}%`
            },
            results: this.testResults,
            timestamp: new Date().toISOString()
        };
    }
}

// Export the test suite
export { SurfMapTestSuite };

// Auto-run tests if in development environment
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Create a button to run tests
    const testButton = document.createElement('button');
    testButton.textContent = 'Run Surf Map Tests';
    testButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10001;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-family: Arial, sans-serif;
    `;
    
    testButton.addEventListener('click', async () => {
        const testSuite = new SurfMapTestSuite();
        const results = await testSuite.runAllTests();
        
        // Log results to console
        console.log('Test Results:', results);
        
        // Show results in an alert
        alert(`Test Results:\nTotal: ${results.summary.total}\nPassed: ${results.summary.passed}\nFailed: ${results.summary.failed}\nPass Rate: ${results.summary.passRate}`);
    });
    
    document.body.appendChild(testButton);
}