/**
 * @fileoverview Comprehensive test suite for the redesigned surf map interface
 * @version 1.0.0
 * @description This test suite verifies all functionality of the redesigned surf map interface,
 * including search functionality, positioning, counter, filter removal, and design consistency.
 */

// Import required modules
import { SurfMap } from './surf-map-core.js';
import { SurfSearch } from './surf-search.js';
import { SurfSpotsCounter } from './surf-counter.js';

/**
 * Comprehensive test suite for the surf map interface
 */
class ComprehensiveSurfMapTest {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
        this.testContainer = null;
        this.surfMap = null;
    }

    /**
     * Runs all tests and returns the results
     * @returns {Array} Test results
     */
    async runAllTests() {
        this.log('Starting comprehensive surf map tests...', 'info');
        
        try {
            // Initialize test environment
            await this.setupTestEnvironment();
            
            // Run all test categories
            await this.testSearchFunctionality();
            await this.testSearchControlPositioning();
            await this.testDynamicCounter();
            await this.testFilterRemoval();
            await this.testDesignConsistency();
            await this.testOverallFunctionality();
            
            // Cleanup
            this.cleanupTestEnvironment();
            
            this.log('All tests completed!', 'info');
            return this.testResults;
        } catch (error) {
            this.log(`Test suite failed: ${error.message}`, 'fail');
            return this.testResults;
        }
    }

    /**
     * Sets up the test environment
     */
    async setupTestEnvironment() {
        this.log('Setting up test environment...', 'info');
        
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.style.width = '800px';
        this.testContainer.style.height = '600px';
        this.testContainer.style.position = 'absolute';
        this.testContainer.style.top = '-1000px';
        this.testContainer.style.left = '-1000px';
        document.body.appendChild(this.testContainer);
        
        // Create search input element
        const searchContainer = document.createElement('div');
        searchContainer.className = 'surf-map-search';
        searchContainer.style.position = 'absolute';
        searchContainer.style.top = '10px';
        searchContainer.style.left = '10px';
        searchContainer.style.zIndex = '1000';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'surf-map-search-input';
        searchInput.placeholder = 'Search surf spots...';
        searchInput.style.width = '200px';
        searchInput.style.padding = '8px';
        searchInput.style.border = '1px solid #ccc';
        searchInput.style.borderRadius = '4px';
        
        searchContainer.appendChild(searchInput);
        this.testContainer.appendChild(searchContainer);
        
        // Create counter element
        const counterElement = document.createElement('div');
        counterElement.className = 'surf-spots-counter';
        counterElement.id = 'surf-spots-counter';
        counterElement.style.position = 'absolute';
        counterElement.style.top = '50px';
        counterElement.style.left = '10px';
        
        const numberElement = document.createElement('span');
        numberElement.className = 'counter-number';
        numberElement.id = 'counter-number';
        numberElement.textContent = '0';
        
        const labelElement = document.createElement('span');
        labelElement.className = 'counter-label';
        labelElement.id = 'counter-label';
        labelElement.textContent = 'surf spots';
        
        counterElement.appendChild(numberElement);
        counterElement.appendChild(labelElement);
        this.testContainer.appendChild(counterElement);
        
        // Initialize surf map
        this.surfMap = new SurfMap(this.testContainer);
        
        await new Promise((resolve) => {
            this.surfMap.on('ready', resolve);
        });
        
        this.log('Test environment setup complete', 'pass');
    }

    /**
     * Cleans up the test environment
     */
    cleanupTestEnvironment() {
        this.log('Cleaning up test environment...', 'info');
        
        if (this.surfMap) {
            this.surfMap.destroy();
        }
        
        if (this.testContainer && this.testContainer.parentNode) {
            this.testContainer.parentNode.removeChild(this.testContainer);
        }
        
        this.log('Test environment cleanup complete', 'pass');
    }

    /**
     * Tests search functionality
     */
    async testSearchFunctionality() {
        this.startTestGroup('Search Functionality');
        
        try {
            // Test 1: Search initialization
            await this.runTest('Search initialization', async () => {
                const searchManager = this.surfMap.getSearchManager();
                if (!searchManager) {
                    throw new Error('Search manager not found');
                }
                return true;
            });
            
            // Test 2: Search with valid term
            await this.runTest('Search with valid term', async () => {
                const searchManager = this.surfMap.getSearchManager();
                searchManager.performSearch('corralejo');
                
                // Wait for search to complete
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const results = searchManager.getSearchResults();
                if (results.length === 0) {
                    throw new Error('Search returned no results');
                }
                return true;
            });
            
            // Test 3: Search with multiple terms
            await this.runTest('Search with multiple terms', async () => {
                const searchManager = this.surfMap.getSearchManager();
                searchManager.performSearch('north shore');
                
                // Wait for search to complete
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const results = searchManager.getSearchResults();
                if (results.length === 0) {
                    throw new Error('Multi-word search returned no results');
                }
                return true;
            });
            
            // Test 4: Search across different properties
            await this.runTest('Search across different properties', async () => {
                const searchManager = this.surfMap.getSearchManager();
                const testTerms = [
                    { term: 'beginner', category: 'ability level' },
                    { term: 'reef', category: 'wave type' },
                    { term: 'corralejo', category: 'location' },
                    { term: 'shortboard', category: 'practicalities' }
                ];
                
                for (const test of testTerms) {
                    searchManager.performSearch(test.term);
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    const results = searchManager.getSearchResults();
                    if (results.length === 0) {
                        throw new Error(`Search for "${test.term}" (${test.category}) returned no results`);
                    }
                }
                return true;
            });
            
            // Test 5: Search result highlighting
            await this.runTest('Search result highlighting', async () => {
                const searchManager = this.surfMap.getSearchManager();
                searchManager.performSearch('corralejo');
                
                // Wait for search to complete
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const results = searchManager.getSearchResults();
                if (results.length === 0) {
                    throw new Error('No results to check highlighting');
                }
                
                // Check if results have matched categories
                const hasHighlightedResults = results.some(result => 
                    result.matchedCategories && result.matchedCategories.length > 0
                );
                
                if (!hasHighlightedResults) {
                    throw new Error('No highlighted results found');
                }
                
                return true;
            });
            
            // Test 6: Search result click
            await this.runTest('Search result click', async () => {
                const searchManager = this.surfMap.getSearchManager();
                searchManager.performSearch('corralejo');
                
                // Wait for search to complete
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const results = searchManager.getSearchResults();
                if (results.length === 0) {
                    throw new Error('No results to test click');
                }
                
                // Test clicking on the first result
                const firstResult = results[0];
                let clickHandled = false;
                
                this.surfMap.on('searchResultClick', () => {
                    clickHandled = true;
                });
                
                searchManager.selectResult(firstResult);
                await new Promise(resolve => setTimeout(resolve, 300));
                
                if (!clickHandled) {
                    throw new Error('Search result click not handled');
                }
                
                return true;
            });
            
            // Test 7: Clear search
            await this.runTest('Clear search', async () => {
                const searchManager = this.surfMap.getSearchManager();
                searchManager.performSearch('corralejo');
                
                // Wait for search to complete
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Clear search
                searchManager.clearSearch();
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const resultsAfterClear = searchManager.getSearchResults();
                if (resultsAfterClear.length !== 0) {
                    throw new Error('Clear search failed');
                }
                
                return true;
            });
            
            // Test 8: Search results popup behavior
            await this.runTest('Search results popup behavior', async () => {
                const searchManager = this.surfMap.getSearchManager();
                const searchInput = document.querySelector('.surf-map-search-input');
                
                // Focus on search input
                searchInput.focus();
                searchManager.performSearch('corralejo');
                
                // Wait for search to complete
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Check if results container is visible
                const resultsContainer = document.querySelector('.surf-map-search-results');
                if (!resultsContainer || !resultsContainer.classList.contains('visible')) {
                    throw new Error('Search results popup not visible');
                }
                
                // Blur the search input
                searchInput.blur();
                await new Promise(resolve => setTimeout(resolve, 250));
                
                // Check if results container is hidden
                if (resultsContainer.classList.contains('visible')) {
                    throw new Error('Search results popup not hidden on blur');
                }
                
                return true;
            });
            
        } catch (error) {
            this.log(`Search functionality test failed: ${error.message}`, 'fail');
        }
    }

    /**
     * Tests search control positioning
     */
    async testSearchControlPositioning() {
        this.startTestGroup('Search Control Positioning');
        
        try {
            // Test 1: Left side positioning
            await this.runTest('Left side positioning', async () => {
                const leftSideContainer = document.querySelector('.left-side-search-container');
                if (!leftSideContainer) {
                    throw new Error('Left side search container not found');
                }
                
                const computedStyle = window.getComputedStyle(leftSideContainer);
                if (computedStyle.position !== 'fixed') {
                    throw new Error('Left side container is not positioned fixed');
                }
                
                const left = parseInt(computedStyle.left);
                if (left < 0 || left > 100) {
                    throw new Error('Left side container is not positioned on the left side');
                }
                
                return true;
            });
            
            // Test 2: Responsive behavior on different screen sizes
            await this.runTest('Responsive behavior', async () => {
                // Test desktop size
                window.innerWidth = 1200;
                const leftSideContainer = document.querySelector('.left-side-search-container');
                const desktopStyle = window.getComputedStyle(leftSideContainer);
                
                if (desktopStyle.transform !== 'none') {
                    throw new Error('Left side container should be visible on desktop');
                }
                
                // Test mobile size
                window.innerWidth = 480;
                const mobileStyle = window.getComputedStyle(leftSideContainer);
                
                if (mobileStyle.transform === 'none') {
                    throw new Error('Left side container should be hidden on mobile by default');
                }
                
                return true;
            });
            
            // Test 3: Mobile toggle functionality
            await this.runTest('Mobile toggle functionality', async () => {
                window.innerWidth = 480;
                
                const mobileToggle = document.querySelector('.mobile-search-toggle');
                if (!mobileToggle) {
                    throw new Error('Mobile search toggle button not found');
                }
                
                if (mobileToggle.style.display === 'none') {
                    throw new Error('Mobile search toggle should be visible on mobile');
                }
                
                // Test toggle functionality
                const leftSideContainer = document.querySelector('.left-side-search-container');
                const initialStyle = window.getComputedStyle(leftSideContainer);
                
                // Click toggle
                mobileToggle.click();
                
                // Wait for transition
                await new Promise(resolve => setTimeout(resolve, 350));
                
                const afterClickStyle = window.getComputedStyle(leftSideContainer);
                
                if (initialStyle.transform === afterClickStyle.transform) {
                    throw new Error('Mobile toggle did not change container visibility');
                }
                
                return true;
            });
            
        } catch (error) {
            this.log(`Search control positioning test failed: ${error.message}`, 'fail');
        }
    }

    /**
     * Tests dynamic counter
     */
    async testDynamicCounter() {
        this.startTestGroup('Dynamic Counter');
        
        try {
            // Test 1: Counter initialization
            await this.runTest('Counter initialization', async () => {
                const counterElement = document.getElementById('surf-spots-counter');
                if (!counterElement) {
                    throw new Error('Counter element not found');
                }
                
                const numberElement = counterElement.querySelector('.counter-number');
                const labelElement = counterElement.querySelector('.counter-label');
                
                if (!numberElement || !labelElement) {
                    throw new Error('Counter sub-elements not found');
                }
                
                return true;
            });
            
            // Test 2: Counter shows total number of spots initially
            await this.runTest('Counter shows total spots initially', async () => {
                const spotsManager = this.surfMap.getSpotsManager();
                const totalSpots = spotsManager.getAllSpots().length;
                
                const counterElement = document.getElementById('surf-spots-counter');
                const numberElement = counterElement.querySelector('.counter-number');
                
                if (parseInt(numberElement.textContent) !== totalSpots) {
                    throw new Error(`Counter should show ${totalSpots} but shows ${numberElement.textContent}`);
                }
                
                return true;
            });
            
            // Test 3: Counter updates during search
            await this.runTest('Counter updates during search', async () => {
                const searchManager = this.surfMap.getSearchManager();
                const counterElement = document.getElementById('surf-spots-counter');
                const numberElement = counterElement.querySelector('.counter-number');
                
                const initialCount = parseInt(numberElement.textContent);
                
                // Perform search
                searchManager.performSearch('corralejo');
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const searchResults = searchManager.getSearchResults();
                const afterSearchCount = parseInt(numberElement.textContent);
                
                if (afterSearchCount !== searchResults.length) {
                    throw new Error(`Counter should show ${searchResults.length} but shows ${afterSearchCount}`);
                }
                
                if (afterSearchCount === initialCount) {
                    throw new Error('Counter should change after search');
                }
                
                return true;
            });
            
            // Test 4: Counter updates when search is cleared
            await this.runTest('Counter updates when search is cleared', async () => {
                const searchManager = this.surfMap.getSearchManager();
                const spotsManager = this.surfMap.getSpotsManager();
                const counterElement = document.getElementById('surf-spots-counter');
                const numberElement = counterElement.querySelector('.counter-number');
                
                // Perform search first
                searchManager.performSearch('corralejo');
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const searchCount = parseInt(numberElement.textContent);
                
                // Clear search
                searchManager.clearSearch();
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const totalSpots = spotsManager.getAllSpots().length;
                const afterClearCount = parseInt(numberElement.textContent);
                
                if (afterClearCount !== totalSpots) {
                    throw new Error(`Counter should show ${totalSpots} after clear but shows ${afterClearCount}`);
                }
                
                if (afterClearCount === searchCount) {
                    throw new Error('Counter should change after search is cleared');
                }
                
                return true;
            });
            
            // Test 5: Number formatting
            await this.runTest('Number formatting', async () => {
                const counterElement = document.getElementById('surf-spots-counter');
                const counter = new SurfSpotsCounter(counterElement);
                
                // Test large number formatting
                counter.updateCount(1000);
                const numberElement = counterElement.querySelector('.counter-number');
                
                if (numberElement.textContent !== '1,000') {
                    throw new Error(`Number should be formatted as "1,000" but is "${numberElement.textContent}"`);
                }
                
                return true;
            });
            
            // Test 6: Animations
            await this.runTest('Counter animations', async () => {
                const counterElement = document.getElementById('surf-spots-counter');
                const counter = new SurfSpotsCounter(counterElement);
                const numberElement = counterElement.querySelector('.counter-number');
                
                // Update counter to trigger animation
                counter.updateCount(50);
                
                // Check if animation class is applied
                if (!numberElement.classList.contains('updating')) {
                    throw new Error('Animation class not applied to counter');
                }
                
                // Wait for animation to complete
                await new Promise(resolve => setTimeout(resolve, 350));
                
                // Check if animation class is removed
                if (numberElement.classList.contains('updating')) {
                    throw new Error('Animation class not removed after animation completes');
                }
                
                return true;
            });
            
        } catch (error) {
            this.log(`Dynamic counter test failed: ${error.message}`, 'fail');
        }
    }

    /**
     * Tests filter removal
     */
    async testFilterRemoval() {
        this.startTestGroup('Filter Removal');
        
        try {
            // Test 1: No filter UI elements visible
            await this.runTest('No filter UI elements visible', async () => {
                const filterElements = document.querySelectorAll('[class*="filter"]');
                if (filterElements.length > 0) {
                    throw new Error(`Found ${filterElements.length} filter-related elements`);
                }
                
                return true;
            });
            
            // Test 2: No filter JavaScript errors
            await this.runTest('No filter JavaScript errors', async () => {
                // Check if filter manager is not initialized
                const filterManager = this.surfMap.getFilterManager && this.surfMap.getFilterManager();
                if (filterManager) {
                    throw new Error('Filter manager should not be initialized');
                }
                
                // Check if filter-related methods are not available
                if (typeof this.surfMap.applyFilters === 'function') {
                    throw new Error('Apply filters method should not be available');
                }
                
                return true;
            });
            
            // Test 3: Search works without filters
            await this.runTest('Search works without filters', async () => {
                const searchManager = this.surfMap.getSearchManager();
                
                // Perform search
                searchManager.performSearch('corralejo');
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const results = searchManager.getSearchResults();
                if (results.length === 0) {
                    throw new Error('Search should work without filters');
                }
                
                return true;
            });
            
        } catch (error) {
            this.log(`Filter removal test failed: ${error.message}`, 'fail');
        }
    }

    /**
     * Tests design consistency
     */
    async testDesignConsistency() {
        this.startTestGroup('Design Consistency');
        
        try {
            // Test 1: Consistent styling across elements
            await this.runTest('Consistent styling across elements', async () => {
                const searchInput = document.querySelector('.surf-map-search-input');
                const searchBtn = document.querySelector('.surf-map-search-btn');
                const clearBtn = document.querySelector('.surf-map-clear-btn');
                
                if (!searchInput || !searchBtn || !clearBtn) {
                    throw new Error('Search elements not found');
                }
                
                const searchInputStyle = window.getComputedStyle(searchInput);
                const searchBtnStyle = window.getComputedStyle(searchBtn);
                const clearBtnStyle = window.getComputedStyle(clearBtn);
                
                // Check color consistency
                if (searchInputStyle.color !== searchBtnStyle.color) {
                    throw new Error('Search input and button colors are inconsistent');
                }
                
                return true;
            });
            
            // Test 2: Responsive behavior
            await this.runTest('Responsive behavior', async () => {
                const leftSideContainer = document.querySelector('.left-side-search-container');
                
                // Test desktop size
                window.innerWidth = 1200;
                const desktopStyle = window.getComputedStyle(leftSideContainer);
                
                // Test mobile size
                window.innerWidth = 480;
                const mobileStyle = window.getComputedStyle(leftSideContainer);
                
                // Check if styles change for responsive behavior
                if (desktopStyle.width === mobileStyle.width) {
                    throw new Error('Container width should change for responsive behavior');
                }
                
                return true;
            });
            
            // Test 3: Hover states and transitions
            await this.runTest('Hover states and transitions', async () => {
                const searchBtn = document.querySelector('.surf-map-search-btn');
                const searchBtnStyle = window.getComputedStyle(searchBtn);
                
                if (searchBtnStyle.transition === 'all 0s ease 0s') {
                    throw new Error('Search button should have transitions');
                }
                
                return true;
            });
            
            // Test 4: Accessibility features
            await this.runTest('Accessibility features', async () => {
                const searchInput = document.querySelector('.surf-map-search-input');
                const searchBtn = document.querySelector('.surf-map-search-btn');
                const counterElement = document.getElementById('surf-spots-counter');
                
                // Check ARIA attributes
                if (!searchInput.getAttribute('aria-label')) {
                    throw new Error('Search input should have aria-label');
                }
                
                if (!searchBtn.getAttribute('aria-label')) {
                    throw new Error('Search button should have aria-label');
                }
                
                if (!counterElement.getAttribute('aria-label')) {
                    throw new Error('Counter should have aria-label');
                }
                
                if (!counterElement.getAttribute('aria-live')) {
                    throw new Error('Counter should have aria-live attribute');
                }
                
                return true;
            });
            
        } catch (error) {
            this.log(`Design consistency test failed: ${error.message}`, 'fail');
        }
    }

    /**
     * Tests overall functionality
     */
    async testOverallFunctionality() {
        this.startTestGroup('Overall Functionality');
        
        try {
            // Test 1: Map interactions work correctly
            await this.runTest('Map interactions work correctly', async () => {
                const canvas = this.surfMap.canvas;
                if (!canvas) {
                    throw new Error('Map canvas not found');
                }
                
                // Test zoom
                const initialZoom = this.surfMap.state.zoom;
                this.surfMap.zoomIn(0.1);
                
                if (this.surfMap.state.zoom <= initialZoom) {
                    throw new Error('Zoom in did not work');
                }
                
                // Test pan
                const initialPanX = this.surfMap.state.panX;
                this.surfMap.pan(10, 10);
                
                if (this.surfMap.state.panX === initialPanX) {
                    throw new Error('Pan did not work');
                }
                
                return true;
            });
            
            // Test 2: Surf spot modals open correctly
            await this.runTest('Surf spot modals open correctly', async () => {
                const spotsManager = this.surfMap.getSpotsManager();
                const spots = spotsManager.getAllSpots();
                
                if (spots.length === 0) {
                    throw new Error('No surf spots found');
                }
                
                // Get the first spot
                const firstSpot = spots[0];
                
                // Test opening modal
                const spotModal = this.surfMap.getSpotModal();
                if (!spotModal) {
                    throw new Error('Spot modal not found');
                }
                
                spotModal.open(firstSpot);
                
                // Check if modal is open
                const modalElement = document.querySelector('.surf-spot-modal');
                if (!modalElement || !modalElement.classList.contains('active')) {
                    throw new Error('Modal did not open');
                }
                
                // Close modal
                spotModal.close();
                
                return true;
            });
            
            // Test 3: Marker visibility and interactions
            await this.runTest('Marker visibility and interactions', async () => {
                const markersManager = this.surfMap.getMarkersManager();
                if (!markersManager) {
                    throw new Error('Markers manager not found');
                }
                
                // Test marker visibility
                const spotsManager = this.surfMap.getSpotsManager();
                const allSpots = spotsManager.getAllSpots();
                
                if (allSpots.length === 0) {
                    throw new Error('No surf spots found');
                }
                
                // Check if markers are initialized
                const markers = markersManager.getAllMarkers();
                if (markers.length !== allSpots.length) {
                    throw new Error(`Expected ${allSpots.length} markers, found ${markers.length}`);
                }
                
                return true;
            });
            
            // Test 4: Search and counter integration
            await this.runTest('Search and counter integration', async () => {
                const searchManager = this.surfMap.getSearchManager();
                const spotsManager = this.surfMap.getSpotsManager();
                const counterElement = document.getElementById('surf-spots-counter');
                const numberElement = counterElement.querySelector('.counter-number');
                
                const totalSpots = spotsManager.getAllSpots().length;
                const initialCount = parseInt(numberElement.textContent);
                
                if (initialCount !== totalSpots) {
                    throw new Error(`Initial counter should show ${totalSpots} but shows ${initialCount}`);
                }
                
                // Perform search
                searchManager.performSearch('corralejo');
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const searchResults = searchManager.getSearchResults();
                const afterSearchCount = parseInt(numberElement.textContent);
                
                if (afterSearchCount !== searchResults.length) {
                    throw new Error(`Counter should show ${searchResults.length} after search but shows ${afterSearchCount}`);
                }
                
                // Clear search
                searchManager.clearSearch();
                await new Promise(resolve => setTimeout(resolve, 300));
                
                const afterClearCount = parseInt(numberElement.textContent);
                
                if (afterClearCount !== totalSpots) {
                    throw new Error(`Counter should show ${totalSpots} after clear but shows ${afterClearCount}`);
                }
                
                return true;
            });
            
        } catch (error) {
            this.log(`Overall functionality test failed: ${error.message}`, 'fail');
        }
    }

    /**
     * Runs a single test
     * @param {string} testName - Name of the test
     * @param {Function} testFn - Test function
     */
    async runTest(testName, testFn) {
        this.currentTest = testName;
        this.log(`Running test: ${testName}`, 'info');
        
        try {
            const result = await testFn();
            this.log(`✓ ${testName}`, 'pass');
            this.testResults.push({ name: testName, status: 'pass', error: null });
            return result;
        } catch (error) {
            this.log(`✗ ${testName}: ${error.message}`, 'fail');
            this.testResults.push({ name: testName, status: 'fail', error: error.message });
            throw error;
        }
    }

    /**
     * Starts a new test group
     * @param {string} groupName - Name of the test group
     */
    startTestGroup(groupName) {
        this.log(`\n=== Testing ${groupName} ===`, 'info');
    }

    /**
     * Logs a message
     * @param {string} message - Message to log
     * @param {string} type - Type of message (info, pass, fail)
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = type === 'pass' ? '✓' : type === 'fail' ? '✗' : '•';
        console.log(`${timestamp} ${prefix} ${message}`);
    }

    /**
     * Generates a test report
     * @returns {Object} Test report
     */
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.status === 'pass').length;
        const failedTests = this.testResults.filter(test => test.status === 'fail');
        
        return {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: totalTests - passedTests,
                passRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) + '%' : '0%'
            },
            failedTests: failedTests.map(test => ({
                name: test.name,
                error: test.error
            })),
            allTests: this.testResults
        };
    }
}

