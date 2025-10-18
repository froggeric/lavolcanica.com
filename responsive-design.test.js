/**
 * Responsive Design Test Suite for La Sonora Volcánica Website
 * Tests responsive behavior across all viewports for index.html and surf-map.html
 */

// Define viewport breakpoints for testing
const VIEWPORTS = {
    // Mobile Viewports
    smallMobile: { width: 320, height: 568, label: "Small Mobile (320px)" },
    largeMobile: { width: 375, height: 667, label: "Large Mobile (375px)" },
    phablet: { width: 414, height: 736, label: "Phablet (414px)" },
    
    // Tablet Viewports
    smallTablet: { width: 768, height: 1024, label: "Small Tablet (768px)" },
    largeTablet: { width: 992, height: 768, label: "Large Tablet (992px)" },
    
    // Desktop Viewports
    smallDesktop: { width: 1200, height: 800, label: "Small Desktop (1200px)" },
    largeDesktop: { width: 1440, height: 900, label: "Large Desktop (1440px)" },
    extraLargeDesktop: { width: 1920, height: 1080, label: "Extra Large Desktop (1920px)" }
};

// Test results storage
const testResults = {
    index: {},
    surfMap: {},
    summary: {
        passed: 0,
        failed: 0,
        total: 0
    }
};

// Helper function to record test results
function recordTest(page, viewport, element, test, passed, details) {
    const key = `${viewport.label}-${element}-${test}`;
    
    if (!testResults[page][viewport.label]) {
        testResults[page][viewport.label] = {};
    }
    
    testResults[page][viewport.label][key] = {
        element,
        test,
        passed,
        details
    };
    
    testResults.summary.total++;
    if (passed) {
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }
}

// Helper function to check element visibility
function isElementVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
}

// Helper function to check if element is properly sized for touch (minimum 44px)
function isTouchTarget(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44;
}

