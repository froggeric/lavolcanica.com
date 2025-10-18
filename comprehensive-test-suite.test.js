/**
 * Comprehensive Test Suite for La Sonora Volcánica Website
 * Tests cross-page navigation, functionality, responsive design, accessibility, and performance
 */

const puppeteer = require('puppeteer');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 30000;

// Test results tracking
const testResults = {
  crossPageNavigation: { passed: 0, failed: 0, details: [] },
  surfMapFunctionality: { passed: 0, failed: 0, details: [] },
  indexPageFunctionality: { passed: 0, failed: 0, details: [] },
  responsiveDesign: { passed: 0, failed: 0, details: [] },
  accessibility: { passed: 0, failed: 0, details: [] },
  performance: { passed: 0, failed: 0, details: [] }
};

// Helper function to log test results
function logTestResult(category, testName, passed, details = '') {
  const result = { test: testName, passed, details };
  testResults[category].details.push(result);
  
  if (passed) {
    testResults[category].passed++;
    console.log(`✓ [${category}] ${testName}`);
  } else {
    testResults[category].failed++;
    console.log(`✗ [${category}] ${testName}: ${details}`);
  }
}

// Helper function to wait for element
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to check if element exists
async function elementExists(page, selector) {
  return await page.evaluate((sel) => {
    return document.querySelector(sel) !== null;
  }, selector);
}

// Helper function to get element text
async function getElementText(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    return element ? element.textContent.trim() : '';
  }, selector);
}

// Helper function to check element visibility
async function isElementVisible(page, selector) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }, selector);
}

// Main test function
async function runTests() {
  console.log('Starting comprehensive test suite for La Sonora Volcánica website...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Test 1: Cross-page Navigation
    await testCrossPageNavigation(browser);
    
    // Test 2: surf-map.html Functionality
    await testSurfMapFunctionality(browser);
    
    // Test 3: index.html Functionality
    await testIndexPageFunctionality(browser);
    
    // Test 4: Responsive Design
    await testResponsiveDesign(browser);
    
    // Test 5: Accessibility
    await testAccessibility(browser);
    
    // Test 6: Performance
    await testPerformance(browser);
    
  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    await browser.close();
  }
  
  // Generate final report
  generateFinalReport();
}

// Test 1: Cross-page Navigation
async function testCrossPageNavigation(browser) {
  console.log('=== Cross-page Navigation Testing ===');
  const page = await browser.newPage();
  
  try {
    // Test 1.1: Navigate to index.html
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const indexTitle = await page.title();
    const indexLoaded = indexTitle.includes('La Sonora Volcánica') || await elementExists(page, '.hero-section');
    logTestResult('crossPageNavigation', 'Index page loads correctly', indexLoaded);
    
    // Test 1.2: Check navigation to surf-map.html
    const surfMapLink = await elementExists(page, 'a[href="surf-map.html"]');
    logTestResult('crossPageNavigation', 'Surf map link exists in navigation', surfMapLink);
    
    if (surfMapLink) {
      await page.click('a[href="surf-map.html"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      const surfMapTitle = await page.title();
      const surfMapLoaded = surfMapTitle.includes('Surf Map') || await elementExists(page, '#surf-map-container');
      logTestResult('crossPageNavigation', 'Navigate to surf map page', surfMapLoaded);
      
      // Test 1.3: Check navigation back to index.html
      const homeLink = await elementExists(page, 'a[href="index.html"]');
      logTestResult('crossPageNavigation', 'Home link exists on surf map page', homeLink);
      
      if (homeLink) {
        await page.click('a[href="index.html"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        const backToIndex = await elementExists(page, '.hero-section');
        logTestResult('crossPageNavigation', 'Navigate back to index page', backToIndex);
      }
    }
    
    // Test 1.4: Check all navigation links
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const navLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('.nav-links a');
      return Array.from(links).map(link => ({
        href: link.getAttribute('href'),
        text: link.textContent.trim()
      }));
    });
    
    logTestResult('crossPageNavigation', 'Navigation links present', navLinks.length > 0, `Found ${navLinks.length} navigation links`);
    
  } catch (error) {
    logTestResult('crossPageNavigation', 'Navigation test error', false, error.message);
  } finally {
    await page.close();
  }
}

