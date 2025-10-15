/**
 * @fileoverview Comprehensive test runner for the surf map interface
 * @description This script runs all tests for the surf map interface and generates a detailed report.
 * It can be executed directly in the browser console or included in a test page.
 */

// Import the comprehensive test class
import { ComprehensiveSurfMapTest } from './comprehensive-surf-map.test.js';

/**
 * Comprehensive test runner class
 */
class ComprehensiveTestRunner {
    constructor() {
        this.testSuite = null;
        this.results = null;
        this.isRunning = false;
    }

    /**
     * Runs all comprehensive tests
     * @returns {Object} Test results
     */
    async runAllTests() {
        if (this.isRunning) {
            console.warn('Tests are already running. Please wait for completion.');
            return null;
        }

        this.isRunning = true;
        console.log('Starting comprehensive surf map interface tests...');
        
        try {
            // Create test suite instance
            this.testSuite = new ComprehensiveSurfMapTest();
            
            // Run all tests
            const testResults = await this.testSuite.runAllTests();
            
            // Generate report
            this.results = this.testSuite.generateReport();
            
            // Display results
            this.displayResults();
            
            // Generate and display comprehensive test report
            this.displayTestReport();
            
            // Log summary to console
            this.logSummary();
            
            this.isRunning = false;
            return this.results;
            
        } catch (error) {
            console.error('Test runner failed:', error);
            this.isRunning = false;
            return { error: error.message };
        }
    }

    /**
     * Displays test results in a formatted way in the browser
     */
    displayResults() {
        // Create a results container if it doesn't exist
        let resultsContainer = document.getElementById('comprehensive-test-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.id = 'comprehensive-test-results';
            resultsContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 450px;
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
                color: #333;
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
            <p><strong>Total Tests:</strong> ${this.results.summary.total}</p>
            <p><strong>Passed:</strong> <span style="color: green;">${this.results.summary.passed}</span></p>
            <p><strong>Failed:</strong> <span style="color: red;">${this.results.summary.failed}</span></p>
            <p><strong>Pass Rate:</strong> ${this.results.summary.passRate}</p>
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

        // Group tests by category
        const testCategories = {};
        this.results.allTests.forEach(test => {
            // Extract category from test name (first word before space)
            const category = test.name.split(' ')[0];
            if (!testCategories[category]) {
                testCategories[category] = [];
            }
            testCategories[category].push(test);
        });

        // Add test results by category
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
            
            resultsContainer.appendChild(categoryDiv);
        });

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
            const dataStr = JSON.stringify(this.results, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'surf-map-test-results.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };
        resultsContainer.appendChild(exportBtn);
    }

    /**
     * Logs a summary of the test results to the console
     */
    logSummary() {
        console.log('\n=== COMPREHENSIVE SURF MAP TEST RESULTS ===');
        console.log(`Total Tests: ${this.results.summary.total}`);
        console.log(`Passed: ${this.results.summary.passed}`);
        console.log(`Failed: ${this.results.summary.failed}`);
        console.log(`Pass Rate: ${this.results.summary.passRate}`);
        
        if (this.results.summary.failed > 0) {
            console.log('\n=== FAILED TESTS ===');
            this.results.failedTests.forEach(test => {
                console.log(`✗ ${test.name}: ${test.error}`);
            });
        }
        
        console.log('=== END OF TEST RESULTS ===\n');
    }

    /**
     * Runs only the search functionality tests
     * @returns {Object} Test results
     */
    async runSearchTests() {
        console.log('Running search functionality tests...');
        
        try {
            // Create test suite instance
            this.testSuite = new ComprehensiveSurfMapTest();
            await this.testSuite.setupTestEnvironment();
            
            // Run only search tests
            await this.testSuite.testSearchFunctionality();
            
            // Cleanup
            this.testSuite.cleanupTestEnvironment();
            
            // Generate report
            this.results = {
                summary: {
                    total: this.testSuite.testResults.length,
                    passed: this.testSuite.testResults.filter(t => t.status === 'pass').length,
                    failed: this.testSuite.testResults.filter(t => t.status === 'fail').length,
                    passRate: '0%'
                },
                failedTests: this.testSuite.testResults.filter(t => t.status === 'fail'),
                allTests: this.testSuite.testResults
            };
            
            this.results.summary.passRate = 
                (this.results.summary.passed / this.results.summary.total * 100).toFixed(2) + '%';
            
            // Display results
            this.displayResults();
            
            // Log summary to console
            this.logSummary();
            
            return this.results;
            
        } catch (error) {
            console.error('Search tests failed:', error);
            return { error: error.message };
        }
    }