// Test index.html responsive behavior
async function testIndexPage(viewport) {
    console.log(`Testing index.html at ${viewport.label}`);
    
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://localhost:3000/index.html');
    await page.waitForLoadState('networkidle');
    
    // Test 1: Header and Navigation
    const header = await page.locator('.main-header').first();
    const hamburgerMenu = await page.locator('.hamburger-menu').first();
    const mainNav = await page.locator('.main-nav').first();
    const navLinks = await page.locator('.nav-links').first();
    
    // Check if header is visible
    const headerVisible = await header.isVisible();
    recordTest('index', viewport, 'Header', 'Visibility', headerVisible, 
               headerVisible ? 'Header is visible' : 'Header is not visible');
    
    // Check hamburger menu visibility (should be visible on mobile, hidden on desktop)
    const hamburgerVisible = await hamburgerMenu.isVisible();
    const expectedHamburgerVisibility = viewport.width < 768;
    recordTest('index', viewport, 'Hamburger Menu', 'Visibility', 
               hamburgerVisible === expectedHamburgerVisibility,
               `Hamburger menu ${hamburgerVisible ? 'visible' : 'hidden'}, expected ${expectedHamburgerVisibility ? 'visible' : 'hidden'}`);
    
    // Check navigation menu visibility
    const navVisible = await mainNav.isVisible();
    recordTest('index', viewport, 'Navigation Menu', 'Visibility', navVisible, 
               navVisible ? 'Navigation menu is visible' : 'Navigation menu is not visible');
    
    // Test 2: Hero Section
    const heroSection = await page.locator('.hero-section').first();
    const heroContent = await page.locator('.hero-content').first();
    const heroLogo = await page.locator('.hero-logo').first();
    const heroTagline = await page.locator('.hero-tagline').first();
    
    const heroVisible = await heroSection.isVisible();
    recordTest('index', viewport, 'Hero Section', 'Visibility', heroVisible, 
               heroVisible ? 'Hero section is visible' : 'Hero section is not visible');
    
    const heroContentVisible = await heroContent.isVisible();
    recordTest('index', viewport, 'Hero Content', 'Visibility', heroContentVisible, 
               heroContentVisible ? 'Hero content is visible' : 'Hero content is not visible');
    
    const heroLogoVisible = await heroLogo.isVisible();
    recordTest('index', viewport, 'Hero Logo', 'Visibility', heroLogoVisible, 
               heroLogoVisible ? 'Hero logo is visible' : 'Hero logo is not visible');
    
    // Test 3: Music Section
    const musicSection = await page.locator('#music').first();
    const musicGrid = await page.locator('.music-grid').first();
    
    const musicVisible = await musicSection.isVisible();
    recordTest('index', viewport, 'Music Section', 'Visibility', musicVisible, 
               musicVisible ? 'Music section is visible' : 'Music section is not visible');
    
    const musicGridVisible = await musicGrid.isVisible();
    recordTest('index', viewport, 'Music Grid', 'Visibility', musicGridVisible, 
               musicGridVisible ? 'Music grid is visible' : 'Music grid is not visible');
    
    // Test 4: About Section
    const aboutSection = await page.locator('#about').first();
    const aboutContent = await page.locator('.about-content').first();
    
    const aboutVisible = await aboutSection.isVisible();
    recordTest('index', viewport, 'About Section', 'Visibility', aboutVisible, 
               aboutVisible ? 'About section is visible' : 'About section is not visible');
    
    const aboutContentVisible = await aboutContent.isVisible();
    recordTest('index', viewport, 'About Content', 'Visibility', aboutContentVisible, 
               aboutContentVisible ? 'About content is visible' : 'About content is not visible');
    
    // Test 5: Collaborators Section
    const collabsSection = await page.locator('#collabs').first();
    const collabsGrid = await page.locator('.collabs-grid').first();
    
    const collabsVisible = await collabsSection.isVisible();
    recordTest('index', viewport, 'Collaborators Section', 'Visibility', collabsVisible, 
               collabsVisible ? 'Collaborators section is visible' : 'Collaborators section is not visible');
    
    const collabsGridVisible = await collabsGrid.isVisible();
    recordTest('index', viewport, 'Collaborators Grid', 'Visibility', collabsGridVisible, 
               collabsGridVisible ? 'Collaborators grid is visible' : 'Collaborators grid is not visible');
    
    // Test 6: Footer
    const footer = await page.locator('.main-footer').first();
    const footerContent = await page.locator('.footer-content').first();
    
    const footerVisible = await footer.isVisible();
    recordTest('index', viewport, 'Footer', 'Visibility', footerVisible, 
               footerVisible ? 'Footer is visible' : 'Footer is not visible');
    
    const footerContentVisible = await footerContent.isVisible();
    recordTest('index', viewport, 'Footer Content', 'Visibility', footerContentVisible, 
               footerContentVisible ? 'Footer content is visible' : 'Footer content is not visible');
    
    // Test 7: Side Panel Overlay
    const sidePanelOverlay = await page.locator('#side-panel-overlay').first();
    const sidePanel = await page.locator('#side-panel').first();
    
    const sidePanelOverlayExists = await sidePanelOverlay.count() > 0;
    recordTest('index', viewport, 'Side Panel Overlay', 'Exists', sidePanelOverlayExists, 
               sidePanelOverlayExists ? 'Side panel overlay exists' : 'Side panel overlay does not exist');
    
    const sidePanelExists = await sidePanel.count() > 0;
    recordTest('index', viewport, 'Side Panel', 'Exists', sidePanelExists, 
               sidePanelExists ? 'Side panel exists' : 'Side panel does not exist');
    
    // Test 8: Mini Audio Player
    const miniPlayer = await page.locator('#mini-player').first();
    
    const miniPlayerExists = await miniPlayer.count() > 0;
    recordTest('index', viewport, 'Mini Player', 'Exists', miniPlayerExists, 
               miniPlayerExists ? 'Mini player exists' : 'Mini player does not exist');
    
    // Test 9: Touch Target Sizes (for mobile viewports)
    if (viewport.width < 768) {
        // Check hamburger menu touch target
        const hamburgerTouchOk = await page.evaluate(() => {
            const hamburger = document.querySelector('.hamburger-menu');
            if (!hamburger) return false;
            const rect = hamburger.getBoundingClientRect();
            return rect.width >= 44 && rect.height >= 44;
        });
        recordTest('index', viewport, 'Hamburger Menu', 'Touch Target Size', hamburgerTouchOk, 
                   hamburgerTouchOk ? 'Hamburger menu meets minimum touch target size' : 'Hamburger menu too small for touch');
        
        // Check CTA button touch targets
        const ctaButtons = await page.locator('.cta-button').all();
        for (let i = 0; i < ctaButtons.length; i++) {
            const ctaTouchOk = await page.evaluate((index) => {
                const ctas = document.querySelectorAll('.cta-button');
                if (!ctas[index]) return false;
                const rect = ctas[index].getBoundingClientRect();
                return rect.width >= 44 && rect.height >= 44;
            }, i);
            recordTest('index', viewport, `CTA Button ${i+1}`, 'Touch Target Size', ctaTouchOk, 
                       ctaTouchOk ? `CTA button ${i+1} meets minimum touch target size` : `CTA button ${i+1} too small for touch`);
        }
    }
    
    // Test 10: Horizontal Scrolling Check
    const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
    });
    recordTest('index', viewport, 'Page', 'Horizontal Scrolling', !hasHorizontalScroll, 
               hasHorizontalScroll ? 'Page requires horizontal scrolling (issue)' : 'Page fits within viewport width');
    
    // Test 11: Text Readability
    const textReadability = await page.evaluate(() => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');
        let issues = 0;
        
        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            
            // Check if font size is reasonable for the viewport
            if (fontSize < 12) issues++;
        });
        
        return issues === 0;
    });
    recordTest('index', viewport, 'Text', 'Readability', textReadability, 
               textReadability ? 'Text is readable at this viewport' : 'Text may be too small at this viewport');
}

