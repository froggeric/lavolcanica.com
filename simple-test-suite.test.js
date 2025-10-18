/**
 * Simple Test Suite for La Sonora Volcánica Website
 * Tests cross-page navigation, functionality, responsive design, accessibility, and performance
 * Using Node.js built-in modules and simple HTTP requests
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:8080';

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

// Helper function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Helper function to check if string contains another string
function contains(str, search) {
  return str.indexOf(search) !== -1;
}

// Helper function to check if file exists
function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting comprehensive test suite for La Sonora Volcánica website...\n');
  
  try {
    // Test 1: Cross-page Navigation
    await testCrossPageNavigation();
    
    // Test 2: surf-map.html Functionality
    await testSurfMapFunctionality();
    
    // Test 3: index.html Functionality
    await testIndexPageFunctionality();
    
    // Test 4: Responsive Design
    await testResponsiveDesign();
    
    // Test 5: Accessibility
    await testAccessibility();
    
    // Test 6: Performance
    await testPerformance();
    
  } catch (error) {
    console.error('Test suite error:', error);
  }
  
  // Generate final report
  generateFinalReport();
}

// Test 1: Cross-page Navigation
async function testCrossPageNavigation() {
  console.log('=== Cross-page Navigation Testing ===');
  
  try {
    // Test 1.1: Check if index.html loads
    const indexResponse = await makeRequest(BASE_URL);
    const indexLoaded = indexResponse.statusCode === 200;
    logTestResult('crossPageNavigation', 'Index page loads correctly', indexLoaded, 
      `Status code: ${indexResponse.statusCode}`);
    
    if (indexLoaded) {
      // Test 1.2: Check if index.html contains navigation link to surf-map.html
      const hasSurfMapLink = contains(indexResponse.body, 'href="surf-map.html"');
      logTestResult('crossPageNavigation', 'Index page has surf map link', hasSurfMapLink);
      
      // Test 1.3: Check if surf-map.html loads
      const surfMapResponse = await makeRequest(`${BASE_URL}/surf-map.html`);
      const surfMapLoaded = surfMapResponse.statusCode === 200;
      logTestResult('crossPageNavigation', 'Surf map page loads correctly', surfMapLoaded, 
        `Status code: ${surfMapResponse.statusCode}`);
      
      if (surfMapLoaded) {
        // Test 1.4: Check if surf-map.html contains navigation link back to index.html
        const hasHomeLink = contains(surfMapResponse.body, 'href="index.html"');
        logTestResult('crossPageNavigation', 'Surf map page has home link', hasHomeLink);
        
        // Test 1.5: Check if both pages have the same navigation structure
        const indexNavCount = (indexResponse.body.match(/nav-links/g) || []).length;
        const surfMapNavCount = (surfMapResponse.body.match(/nav-links/g) || []).length;
        logTestResult('crossPageNavigation', 'Both pages have navigation', 
          indexNavCount > 0 && surfMapNavCount > 0, 
          `Index: ${indexNavCount}, Surf Map: ${surfMapNavCount}`);
      }
    }
    
  } catch (error) {
    logTestResult('crossPageNavigation', 'Navigation test error', false, error.message);
  }
}

// Test 2: surf-map.html Functionality
async function testSurfMapFunctionality() {
  console.log('\n=== Surf Map Functionality Testing ===');
  
  try {
    // Get surf-map.html content
    const surfMapResponse = await makeRequest(`${BASE_URL}/surf-map.html`);
    
    if (surfMapResponse.statusCode === 200) {
      const content = surfMapResponse.body;
      
      // Test 2.1: Check for surf map container
      const hasMapContainer = contains(content, 'id="surf-map-container"');
      logTestResult('surfMapFunctionality', 'Surf map container exists', hasMapContainer);
      
      // Test 2.2: Check for search functionality
      const hasSearchInput = contains(content, 'surf-map-search-input');
      logTestResult('surfMapFunctionality', 'Search input exists', hasSearchInput);
      
      // Test 2.3: Check for map controls
      const hasZoomIn = contains(content, 'id="zoom-in-btn"');
      const hasZoomOut = contains(content, 'id="zoom-out-btn"');
      const hasResetView = contains(content, 'id="reset-view-btn"');
      
      logTestResult('surfMapFunctionality', 'Zoom in button exists', hasZoomIn);
      logTestResult('surfMapFunctionality', 'Zoom out button exists', hasZoomOut);
      logTestResult('surfMapFunctionality', 'Reset view button exists', hasResetView);
      
      // Test 2.4: Check for surf spots counter
      const hasCounter = contains(content, 'id="surf-spots-counter"');
      logTestResult('surfMapFunctionality', 'Surf spots counter exists', hasCounter);
      
      // Test 2.5: Check for map legend
      const hasLegend = contains(content, 'surf-map-legend');
      logTestResult('surfMapFunctionality', 'Map legend exists', hasLegend);
      
      // Test 2.6: Check for mobile search toggle
      const hasMobileSearch = contains(content, 'id="mobile-search-toggle"');
      logTestResult('surfMapFunctionality', 'Mobile search toggle exists', hasMobileSearch);
      
      // Test 2.7: Check for side panel
      const hasSidePanel = contains(content, 'id="side-panel"');
      logTestResult('surfMapFunctionality', 'Side panel exists', hasSidePanel);
      
      // Test 2.8: Check for minimap
      const hasMinimap = contains(content, 'id="surf-map-minimap"');
      logTestResult('surfMapFunctionality', 'Minimap exists', hasMinimap);
      
      // Test 2.9: Check for surf map scripts
      const hasSurfMapScript = contains(content, 'surf-map-core.js');
      logTestResult('surfMapFunctionality', 'Surf map script included', hasSurfMapScript);
      
      // Test 2.10: Check for surf spots data
      const hasSpotsData = contains(content, 'fuerteventura-surf-spots.json');
      logTestResult('surfMapFunctionality', 'Surf spots data referenced', hasSpotsData);
    } else {
      logTestResult('surfMapFunctionality', 'Failed to load surf map page', false, 
        `Status code: ${surfMapResponse.statusCode}`);
    }
    
  } catch (error) {
    logTestResult('surfMapFunctionality', 'Surf map test error', false, error.message);
  }
}

// Test 3: index.html Functionality
async function testIndexPageFunctionality() {
  console.log('\n=== Index Page Functionality Testing ===');
  
  try {
    // Get index.html content
    const indexResponse = await makeRequest(BASE_URL);
    
    if (indexResponse.statusCode === 200) {
      const content = indexResponse.body;
      
      // Test 3.1: Check for hero section
      const hasHeroSection = contains(content, 'hero-section');
      logTestResult('indexPageFunctionality', 'Hero section exists', hasHeroSection);
      
      // Test 3.2: Check for music section
      const hasMusicSection = contains(content, 'id="music"');
      logTestResult('indexPageFunctionality', 'Music section exists', hasMusicSection);
      
      // Test 3.3: Check for about section
      const hasAboutSection = contains(content, 'id="about"');
      logTestResult('indexPageFunctionality', 'About section exists', hasAboutSection);
      
      // Test 3.4: Check for collaborators section
      const hasCollabsSection = contains(content, 'id="collabs"');
      logTestResult('indexPageFunctionality', 'Collaborators section exists', hasCollabsSection);
      
      // Test 3.5: Check for discography button
      const hasDiscographyBtn = contains(content, 'discography-btn');
      logTestResult('indexPageFunctionality', 'Discography button exists', hasDiscographyBtn);
      
      // Test 3.6: Check for side panel
      const hasSidePanel = contains(content, 'id="side-panel"');
      logTestResult('indexPageFunctionality', 'Side panel exists', hasSidePanel);
      
      // Test 3.7: Check for mini audio player
      const hasMiniPlayer = contains(content, 'id="mini-player"');
      logTestResult('indexPageFunctionality', 'Mini audio player exists', hasMiniPlayer);
      
      // Test 3.8: Check for language switcher
      const hasLangSwitcher = contains(content, 'language-switcher');
      logTestResult('indexPageFunctionality', 'Language switcher exists', hasLangSwitcher);
      
      // Test 3.9: Check for main script
      const hasMainScript = contains(content, 'script.js" defer');
      logTestResult('indexPageFunctionality', 'Main script included', hasMainScript);
      
      // Test 3.10: Check for data loader
      const hasDataLoader = contains(content, 'data-loader.js');
      logTestResult('indexPageFunctionality', 'Data loader referenced', hasDataLoader);
    } else {
      logTestResult('indexPageFunctionality', 'Failed to load index page', false, 
        `Status code: ${indexResponse.statusCode}`);
    }
    
  } catch (error) {
    logTestResult('indexPageFunctionality', 'Index page test error', false, error.message);
  }
}

// Test 4: Responsive Design
async function testResponsiveDesign() {
  console.log('\n=== Responsive Design Testing ===');
  
  try {
    // Get index.html content
    const indexResponse = await makeRequest(BASE_URL);
    
    if (indexResponse.statusCode === 200) {
      const content = indexResponse.body;
      
      // Test 4.1: Check for viewport meta tag
      const hasViewport = contains(content, 'name="viewport"');
      logTestResult('responsiveDesign', 'Viewport meta tag present', hasViewport);
      
      // Test 4.2: Check for hamburger menu
      const hasHamburger = contains(content, 'hamburger-menu');
      logTestResult('responsiveDesign', 'Hamburger menu present', hasHamburger);
      
      // Test 4.3: Check for CSS media queries (in style.css)
      const styleExists = fileExists('style.css');
      if (styleExists) {
        const styleContent = fs.readFileSync('style.css', 'utf8');
        const hasMediaQueries = contains(styleContent, '@media');
        logTestResult('responsiveDesign', 'CSS media queries present', hasMediaQueries);
        
        // Test 4.4: Check for responsive breakpoints
        const hasMobileBreakpoint = contains(styleContent, 'max-width: 768px');
        const hasTabletBreakpoint = contains(styleContent, 'max-width: 1024px');
        
        logTestResult('responsiveDesign', 'Mobile breakpoint defined', hasMobileBreakpoint);
        logTestResult('responsiveDesign', 'Tablet breakpoint defined', hasTabletBreakpoint);
      } else {
        logTestResult('responsiveDesign', 'Style.css exists', false);
      }
      
      // Get surf-map.html content
      const surfMapResponse = await makeRequest(`${BASE_URL}/surf-map.html`);
      
      if (surfMapResponse.statusCode === 200) {
        const surfMapContent = surfMapResponse.body;
        
        // Test 4.5: Check for mobile search toggle in surf map
        const hasMobileSearch = contains(surfMapContent, 'mobile-search-toggle');
        logTestResult('responsiveDesign', 'Mobile search toggle in surf map', hasMobileSearch);
        
        // Test 4.6: Check for left side search in surf map
        const hasLeftSearch = contains(surfMapContent, 'left-side-search');
        logTestResult('responsiveDesign', 'Left side search in surf map', hasLeftSearch);
      }
    } else {
      logTestResult('responsiveDesign', 'Failed to load index page', false, 
        `Status code: ${indexResponse.statusCode}`);
    }
    
  } catch (error) {
    logTestResult('responsiveDesign', 'Responsive design test error', false, error.message);
  }
}

// Test 5: Accessibility
async function testAccessibility() {
  console.log('\n=== Accessibility Testing ===');
  
  try {
    // Get index.html content
    const indexResponse = await makeRequest(BASE_URL);
    
    if (indexResponse.statusCode === 200) {
      const content = indexResponse.body;
      
      // Test 5.1: Check for skip link
      const hasSkipLink = contains(content, 'skip-link');
      logTestResult('accessibility', 'Skip link exists', hasSkipLink);
      
      // Test 5.2: Check for lang attribute
      const hasLangAttr = contains(content, 'html lang=');
      logTestResult('accessibility', 'HTML lang attribute present', hasLangAttr);
      
      // Test 5.3: Check for ARIA labels
      const hasAriaLabels = contains(content, 'aria-label=');
      logTestResult('accessibility', 'ARIA labels present', hasAriaLabels);
      
      // Test 5.4: Check for semantic HTML5 elements
      const hasSemanticElements = contains(content, '<header>') && 
                                contains(content, '<main>') && 
                                contains(content, '<footer>');
      logTestResult('accessibility', 'Semantic HTML5 elements present', hasSemanticElements);
      
      // Test 5.5: Check for alt attributes on images
      const imgCount = (content.match(/<img/g) || []).length;
      const altCount = (content.match(/alt=/g) || []).length;
      const hasAltText = imgCount === altCount;
      logTestResult('accessibility', 'Images have alt text', hasAltText, 
        `${altCount}/${imgCount} images have alt text`);
      
      // Test 5.6: Check for proper heading structure
      const hasH1 = contains(content, '<h1');
      const hasH2 = contains(content, '<h2');
      logTestResult('accessibility', 'Proper heading structure', hasH1 && hasH2);
    }
    
    // Get surf-map.html content
    const surfMapResponse = await makeRequest(`${BASE_URL}/surf-map.html`);
    
    if (surfMapResponse.statusCode === 200) {
      const surfMapContent = surfMapResponse.body;
      
      // Test 5.7: Check for ARIA labels on map controls
      const hasMapAria = contains(surfMapContent, 'aria-controls="surf-map-container"');
      logTestResult('accessibility', 'Map controls have ARIA labels', hasMapAria);
      
      // Test 5.8: Check for ARIA live regions
      const hasAriaLive = contains(surfMapContent, 'aria-live=');
      logTestResult('accessibility', 'ARIA live regions present', hasAriaLive);
      
      // Test 5.9: Check for role attributes
      const hasRoleAttrs = contains(surfMapContent, 'role=');
      logTestResult('accessibility', 'Role attributes present', hasRoleAttrs);
    }
    
  } catch (error) {
    logTestResult('accessibility', 'Accessibility test error', false, error.message);
  }
}

// Test 6: Performance
async function testPerformance() {
  console.log('\n=== Performance Testing ===');
  
  try {
    // Test 6.1: Check if CSS is minified or optimized
    const styleExists = fileExists('style.css');
    if (styleExists) {
      const styleStats = fs.statSync('style.css');
      const styleSizeKB = Math.round(styleStats.size / 1024);
      logTestResult('performance', 'CSS file size reasonable', styleSizeKB < 200, 
        `CSS file size: ${styleSizeKB}KB`);
    } else {
      logTestResult('performance', 'Style.css exists', false);
    }
    
    // Test 6.2: Check if JS is minified or optimized
    const scriptExists = fileExists('script.js');
    if (scriptExists) {
      const scriptStats = fs.statSync('script.js');
      const scriptSizeKB = Math.round(scriptStats.size / 1024);
      logTestResult('performance', 'JS file size reasonable', scriptSizeKB < 200, 
        `JS file size: ${scriptSizeKB}KB`);
    } else {
      logTestResult('performance', 'Script.js exists', false);
    }
    
    // Test 6.3: Check for lazy loading attributes
    const indexResponse = await makeRequest(BASE_URL);
    if (indexResponse.statusCode === 200) {
      const content = indexResponse.body;
      const hasLazyLoading = contains(content, 'loading="lazy"');
      logTestResult('performance', 'Lazy loading implemented', hasLazyLoading);
      
      // Test 6.4: Check for preloading
      const hasPreload = contains(content, 'rel="preconnect"');
      logTestResult('performance', 'Resource preloading', hasPreload);
      
      // Test 6.5: Check for caching headers
      const hasCacheControl = contains(content, 'Cache-Control');
      logTestResult('performance', 'Cache control headers', hasCacheControl);
    }
    
    // Test 6.6: Check for responsive images
    const hasResponsiveImages = contains(indexResponse.body, 'srcset=') || 
                               contains(indexResponse.body, 'sizes=');
    logTestResult('performance', 'Responsive images', hasResponsiveImages);
    
    // Test 6.7: Check for optimized image formats
    const hasWebp = contains(indexResponse.body, '.webp');
    logTestResult('performance', 'WebP images used', hasWebp);
    
  } catch (error) {
    logTestResult('performance', 'Performance test error', false, error.message);
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
  try {
    const response = await makeRequest(BASE_URL);
    return response.statusCode === 200;
  } catch (error) {
    return false;
  }
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