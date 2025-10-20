/**
 * @jest-environment node
 */

import { test, expect, devices } from '@playwright/test';
import { surfSpotDataTestData } from './test-data/test-spots.test.js';

const testPagePath = 'http://localhost:8080/test-surf-spot-panel.html'; // Assuming a local server is running

test.describe('SurfSpotPanel Performance Benchmarking', () => {
    let mockSpotData;

    test.beforeAll(async () => {
        mockSpotData = surfSpotDataTestData.theBubble;
    });

    // Define a function to setup the panel on the page
    const setupPanel = async (page, data) => {
        await page.goto(testPagePath);
        await page.evaluate((spotData) => {
            window.SurfSpotPanelInstance = new SurfSpotPanel({
                container: document.getElementById('panel-container'),
                enableAnimations: false, // Disable for consistent measurements
                enableTooltips: false,
                enableKeyboardNav: false,
                enablePerformanceOptimizations: true,
            });
            window.mockSpotData = spotData;
            const fragment = window.SurfSpotPanelInstance.generateContent(window.mockSpotData);
            document.getElementById('panel-container').innerHTML = '';
            document.getElementById('panel-container').appendChild(fragment);
        }, data);
        await page.waitForSelector('.surf-spot-panel', { state: 'visible' });
        await page.waitForLoadState('domcontentloaded');
    };

    // Clean up function
    const cleanupPanel = async (page) => {
        await page.evaluate(() => {
            if (window.SurfSpotPanelInstance) {
                window.SurfSpotPanelInstance.destroy();
                window.SurfSpotPanelInstance = null;
            }
            document.getElementById('panel-container').innerHTML = '<p>Select a surf spot to view its details</p>';
        });
    };

    test.describe('Core Web Vitals and Performance Metrics', () => {
        test('should measure LCP (Largest Contentful Paint)', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const lcp = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        resolve(lastEntry.renderTime || lastEntry.loadTime);
                    }).observe({ entryTypes: ['largest-contentful-paint'] });
                });
            });
            
            expect(lcp).toBeLessThan(2500); // LCP should be less than 2.5s for good experience
            await cleanupPanel(page);
        });

        test('should measure FID (First Input Delay)', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const fid = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.name === 'first-input') {
                                resolve(entry.processingStart - entry.startTime);
                                break;
                            }
                        }
                    }).observe({ type: 'first-input', buffered: true });
                });
            });
            
            expect(fid).toBeLessThan(100); // FID should be less than 100ms for good experience
            await cleanupPanel(page);
        });

        test('should measure CLS (Cumulative Layout Shift)', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const cls = await page.evaluate(() => {
                return new Promise((resolve) => {
                    let clsValue = 0;
                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!entry.hadRecentInput) {
                                clsValue += entry.value;
                            }
                        }
                        resolve(clsValue);
                    }).observe({ entryTypes: ['layout-shift'] });
                });
            });
            
            expect(cls).toBeLessThan(0.1); // CLS should be less than 0.1 for good experience
            await cleanupPanel(page);
        });

        test('should measure total blocking time (TBT)', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const tbt = await page.evaluate(() => {
                return new Promise((resolve) => {
                    let tbt = 0;
                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.duration > 50) {
                                tbt += entry.duration - 50;
                            }
                        }
                        resolve(tbt);
                    }).observe({ type: 'longtask', buffered: true });
                });
            });
            
            expect(tbt).toBeLessThan(200); // TBT should be minimal for good experience
            await cleanupPanel(page);
        });
    });

    test.describe('Network Performance', () => {
        test('should measure panel loading time on slow 3G', async ({ page }) => {
            const context = page.context();
            await context.route('**/*', route => route.continue());
            // Simulate slow 3G network conditions
            await context.setOffline(false);
            await page.emulateNetworkConditions({
                offline: false,
                downloadThroughput: 500 * 1024 / 8, // 500kb/s
                uploadThroughput: 500 * 1024 / 8,   // 500kb/s
                latency: 400 // 400ms latency
            });

            const startTime = Date.now();
            await setupPanel(page, mockSpotData);
            const endTime = Date.now();
            const loadTime = endTime - startTime;

            expect(loadTime).toBeLessThan(3000); // Should load within 3s even on slow 3G
            await cleanupPanel(page);
        });

        test('should measure image lazy loading performance', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const imageLoadTime = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const heroImage = document.querySelector('.hero-image');
                    const startTime = performance.now();
                    heroImage.onload = () => {
                        const endTime = performance.now();
                        resolve(endTime - startTime);
                    };
                });
            });
            
            expect(imageLoadTime).toBeLessThan(1000); // Image should load within 1s
            await cleanupPanel(page);
        });
    });

    test.describe('Rendering and Interaction Performance', () => {
        test('should measure tab switching performance', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const tabSwitchTime = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const wavesTab = document.querySelector('[data-tab-id="waves"]');
                    const startTime = performance.now();
                    wavesTab.click();
                    // Wait for the next frame to ensure rendering is complete
                    requestAnimationFrame(() => {
                        const endTime = performance.now();
                        resolve(endTime - startTime);
                    });
                });
            });
            
            expect(tabSwitchTime).toBeLessThan(200); // Tab switch should be very fast
            await cleanupPanel(page);
        });

        test('should measure expandable section toggle performance', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            await page.click('[data-tab-id="practicalities"]');
            await page.waitForSelector('#panel-practicalities:not([hidden])');
            
            const toggleTime = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const sectionHeader = document.querySelector('.expandable-section[data-section-id="access"] .section-header');
                    const startTime = performance.now();
                    sectionHeader.click();
                    requestAnimationFrame(() => {
                        const endTime = performance.now();
                        resolve(endTime - startTime);
                    });
                });
            });
            
            expect(toggleTime).toBeLessThan(150); // Section toggle should be very fast
            await cleanupPanel(page);
        });
    });

    test.describe('Memory Usage', () => {
        test('should monitor memory usage during interactions', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const initialMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
            
            // Perform a series of interactions
            for (let i = 0; i < 10; i++) {
                await page.click('[data-tab-id="waves"]');
                await page.waitForSelector('#panel-waves:not([hidden])');
                await page.click('[data-tab-id="practicalities"]');
                await page.waitForSelector('#panel-practicalities:not([hidden])');
            }
            
            const finalMemory = await page.evaluate(() => performance.memory.usedJSHeapSize);
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be minimal, indicating no major leaks
            expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB increase
            await cleanupPanel(page);
        });
    });

    test.describe('Performance on Different Devices', () => {
        const devices_to_test = [
            { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
            { name: 'iPhone 12', device: devices['iPhone 12'] },
            { name: 'iPad', device: devices['iPad (gen 7)'] },
        ];

        devices_to_test.forEach(deviceConfig => {
            test(`should measure render time on ${deviceConfig.name}`, async ({ page }) => {
                // Use device emulation if specified
                if (deviceConfig.device) {
                    const context = await page.context().browser().newContext(deviceConfig.device);
                    page = await context.newPage();
                }
                
                const startTime = Date.now();
                await setupPanel(page, mockSpotData);
                const endTime = Date.now();
                const renderTime = endTime - startTime;
                
                // Render time should be fast on all devices
                expect(renderTime).toBeLessThan(1500);
                await cleanupPanel(page);
            });
        });
    });

    test.describe('Accessibility Performance', () => {
        test('should measure time to announce content changes to screen readers', async ({ page }) => {
            await setupPanel(page, mockSpotData);
            
            const announcementTime = await page.evaluate(() => {
                return new Promise((resolve) => {
                    const wavesTab = document.querySelector('[data-tab-id="waves"]');
                    const startTime = performance.now();
                    wavesTab.click();
                    
                    // Listen for aria-live region changes
                    const liveRegion = document.querySelector('aria-live');
                    if (liveRegion) {
                        const observer = new MutationObserver(() => {
                            const endTime = performance.now();
                            resolve(endTime - startTime);
                        });
                        observer.observe(liveRegion, { childList: true, characterData: true });
                    } else {
                        // Fallback if no live region
                        requestAnimationFrame(() => {
                            const endTime = performance.now();
                            resolve(endTime - startTime);
                        });
                    }
                });
            });
            
            // Announcements should be timely
            expect(announcementTime).toBeLessThan(300);
            await cleanupPanel(page);
        });
    });
});