// Export the test class
export { ComprehensiveSurfMapTest };

// Test runner function for browser execution
window.runComprehensiveSurfMapTests = async function() {
    try {
        // Import the test class
        const { ComprehensiveSurfMapTest } = await import('./comprehensive-surf-map.test.js');
        
        // Create test instance
        const testSuite = new ComprehensiveSurfMapTest();
        
        // Run tests
        const results = await testSuite.runAllTests();
        
        // Generate and display report
        const report = testSuite.generateReport();
        
        // Display results in a formatted way
        displayTestResults(report);
        
        return report;
    } catch (error) {
        console.error('Failed to run comprehensive tests:', error);
        return { error: error.message };
    }
};

// Function to display test results in the browser
function displayTestResults(report) {
    // Create a results container if it doesn't exist
    let resultsContainer = document.getElementById('test-results-container');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'test-results-container';
        resultsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            overflow-y: auto;
            background: white;
            border: 2px solid #333;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: monospace;
            font-size: 14px;
        `;
        document.body.appendChild(resultsContainer);
    }

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Add header
    const header = document.createElement('h2');
    header.textContent = 'Comprehensive Surf Map Test Results';
    header.style.cssText = 'margin-top: 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;';
    resultsContainer.appendChild(header);

    // Add summary
    const summary = document.createElement('div');
    summary.innerHTML = `
        <p><strong>Total Tests:</strong> ${report.summary.total}</p>
        <p><strong>Passed:</strong> <span style="color: green;">${report.summary.passed}</span></p>
        <p><strong>Failed:</strong> <span style="color: red;">${report.summary.failed}</span></p>
        <p><strong>Pass Rate:</strong> ${report.summary.passRate}</p>
    `;
    summary.style.cssText = 'background: #f5f5f5; padding: 10px; border-radius: 4px; margin-bottom: 20px;';
    resultsContainer.appendChild(summary);

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        cursor: pointer;
    `;
    closeBtn.onclick = () => resultsContainer.remove();
    resultsContainer.appendChild(closeBtn);

    // Add test results
    const testResultsDiv = document.createElement('div');
    
    // Group tests by category
    const testCategories = {};
    report.allTests.forEach(test => {
        // Extract category from test name (first word before space)
        const category = test.name.split(' ')[0];
        if (!testCategories[category]) {
            testCategories[category] = [];
        }
        testCategories[category].push(test);
    });
    
    Object.keys(testCategories).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.style.cssText = 'margin-bottom: 15px;';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = category;
        categoryTitle.style.cssText = 'margin: 0 0 10px 0; color: #555;';
        categoryDiv.appendChild(categoryTitle);
        
        testCategories[category].forEach(test => {
            const testDiv = document.createElement('div');
            testDiv.style.cssText = `
                padding: 8px;
                margin-bottom: 5px;
                border-radius: 4px;
                background: ${test.status === 'pass' ? '#e8f5e8' : '#ffeaea'};
                border-left: 4px solid ${test.status === 'pass' ? '#4caf50' : '#f44336'};
            `;
            
            const testName = document.createElement('div');
            testName.textContent = `${test.status === 'pass' ? '✓' : '✗'} ${test.name}`;
            testName.style.cssText = 'font-weight: bold; margin-bottom: 4px;';
            testDiv.appendChild(testName);
            
            if (test.status === 'fail' && test.error) {
                const errorMsg = document.createElement('div');
                errorMsg.textContent = `Error: ${test.error}`;
                errorMsg.style.cssText = 'color: #d32f2f; font-size: 12px; margin-top: 4px;';
                testDiv.appendChild(errorMsg);
            }
            
            categoryDiv.appendChild(testDiv);
        });
        
        testResultsDiv.appendChild(categoryDiv);
    });
    
    resultsContainer.appendChild(testResultsDiv);

    // Add export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Results';
    exportBtn.style.cssText = `
        margin-top: 15px;
        background: #2196f3;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
        width: 100%;
    `;
    exportBtn.onclick = () => {
        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'surf-map-test-results.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    resultsContainer.appendChild(exportBtn);
}