// Test 2: surf-map.html Functionality
async function testSurfMapFunctionality(browser) {
  console.log('\n=== Surf Map Functionality Testing ===');
  const page = await browser.newPage();
  
  try {
    // Navigate to surf map page
    await page.goto(`${BASE_URL}/surf-map.html`, { waitUntil: 'networkidle2' });
    
    // Test 2.1: Check surf map container
    const mapContainer = await elementExists(page, '#surf-map-container');
    logTestResult('surfMapFunctionality', 'Surf map container exists', mapContainer);
    
    // Test 2.2: Check search functionality
    const searchInput = await elementExists(page, '.surf-map-search-input');
    logTestResult('surfMapFunctionality', 'Search input exists', searchInput);
    
    if (searchInput) {
      // Test search input
      await page.type('.surf-map-search-input', 'Corralejo');
      await page.waitForTimeout(1000);
      
      const searchResults = await elementExists(page, '.surf-map-search-results');
      logTestResult('surfMapFunctionality', 'Search results appear', searchResults);
    }
    
    // Test 2.3: Check map controls
    const zoomInBtn = await elementExists(page, '#zoom-in-btn');
    const zoomOutBtn = await elementExists(page, '#zoom-out-btn');
    const resetViewBtn = await elementExists(page, '#reset-view-btn');
    
    logTestResult('surfMapFunctionality', 'Zoom in button exists', zoomInBtn);
    logTestResult('surfMapFunctionality', 'Zoom out button exists', zoomOutBtn);
    logTestResult('surfMapFunctionality', 'Reset view button exists', resetViewBtn);
    
    // Test 2.4: Check surf spots counter
    const counter = await elementExists(page, '#surf-spots-counter');
    logTestResult('surfMapFunctionality', 'Surf spots counter exists', counter);
    
    // Test 2.5: Check map legend
    const legend = await elementExists(page, '.surf-map-legend');
    logTestResult('surfMapFunctionality', 'Map legend exists', legend);
    
    // Test 2.6: Check mobile search toggle
    const mobileSearchToggle = await elementExists(page, '#mobile-search-toggle');
    logTestResult('surfMapFunctionality', 'Mobile search toggle exists', mobileSearchToggle);
    
    // Test 2.7: Check side panel for surf spot details
    const sidePanel = await elementExists(page, '#side-panel');
    logTestResult('surfMapFunctionality', 'Side panel for surf spot details exists', sidePanel);
    
    // Test 2.8: Check minimap
    const minimap = await elementExists(page, '#surf-map-minimap');
    logTestResult('surfMapFunctionality', 'Minimap exists', minimap);
    
  } catch (error) {
    logTestResult('surfMapFunctionality', 'Surf map test error', false, error.message);
  } finally {
    await page.close();
  }
}