// Test surf-map.html responsive behavior
async function testSurfMapPage(viewport) {
    console.log(`Testing surf-map.html at ${viewport.label}`);
    
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://localhost:3000/surf-map.html');
    await page.waitForLoadState('networkidle');
    
    // Test 1: Header and Navigation
    const header = await page.locator('.main-header').first();
    const hamburgerMenu = await page.locator('.hamburger-menu').first();
    const mainNav = await page.locator('.main-nav').first();
    
    // Check if header is visible
    const headerVisible = await header.isVisible();
    recordTest('surfMap', viewport, 'Header', 'Visibility', headerVisible, 
               headerVisible ? 'Header is visible' : 'Header is not visible');
    
    // Check hamburger menu visibility (should be visible on mobile, hidden on desktop)
    const hamburgerVisible = await hamburgerMenu.isVisible();
    const expectedHamburgerVisibility = viewport.width < 768;
    recordTest('surfMap', viewport, 'Hamburger Menu', 'Visibility', 
               hamburgerVisible === expectedHamburgerVisibility,
               `Hamburger menu ${hamburgerVisible ? 'visible' : 'hidden'}, expected ${expectedHamburgerVisibility ? 'visible' : 'hidden'}`);
    
    // Test 2: Map Container
    const mapSection = await page.locator('#surf-map-section').first();
    const mapContainer = await page.locator('#surf-map-container').first();
    
    const mapSectionVisible = await mapSection.isVisible();
    recordTest('surfMap', viewport, 'Map Section', 'Visibility', mapSectionVisible, 
               mapSectionVisible ? 'Map section is visible' : 'Map section is not visible');
    
    const mapContainerVisible = await mapContainer.isVisible();
    recordTest('surfMap', viewport, 'Map Container', 'Visibility', mapContainerVisible, 
               mapContainerVisible ? 'Map container is visible' : 'Map container is not visible');
    
    // Test 3: Search Interface
    const leftSideSearch = await page.locator('#left-side-search').first();
    const mobileSearchToggle = await page.locator('#mobile-search-toggle').first();
    const searchInput = await page.locator('.surf-map-search-input').first();
    
    const leftSideSearchExists = await leftSideSearch.count() > 0;
    recordTest('surfMap', viewport, 'Left Side Search', 'Exists', leftSideSearchExists, 
               leftSideSearchExists ? 'Left side search exists' : 'Left side search does not exist');
    
    const mobileSearchToggleExists = await mobileSearchToggle.count() > 0;
    recordTest('surfMap', viewport, 'Mobile Search Toggle', 'Exists', mobileSearchToggleExists, 
               mobileSearchToggleExists ? 'Mobile search toggle exists' : 'Mobile search toggle does not exist');
    
    // Test 4: Map Controls
    const zoomInBtn = await page.locator('#zoom-in-btn').first();
    const zoomOutBtn = await page.locator('#zoom-out-btn').first();
    const resetViewBtn = await page.locator('#reset-view-btn').first();
    
    const zoomInVisible = await zoomInBtn.isVisible();
    recordTest('surfMap', viewport, 'Zoom In Button', 'Visibility', zoomInVisible, 
               zoomInVisible ? 'Zoom in button is visible' : 'Zoom in button is not visible');
    
    const zoomOutVisible = await zoomOutBtn.isVisible();
    recordTest('surfMap', viewport, 'Zoom Out Button', 'Visibility', zoomOutVisible, 
               zoomOutVisible ? 'Zoom out button is visible' : 'Zoom out button is not visible');
    
    const resetViewVisible = await resetViewBtn.isVisible();
    recordTest('surfMap', viewport, 'Reset View Button', 'Visibility', resetViewVisible, 
               resetViewVisible ? 'Reset view button is visible' : 'Reset view button is not visible');
    
    // Test 5: Minimap
    const minimap = await page.locator('#surf-map-minimap').first();
    
    const minimapExists = await minimap.count() > 0;
    recordTest('surfMap', viewport, 'Minimap', 'Exists', minimapExists, 
               minimapExists ? 'Minimap exists' : 'Minimap does not exist');
    
    // Test 6: Map Legend
    const legend = await page.locator('.surf-map-legend').first();
    
    const legendExists = await legend.count() > 0;
    recordTest('surfMap', viewport, 'Map Legend', 'Exists', legendExists, 
               legendExists ? 'Map legend exists' : 'Map legend does not exist');
    
    // Test 7: Side Panel
    const sidePanelOverlay = await page.locator('#side-panel-overlay').first();
    const sidePanel = await page.locator('#side-panel').first();
    
    const sidePanelOverlayExists = await sidePanelOverlay.count() > 0;
    recordTest('surfMap', viewport, 'Side Panel Overlay', 'Exists', sidePanelOverlayExists, 
               sidePanelOverlayExists ? 'Side panel overlay exists' : 'Side panel overlay does not exist');
    
    const sidePanelExists = await sidePanel.count() > 0;
    recordTest('surfMap', viewport, 'Side Panel', 'Exists', sidePanelExists, 
               sidePanelExists ? 'Side panel exists' : 'Side panel does not exist');
    
    // Test 8: Footer
    const footer = await page.locator('.main-footer').first();
    const footerContent = await page.locator('.footer-content').first();
    
    const footerVisible = await footer.isVisible();
    recordTest('surfMap', viewport, 'Footer', 'Visibility', footerVisible, 
               footerVisible ? 'Footer is visible' : 'Footer is not visible');
    
    const footerContentVisible = await footerContent.isVisible();
    recordTest('surfMap', viewport, 'Footer Content', 'Visibility', footerContentVisible, 
               footerContentVisible ? 'Footer content is visible' : 'Footer content is not visible');
    
    // Test 9: Touch Target Sizes (for mobile viewports)
    if (viewport.width < 768) {
        // Check hamburger menu touch target
        const hamburgerTouchOk = await page.evaluate(() => {
            const hamburger = document.querySelector('.hamburger-menu');
            if (!hamburger) return false;
            const rect = hamburger.getBoundingClientRect();
            return rect.width >= 44 && rect.height >= 44;
        });
        recordTest('surfMap', viewport, 'Hamburger Menu', 'Touch Target Size', hamburgerTouchOk, 
                   hamburgerTouchOk ? 'Hamburger menu meets minimum touch target size' : 'Hamburger menu too small for touch');
        
        // Check mobile search toggle touch target
        const mobileSearchTouchOk = await page.evaluate(() => {
            const toggle = document.querySelector('.mobile-search-toggle');
            if (!toggle) return true; // Skip if not present
            const rect = toggle.getBoundingClientRect();
            return rect.width >= 44 && rect.height >= 44;
        });
        recordTest('surfMap', viewport, 'Mobile Search Toggle', 'Touch Target Size', mobileSearchTouchOk, 
                   mobileSearchTouchOk ? 'Mobile search toggle meets minimum touch target size' : 'Mobile search toggle too small for touch');
        
        // Check map control button touch targets
        const mapControlButtons = await page.locator('.map-control-btn').all();
        for (let i = 0; i < mapControlButtons.length; i++) {
            const controlTouchOk = await page.evaluate((index) => {
                const controls = document.querySelectorAll('.map-control-btn');
                if (!controls[index]) return false;
                const rect = controls[index].getBoundingClientRect();
                return rect.width >= 44 && rect.height >= 44;
            }, i);
            recordTest('surfMap', viewport, `Map Control Button ${i+1}`, 'Touch Target Size', controlTouchOk, 
                       controlTouchOk ? `Map control button ${i+1} meets minimum touch target size` : `Map control button ${i+1} too small for touch`);
        }
    }
    
    // Test 10: Horizontal Scrolling Check
    const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
    });
    recordTest('surfMap', viewport, 'Page', 'Horizontal Scrolling', !hasHorizontalScroll, 
               hasHorizontalScroll ? 'Page requires horizontal scrolling (issue)' : 'Page fits within viewport width');
    
    // Test 11: Text Readability
    const textReadability = await page.evaluate(() => {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');
        let issues = 0;
        
        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            
            // Check if font size is reasonable for the viewport
            if (fontSize < 12) issues++;
        });
        
        return issues === 0;
    });
    recordTest('surfMap', viewport, 'Text', 'Readability', textReadability, 
               textReadability ? 'Text is readable at this viewport' : 'Text may be too small at this viewport');
    
    // Test 12: Search Interface Responsiveness
    if (viewport.width < 768) {
        // On mobile, search should be hidden by default and toggleable
        const leftSideSearchVisible = await page.evaluate(() => {
            const search = document.querySelector('#left-side-search');
            if (!search) return false;
            const style = window.getComputedStyle(search);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        recordTest('surfMap', viewport, 'Left Side Search', 'Mobile Hidden', !leftSideSearchVisible, 
                   !leftSideSearchVisible ? 'Search is hidden by default on mobile' : 'Search is visible by default on mobile (unexpected)');
    } else {
        // On desktop, search should be visible by default
        const leftSideSearchVisible = await page.evaluate(() => {
            const search = document.querySelector('#left-side-search');
            if (!search) return false;
            const style = window.getComputedStyle(search);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });
        recordTest('surfMap', viewport, 'Left Side Search', 'Desktop Visible', leftSideSearchVisible, 
                   leftSideSearchVisible ? 'Search is visible by default on desktop' : 'Search is hidden by default on desktop (unexpected)');
    }
}

// Generate comprehensive test report
function generateReport() {
    let report = "# Responsive Design Test Report\n\n";
    report += `## Summary\n\n`;
    report += `- Total Tests: ${testResults.summary.total}\n`;
    report += `- Passed: ${testResults.summary.passed}\n`;
    report += `- Failed: ${testResults.summary.failed}\n`;
    report += `- Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%\n\n`;
    
    // Index.html Results
    report += `## index.html Test Results\n\n`;
    for (const viewport in testResults.index) {
        report += `### ${viewport}\n\n`;
        
        const viewportResults = testResults.index[viewport];
        for (const testKey in viewportResults) {
            const test = viewportResults[testKey];
            const status = test.passed ? "✅ PASS" : "❌ FAIL";
            report += `- **${test.element} - ${test.test}**: ${status}\n`;
            report += `  - ${test.details}\n`;
        }
        report += "\n";
    }
    
    // surf-map.html Results
    report += `## surf-map.html Test Results\n\n`;
    for (const viewport in testResults.surfMap) {
        report += `### ${viewport}\n\n`;
        
        const viewportResults = testResults.surfMap[viewport];
        for (const testKey in viewportResults) {
            const test = viewportResults[testKey];
            const status = test.passed ? "✅ PASS" : "❌ FAIL";
            report += `- **${test.element} - ${test.test}**: ${status}\n`;
            report += `  - ${test.details}\n`;
        }
        report += "\n";
    }
    
    // Issues Summary
    report += `## Issues Summary\n\n`;
    let hasIssues = false;
    
    // Check for horizontal scrolling issues
    for (const page of ['index', 'surfMap']) {
        for (const viewport in testResults[page]) {
            const viewportResults = testResults[page][viewport];
            for (const testKey in viewportResults) {
                const test = viewportResults[testKey];
                if (test.test === 'Horizontal Scrolling' && !test.passed) {
                    report += `- **Horizontal scrolling issue** on ${page}.html at ${viewport}\n`;
                    hasIssues = true;
                }
                
                if (test.test === 'Touch Target Size' && !test.passed) {
                    report += `- **Touch target too small** for ${test.element} at ${viewport}\n`;
                    hasIssues = true;
                }
                
                if (test.test === 'Text Readability' && !test.passed) {
                    report += `- **Text readability issue** on ${page}.html at ${viewport}\n`;
                    hasIssues = true;
                }
            }
        }
    }
    
    if (!hasIssues) {
        report += "No critical responsive design issues found.\n";
    }
    
    return report;
}

// Main test execution function
async function runResponsiveTests() {
    console.log("Starting responsive design tests...");
    
    // Test all viewports for index.html
    for (const viewportKey in VIEWPORTS) {
        const viewport = VIEWPORTS[viewportKey];
        await testIndexPage(viewport);
    }
    
    // Test all viewports for surf-map.html
    for (const viewportKey in VIEWPORTS) {
        const viewport = VIEWPORTS[viewportKey];
        await testSurfMapPage(viewport);
    }
    
    // Generate and return report
    const report = generateReport();
    console.log("Responsive design tests completed.");
    
    return {
        report,
        results: testResults
    };
}

// Export for use in test runner
module.exports = {
    runResponsiveTests,
    VIEWPORTS,
    testResults
};