    /**
     * Runs only the counter functionality tests
     * @returns {Object} Test results
     */
    async runCounterTests() {
        console.log('Running counter functionality tests...');
        
        try {
            // Create test suite instance
            this.testSuite = new ComprehensiveSurfMapTest();
            await this.testSuite.setupTestEnvironment();
            
            // Run only counter tests
            await this.testSuite.testDynamicCounter();
            
            // Cleanup
            this.testSuite.cleanupTestEnvironment();
            
            // Generate report
            this.results = {
                summary: {
                    total: this.testSuite.testResults.length,
                    passed: this.testSuite.testResults.filter(t => t.status === 'pass').length,
                    failed: this.testSuite.testResults.filter(t => t.status === 'fail').length,
                    passRate: '0%'
                },
                failedTests: this.testSuite.testResults.filter(t => t.status === 'fail'),
                allTests: this.testSuite.testResults
            };
            
            this.results.summary.passRate = 
                (this.results.summary.passed / this.results.summary.total * 100).toFixed(2) + '%';
            
            // Display results
            this.displayResults();
            
            // Log summary to console
            this.logSummary();
            
            return this.results;
            
        } catch (error) {
            console.error('Counter tests failed:', error);
            return { error: error.message };
        }
    }
    
    /**
     * Generates a comprehensive test report
     * @returns {Object} Test report
     */
    generateTestReport() {
        if (!this.results) {
            return { error: 'No test results available. Run tests first.' };
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            testSuite: 'Comprehensive Surf Map Interface Tests',
            version: '1.0.0',
            summary: {
                totalTests: this.results.summary.total,
                passedTests: this.results.summary.passed,
                failedTests: this.results.summary.failed,
                passRate: this.results.summary.passRate
            },
            testCategories: {
                searchFunctionality: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                },
                searchControlPositioning: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                },
                dynamicCounter: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                },
                filterRemoval: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                },
                designConsistency: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                },
                overallFunctionality: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                }
            },
            recommendations: [],
            conclusion: ''
        };
        
        // Categorize tests
        this.results.allTests.forEach(test => {
            let category = null;
            
            if (test.name.includes('Search') || test.name.includes('search')) {
                category = report.testCategories.searchFunctionality;
            } else if (test.name.includes('Positioning') || test.name.includes('Responsive') || test.name.includes('Mobile')) {
                category = report.testCategories.searchControlPositioning;
            } else if (test.name.includes('Counter') || test.name.includes('counter')) {
                category = report.testCategories.dynamicCounter;
            } else if (test.name.includes('Filter') || test.name.includes('filter')) {
                category = report.testCategories.filterRemoval;
            } else if (test.name.includes('Design') || test.name.includes('Accessibility') || test.name.includes('Hover')) {
                category = report.testCategories.designConsistency;
            } else if (test.name.includes('Map') || test.name.includes('Modal') || test.name.includes('Marker') || test.name.includes('Integration')) {
                category = report.testCategories.overallFunctionality;
            }
            
            if (category) {
                category.total++;
                if (test.status === 'pass') {
                    category.passed++;
                } else {
                    category.failed++;
                }
                category.tests.push(test);
            }
        });
        
        // Generate recommendations based on failed tests
        if (this.results.summary.failed > 0) {
            const failedTests = this.results.failedTests;
            
            // Check for common failure patterns
            const accessibilityFailures = failedTests.filter(test =>
                test.name.includes('Accessibility') || test.error.includes('aria')
            );
            
            if (accessibilityFailures.length > 0) {
                report.recommendations.push('Improve accessibility features by adding proper ARIA attributes to all interactive elements.');
            }
            
            const searchFailures = failedTests.filter(test =>
                test.name.includes('Search') || test.error.includes('search')
            );
            
            if (searchFailures.length > 0) {
                report.recommendations.push('Review and fix search functionality issues, particularly result highlighting and popup behavior.');
            }
            
            const responsiveFailures = failedTests.filter(test =>
                test.name.includes('Responsive') || test.name.includes('Mobile')
            );
            
            if (responsiveFailures.length > 0) {
                report.recommendations.push('Improve responsive design to ensure proper display and functionality across all device sizes.');
            }
            
            const counterFailures = failedTests.filter(test =>
                test.name.includes('Counter') || test.error.includes('counter')
            );
            
            if (counterFailures.length > 0) {
                report.recommendations.push('Fix dynamic counter issues, particularly updating during search and number formatting.');
            }
        } else {
            report.recommendations.push('All tests passed! Continue to maintain code quality with regular testing.');
        }
        
        // Generate conclusion
        if (this.results.summary.passRate >= 90) {
            report.conclusion = 'Excellent: The surf map interface is functioning at a high level of quality with minimal issues.';
        } else if (this.results.summary.passRate >= 75) {
            report.conclusion = 'Good: The surf map interface is functioning well but has some areas that could be improved.';
        } else if (this.results.summary.passRate >= 50) {
            report.conclusion = 'Fair: The surf map interface has significant issues that should be addressed.';
        } else {
            report.conclusion = 'Poor: The surf map interface has major issues that require immediate attention.';
        }
        
        return report;
    }
    
    /**
     * Displays a comprehensive test report
     */
    displayTestReport() {
        const report = this.generateTestReport();
        
        // Create a report container if it doesn't exist
        let reportContainer = document.getElementById('comprehensive-test-report');
        if (!reportContainer) {
            reportContainer = document.createElement('div');
            reportContainer.id = 'comprehensive-test-report';
            reportContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                background: white;
                border: 2px solid #333;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                color: #333;
            `;
            document.body.appendChild(reportContainer);
        }
        
        // Clear previous content
        reportContainer.innerHTML = '';
        
        // Add header
        const header = document.createElement('h2');
        header.textContent = 'Comprehensive Surf Map Test Report';
        header.style.cssText = 'margin-top: 0; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px;';
        reportContainer.appendChild(header);
        
        // Add timestamp
        const timestamp = document.createElement('p');
        timestamp.textContent = `Generated: ${new Date(report.timestamp).toLocaleString()}`;
        timestamp.style.cssText = 'font-size: 12px; color: #666; margin-bottom: 20px;';
        reportContainer.appendChild(timestamp);
        
        // Add summary
        const summaryDiv = document.createElement('div');
        summaryDiv.innerHTML = `
            <h3>Summary</h3>
            <p><strong>Total Tests:</strong> ${report.summary.totalTests}</p>
            <p><strong>Passed:</strong> <span style="color: green;">${report.summary.passedTests}</span></p>
            <p><strong>Failed:</strong> <span style="color: red;">${report.summary.failedTests}</span></p>
            <p><strong>Pass Rate:</strong> ${report.summary.passRate}</p>
            <p><strong>Conclusion:</strong> ${report.conclusion}</p>
        `;
        summaryDiv.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; margin-bottom: 20px;';
        reportContainer.appendChild(summaryDiv);
        
        // Add test category results
        const categoriesDiv = document.createElement('div');
        categoriesDiv.innerHTML = '<h3>Test Categories</h3>';
        
        Object.keys(report.testCategories).forEach(category => {
            const cat = report.testCategories[category];
            const catName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            const catDiv = document.createElement('div');
            catDiv.innerHTML = `
                <h4>${catName}</h4>
                <p><strong>Total:</strong> ${cat.total}, <strong>Passed:</strong> ${cat.passed}, <strong>Failed:</strong> ${cat.failed}</p>
            `;
            catDiv.style.cssText = 'margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #ccc;';
            categoriesDiv.appendChild(catDiv);
        });
        
        reportContainer.appendChild(categoriesDiv);
        
        // Add recommendations
        if (report.recommendations.length > 0) {
            const recDiv = document.createElement('div');
            recDiv.innerHTML = '<h3>Recommendations</h3>';
            
            const recList = document.createElement('ul');
            report.recommendations.forEach(rec => {
                const recItem = document.createElement('li');
                recItem.textContent = rec;
                recItem.style.cssText = 'margin-bottom: 8px;';
                recList.appendChild(recItem);
            });
            
            recDiv.appendChild(recList);
            recDiv.style.cssText = 'margin-bottom: 20px;';
            reportContainer.appendChild(recDiv);
        }
        
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
        closeBtn.onclick = () => reportContainer.remove();
        reportContainer.appendChild(closeBtn);
        
        // Add export button
        const exportBtn = document.createElement('button');
        exportBtn.textContent = 'Export Report';
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
            
            const exportFileDefaultName = 'surf-map-test-report.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        };
        reportContainer.appendChild(exportBtn);
        
        return report;
    }
}

// Create a global test runner instance
window.testRunner = new ComprehensiveTestRunner();

// Add global functions for easy access
window.runComprehensiveTests = () => window.testRunner.runAllTests();
window.runSearchTests = () => window.testRunner.runSearchTests();
window.runCounterTests = () => window.testRunner.runCounterTests();
window.generateTestReport = () => window.testRunner.generateTestReport();
window.displayTestReport = () => window.testRunner.displayTestReport();

// Auto-display instructions when the script is loaded
console.log('Comprehensive Test Runner loaded!');
console.log('Available commands:');
console.log('  runComprehensiveTests() - Run all tests');
console.log('  runSearchTests() - Run only search functionality tests');
console.log('  runCounterTests() - Run only counter functionality tests');
console.log('  generateTestReport() - Generate a detailed test report');
console.log('  displayTestReport() - Display a formatted test report');

export { ComprehensiveTestRunner };