// Test 3: index.html Functionality
async function testIndexPageFunctionality(browser) {
  console.log('\n=== Index Page Functionality Testing ===');
  const page = await browser.newPage();
  
  try {
    // Navigate to index page
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Test 3.1: Check hero section
    const heroSection = await elementExists(page, '.hero-section');
    logTestResult('indexPageFunctionality', 'Hero section exists', heroSection);
    
    // Test 3.2: Check music section
    const musicSection = await elementExists(page, '#music');
    logTestResult('indexPageFunctionality', 'Music section exists', musicSection);
    
    if (musicSection) {
      // Check if music cards are loaded
      await page.waitForTimeout(2000); // Wait for skeleton loaders to be replaced
      const musicCards = await page.evaluate(() => {
        return document.querySelectorAll('.music-card:not(.skeleton-card)').length;
      });
      logTestResult('indexPageFunctionality', 'Music cards loaded', musicCards > 0, `Found ${musicCards} music cards`);
    }
    
    // Test 3.3: Check about section
    const aboutSection = await elementExists(page, '#about');
    logTestResult('indexPageFunctionality', 'About section exists', aboutSection);
    
    // Test 3.4: Check collaborators section
    const collabsSection = await elementExists(page, '#collabs');
    logTestResult('indexPageFunctionality', 'Collaborators section exists', collabsSection);
    
    if (collabsSection) {
      // Check if collaborator cards are loaded
      await page.waitForTimeout(2000); // Wait for skeleton loaders to be replaced
      const collabCards = await page.evaluate(() => {
        return document.querySelectorAll('.collab-card:not(.skeleton-card)').length;
      });
      logTestResult('indexPageFunctionality', 'Collaborator cards loaded', collabCards > 0, `Found ${collabCards} collaborator cards`);
    }
    
    // Test 3.5: Check discography button
    const discographyBtn = await elementExists(page, '.discography-btn');
    logTestResult('indexPageFunctionality', 'Discography button exists', discographyBtn);
    
    // Test 3.6: Check side panel
    const sidePanel = await elementExists(page, '#side-panel');
    logTestResult('indexPageFunctionality', 'Side panel exists', sidePanel);
    
    // Test 3.7: Check mini audio player
    const miniPlayer = await elementExists(page, '#mini-player');
    logTestResult('indexPageFunctionality', 'Mini audio player exists', miniPlayer);
    
    // Test 3.8: Check language switcher
    const langSwitcher = await elementExists(page, '.language-switcher');
    logTestResult('indexPageFunctionality', 'Language switcher exists', langSwitcher);
    
    if (langSwitcher) {
      const langButtons = await page.evaluate(() => {
        return document.querySelectorAll('.lang-btn').length;
      });
      logTestResult('indexPageFunctionality', 'Language buttons present', langButtons > 0, `Found ${langButtons} language buttons`);
    }
    
    // Test 3.9: Test music card interaction
    if (musicSection) {
      const firstMusicCard = await page.$('.music-card:not(.skeleton-card)');
      if (firstMusicCard) {
        await firstMusicCard.click();
        await page.waitForTimeout(1000);
        
        const sidePanelActive = await page.evaluate(() => {
          return document.querySelector('#side-panel').classList.contains('active');
        });
        logTestResult('indexPageFunctionality', 'Music card opens side panel', sidePanelActive);
        
        // Close the panel
        const closeBtn = await page.$('.close-panel-btn');
        if (closeBtn) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
    
  } catch (error) {
    logTestResult('indexPageFunctionality', 'Index page test error', false, error.message);
  } finally {
    await page.close();
  }
}

// Test 4: Responsive Design
async function testResponsiveDesign(browser) {
  console.log('\n=== Responsive Design Testing ===');
  
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1200, height: 800 }
  ];
  
  for (const viewport of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: viewport.width, height: viewport.height });
    
    try {
      // Test index page
      await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
      
      // Check if navigation adapts to viewport
      const hamburgerVisible = viewport.width <= 768 ? 
        await isElementVisible(page, '.hamburger-menu') : 
        !await isElementVisible(page, '.hamburger-menu');
      
      logTestResult('responsiveDesign', `Hamburger menu visibility on ${viewport.name}`, hamburgerVisible);
      
      // Test surf map page
      await page.goto(`${BASE_URL}/surf-map.html`, { waitUntil: 'networkidle2' });
      
      // Check if mobile search toggle is visible on mobile
      const mobileSearchVisible = viewport.width <= 768 ? 
        await isElementVisible(page, '#mobile-search-toggle') : 
        !await isElementVisible(page, '#mobile-search-toggle');
      
      logTestResult('responsiveDesign', `Mobile search toggle visibility on ${viewport.name}`, mobileSearchVisible);
      
      // Check if left side search is visible on desktop
      const leftSearchVisible = viewport.width > 768 ? 
        await isElementVisible(page, '#left-side-search') : 
        !await isElementVisible(page, '#left-side-search');
      
      logTestResult('responsiveDesign', `Left side search visibility on ${viewport.name}`, leftSearchVisible);
      
    } catch (error) {
      logTestResult('responsiveDesign', `Responsive test error on ${viewport.name}`, false, error.message);
    } finally {
      await page.close();
    }
  }
}

