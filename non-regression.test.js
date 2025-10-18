/**
 * Non-regression test script for La Sonora Volcánica website
 * Tests all major components after surf map refactoring
 */

const puppeteer = require('puppeteer');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_TIMEOUT = 30000; // 30 seconds per test

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   Details: ${details}`);
  }
  testResults.details.push({ name, passed, details });
}

// Helper function to wait for element
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (e) {
    return false;
  }
}

// Helper function to check if element is visible
async function isElementVisible(page, selector) {
  try {
    return await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    }, selector);
  } catch (e) {
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting non-regression tests for La Sonora Volcánica website\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for CI/CD
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Test 1: Page loads correctly
    console.log('\n=== Testing Page Load ===');
    const response = await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    logTest('Page loads successfully', response.status() === 200, `HTTP status: ${response.status()}`);
    
    // Test 2: Check main elements are present
    console.log('\n=== Testing Main Elements ===');
    const headerVisible = await isElementVisible(page, '.main-header');
    logTest('Header is visible', headerVisible);
    
    const heroVisible = await isElementVisible(page, '.hero-section');
    logTest('Hero section is visible', heroVisible);
    
    const musicSectionVisible = await isElementVisible(page, '#music');
    logTest('Music section is visible', musicSectionVisible);
    
    const aboutSectionVisible = await isElementVisible(page, '#about');
    logTest('About section is visible', aboutSectionVisible);
    
    const collabsSectionVisible = await isElementVisible(page, '#collabs');
    logTest('Collaborations section is visible', collabsSectionVisible);
    
    // Test 3: Music cards are loaded
    console.log('\n=== Testing Music Cards ===');
    await page.waitForSelector('.music-grid', { timeout: 5000 });
    const musicCards = await page.$$('.music-card');
    logTest('Music cards are loaded', musicCards.length > 0, `Found ${musicCards.length} cards`);
    
    // Test 4: Discography button works
    console.log('\n=== Testing Discography Button ===');
    const discographyBtn = await page.$('.discography-btn');
    if (discographyBtn) {
      await discographyBtn.click();
      const sidePanelVisible = await isElementVisible(page, '.side-panel.active');
      logTest('Discography button opens side panel', sidePanelVisible);
      
      if (sidePanelVisible) {
        // Check if discography list is populated
        const discographyList = await page.$('.discography-list');
        const listPopulated = await page.evaluate((el) => {
          return el && el.children.length > 0;
        }, discographyList);
        logTest('Discography list is populated', listPopulated);
        
        // Close the panel
        const closeBtn = await page.$('.close-panel-btn');
        if (closeBtn) await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      logTest('Discography button exists', false);
    }
    
    // Test 5: Release information panel
    console.log('\n=== Testing Release Information Panel ===');
    const firstMusicCard = await page.$('.music-card');
    if (firstMusicCard) {
      // Get the title element and click it
      const titleElement = await firstMusicCard.$('.music-card-title');
      if (titleElement) {
        await titleElement.click();
        
        // Wait for panel to open
        const releasePanelVisible = await isElementVisible(page, '.side-panel.active');
        logTest('Release title click opens information panel', releasePanelVisible);
        
        if (releasePanelVisible) {
          // Check for tabs
          const tabsVisible = await isElementVisible(page, '.song-info-tabs');
          logTest('Release information panel has tabs', tabsVisible);
          
          // Check for content sections
          const storyContent = await isElementVisible(page, '.song-info-content');
          logTest('Release information panel has content', storyContent);
          
          // Close the panel
          const closeBtn = await page.$('.close-panel-btn');
          if (closeBtn) await closeBtn.click();
          await page.waitForTimeout(500);
        }
      } else {
        logTest('Music card has title element', false);
      }
    } else {
      logTest('Music cards exist for testing', false);
    }
    
    // Test 6: Collaboration panel
    console.log('\n=== Testing Collaboration Panel ===');
    const collaboratorCards = await page.$$('.collab-card');
    if (collaboratorCards.length > 0) {
      await collaboratorCards[0].click();
      
      // Wait for panel to open
      const collabPanelVisible = await isElementVisible(page, '.side-panel.active');
      logTest('Collaborator card click opens information panel', collabPanelVisible);
      
      if (collabPanelVisible) {
        // Check for collaborator bio
        const bioVisible = await isElementVisible(page, '.collab-details-bio');
        logTest('Collaborator panel has bio information', bioVisible);
        
        // Close the panel
        const closeBtn = await page.$('.close-panel-btn');
        if (closeBtn) await closeBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      logTest('Collaborator cards exist for testing', false);
    }
    
    // Test 7: Audio player functionality
    console.log('\n=== Testing Audio Player ===');
    const firstMusicCardForAudio = await page.$('.music-card');
    if (firstMusicCardForAudio) {
      // Click on the image to play audio
      const imgElement = await firstMusicCardForAudio.$('img');
      if (imgElement) {
        await imgElement.click();
        
        // Wait for player to appear
        const playerVisible = await isElementVisible(page, '.mini-player.active');
        logTest('Clicking music card image opens mini player', playerVisible);
        
        if (playerVisible) {
          // Check play/pause button
          const playPauseBtn = await page.$('.play-pause-btn');
          const playPauseExists = !!playPauseBtn;
          logTest('Mini player has play/pause button', playPauseExists);
          
          // Check seek slider
          const seekSlider = await page.$('.seek-slider');
          const seekSliderExists = !!seekSlider;
          logTest('Mini player has seek slider', seekSliderExists);
          
          // Close the player
          const closePlayerBtn = await page.$('.close-player-btn');
          if (closePlayerBtn) await closePlayerBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
    
    // Test 8: Language switcher
    console.log('\n=== Testing Language Switcher ===');
    const langButtons = await page.$$('.lang-btn');
    if (langButtons.length > 0) {
      // Get initial active language
      const initialActiveLang = await page.evaluate(() => {
        const activeBtn = document.querySelector('.lang-btn.active');
        return activeBtn ? activeBtn.getAttribute('data-lang') : null;
      });
      
      // Click a different language button
      let targetLangBtn = null;
      for (const btn of langButtons) {
        const lang = await page.evaluate((el) => el.getAttribute('data-lang'), btn);
        if (lang !== initialActiveLang) {
          targetLangBtn = btn;
          break;
        }
      }
      
      if (targetLangBtn) {
        await targetLangBtn.click();
        await page.waitForTimeout(500);
        
        // Check if active language changed
        const newActiveLang = await page.evaluate(() => {
          const activeBtn = document.querySelector('.lang-btn.active');
          return activeBtn ? activeBtn.getAttribute('data-lang') : null;
        });
        
        logTest('Language switcher changes active language', newActiveLang !== initialActiveLang);
      } else {
        logTest('Multiple language buttons available', false);
      }
    } else {
      logTest('Language switcher buttons exist', false);
    }
    
    // Test 9: Navigation
    console.log('\n=== Testing Navigation ===');
    const navLinks = await page.$$('.nav-links a');
    if (navLinks.length > 0) {
      // Test clicking the first navigation link
      const firstNavLink = navLinks[0];
      const href = await page.evaluate((el) => el.getAttribute('href'), firstNavLink);
      
      if (href && href.startsWith('#')) {
        await firstNavLink.click();
        await page.waitForTimeout(500);
        
        // Check if URL hash changed
        const currentHash = page.url().split('#')[1];
        const targetSection = href.substring(1);
        
        logTest('Navigation links work correctly', currentHash === targetSection);
      } else {
        logTest('Navigation link has valid hash href', false);
      }
    } else {
      logTest('Navigation links exist', false);
    }
    
    // Test 10: Mobile responsiveness
    console.log('\n=== Testing Mobile Responsiveness ===');
    // Change viewport to mobile size
    await page.setViewport({ width: 375, height: 667 });
    
    // Check if hamburger menu is visible
    const hamburgerVisible = await isElementVisible(page, '.hamburger-menu');
    logTest('Hamburger menu is visible on mobile', hamburgerVisible);
    
    if (hamburgerVisible) {
      // Test mobile menu
      await page.click('.hamburger-menu');
      await page.waitForTimeout(500);
      
      const mobileNavVisible = await isElementVisible(page, '.main-nav');
      logTest('Mobile navigation opens when hamburger is clicked', mobileNavVisible);
      
      if (mobileNavVisible) {
        // Close mobile nav
        await page.click('.hamburger-menu');
        await page.waitForTimeout(500);
      }
    }
    
    // Reset viewport to desktop
    await page.setViewport({ width: 1200, height: 800 });
    
    // Test 11: Check for broken assets
    console.log('\n=== Testing Asset Loading ===');
    const images = await page.$$('img');
    let brokenImages = 0;
    
    for (const img of images) {
      const src = await page.evaluate((el) => el.getAttribute('src'), img);
      if (src) {
        const naturalWidth = await page.evaluate((el) => el.naturalWidth, img);
        if (naturalWidth === 0) brokenImages++;
      }
    }
    
    logTest('All images load correctly', brokenImages === 0, `${brokenImages} broken images found`);
    
    // Test 12: Check for console errors
    console.log('\n=== Testing for Console Errors ===');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Reload the page to catch any errors on load
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    logTest('No console errors on page load', consoleErrors.length === 0, 
            consoleErrors.length > 0 ? `Errors: ${consoleErrors.join(', ')}` : '');
    
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await browser.close();
  }
  
  // Print test summary
  console.log('\n=== Test Summary ===');
  console.log(`Total tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
  
  if (testResults.failed > 0) {
    console.log('\nFailed tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => console.log(`- ${test.name}: ${test.details}`));
  }
  
  return testResults.failed === 0;
}

// Check if server is running before starting tests
function checkServer() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/',
      method: 'HEAD',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Run tests if server is available
async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('Server is not running on http://localhost:8080');
    console.error('Please start the server with: node server/dev-server.js');
    process.exit(1);
  }
  
  const testsPassed = await runTests();
  process.exit(testsPassed ? 0 : 1);
}

// Run the tests
main().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});