// Test 5: Accessibility
async function testAccessibility(browser) {
  console.log('\n=== Accessibility Testing ===');
  const page = await browser.newPage();
  
  try {
    // Test index page
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Test 5.1: Check for skip link
    const skipLink = await elementExists(page, '.skip-link');
    logTestResult('accessibility', 'Skip link exists', skipLink);
    
    // Test 5.2: Check for ARIA labels on important elements
    const mainNavAria = await page.evaluate(() => {
      const nav = document.querySelector('.main-nav');
      return nav && nav.hasAttribute('aria-label');
    });
    logTestResult('accessibility', 'Main navigation has ARIA label', mainNavAria);
    
    // Test 5.3: Check for alt text on images
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => !img.alt || img.alt.trim() === '').length;
    });
    logTestResult('accessibility', 'Images have alt text', imagesWithoutAlt === 0, `${imagesWithoutAlt} images missing alt text`);
    
    // Test 5.4: Check for proper heading structure
    const headings = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map(h => h.tagName);
    });
    const hasH1 = headings.some(h => h === 'H1');
    logTestResult('accessibility', 'Page has H1 heading', hasH1);
    
    // Test 5.5: Check keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    logTestResult('accessibility', 'Keyboard navigation works', focusedElement !== 'BODY');
    
    // Test surf map page
    await page.goto(`${BASE_URL}/surf-map.html`, { waitUntil: 'networkidle2' });
    
    // Test 5.6: Check for ARIA labels on map controls
    const mapControlsAria = await page.evaluate(() => {
      const controls = document.querySelectorAll('.map-control-btn');
      return Array.from(controls).every(btn => btn.hasAttribute('aria-label'));
    });
    logTestResult('accessibility', 'Map controls have ARIA labels', mapControlsAria);
    
    // Test 5.7: Check for ARIA live regions
    const ariaLive = await elementExists(page, '[aria-live]');
    logTestResult('accessibility', 'ARIA live regions present', ariaLive);
    
  } catch (error) {
    logTestResult('accessibility', 'Accessibility test error', false, error.message);
  } finally {
    await page.close();
  }
}

// Test 6: Performance
async function testPerformance(browser) {
  console.log('\n=== Performance Testing ===');
  const page = await browser.newPage();
  
  try {
    // Test 6.1: Check page load time
    const startTime = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    const loadTime = Date.now() - startTime;
    logTestResult('performance', 'Index page load time', loadTime < 3000, `Loaded in ${loadTime}ms`);
    
    // Test 6.2: Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/surf-map.html`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000); // Wait for any async operations
    
    logTestResult('performance', 'No console errors on surf map page', consoleErrors.length === 0, 
      consoleErrors.length > 0 ? `Errors: ${consoleErrors.join(', ')}` : '');
    
    // Test 6.3: Check if all assets load correctly
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push(request.url());
    });
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    logTestResult('performance', 'All assets load correctly', failedRequests.length === 0, 
      failedRequests.length > 0 ? `Failed requests: ${failedRequests.join(', ')}` : '');
    
    // Test 6.4: Check memory usage
    const metrics = await page.metrics();
    logTestResult('performance', 'Memory usage reasonable', metrics.JSHeapUsedSize < 50000000, 
      `Heap used: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
    
  } catch (error) {
    logTestResult('performance', 'Performance test error', false, error.message);
  } finally {
    await page.close();
  }
}

// Generate final report
function generateFinalReport() {
  console.log('\n\n=== FINAL TEST REPORT ===');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const [category, results] of Object.entries(testResults)) {
    const { passed, failed, details } = results;
    totalPassed += passed;
    totalFailed += failed;
    
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('  Failed tests:');
      details.filter(d => !d.passed).forEach(d => {
        console.log(`    - ${d.test}: ${d.details}`);
      });
    }
  }
  
  console.log(`\nOVERALL RESULTS:`);
  console.log(`  Total Passed: ${totalPassed}`);
  console.log(`  Total Failed: ${totalFailed}`);
  console.log(`  Success Rate: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! The refactored website is working correctly.');
  } else {
    console.log(`\n⚠️  ${totalFailed} test(s) failed. Please review the issues above.`);
  }
}

// Check if server is running before starting tests
async function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}`, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Run tests if server is available
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error(`Server is not running at ${BASE_URL}. Please start the server with 'node server/dev-server.js'`);
    process.exit(1);
  }
  
  await runTests();
}

// Export for use in other files
module.exports = { runTests, testResults };

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}