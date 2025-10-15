/**
 * @fileoverview Surf spots counter module.
 * @version 1.0.0
 * @description This module provides a dynamic counter that displays the number of surf spots
 * currently visible on the map based on search results.
 */

/**
 * Surf spots counter class.
 */
export class SurfSpotsCounter {
    /**
     * @param {HTMLElement} counterElement - The counter element.
     * @param {Object} options - Configuration options.
     * @param {string} [options.numberSelector='.counter-number'] - Selector for the number element.
     * @param {string} [options.labelSelector='.counter-label'] - Selector for the label element.
     * @param {string} [options.singularLabel='surf spot'] - Label for singular count.
     * @param {string} [options.pluralLabel='surf spots'] - Label for plural count.
     * @param {number} [options.animationDuration=300] - Duration of count change animation in ms.
     */
    constructor(counterElement, options = {}) {
        this.counterElement = counterElement;
        this.options = {
            numberSelector: options.numberSelector || '.counter-number',
            labelSelector: options.labelSelector || '.counter-label',
            singularLabel: options.singularLabel || 'surf spot',
            pluralLabel: options.pluralLabel || 'surf spots',
            animationDuration: options.animationDuration || 300,
            ...options
        };

        // Elements
        this.numberElement = this.counterElement.querySelector(this.options.numberSelector);
        this.labelElement = this.counterElement.querySelector(this.options.labelSelector);

        // State
        this.currentCount = 0;
        this.isAnimating = false;

        // Initialize
        this.init();
    }

    /**
     * Initializes the counter.
     */
    init() {
        if (!this.numberElement || !this.labelElement) {
            console.error('Counter elements not found');
            return;
        }

        // Set initial count
        this.updateCount(0);
    }

    /**
     * Updates the counter with a new count.
     * @param {number} count - The new count.
     * @param {boolean} [animate=true] - Whether to animate the change.
     */
    updateCount(count, animate = true) {
        if (typeof count !== 'number' || count < 0) {
            console.error('Invalid count value:', count);
            return;
        }

        // Don't update if count hasn't changed
        if (count === this.currentCount) {
            return;
        }

        // Update current count
        const previousCount = this.currentCount;
        this.currentCount = count;

        // Update the number display
        this.updateNumberDisplay(count, animate);

        // Update the label based on count
        this.updateLabel(count);

        // Announce change to screen readers
        this.announceChange(count, previousCount);
    }

    /**
     * Updates the number display with optional animation.
     * @param {number} count - The new count.
     * @param {boolean} animate - Whether to animate the change.
     */
    updateNumberDisplay(count, animate) {
        // Format the number with commas for larger values
        const formattedCount = this.formatNumber(count);

        if (animate && this.options.animationDuration > 0) {
            // Add animation class
            this.numberElement.classList.add('updating');
            this.isAnimating = true;

            // Update the text content
            this.numberElement.textContent = formattedCount;

            // Remove animation class after animation completes
            setTimeout(() => {
                this.numberElement.classList.remove('updating');
                this.isAnimating = false;
            }, this.options.animationDuration);
        } else {
            // Update without animation
            this.numberElement.textContent = formattedCount;
        }
    }

    /**
     * Updates the label based on the count.
     * @param {number} count - The current count.
     */
    updateLabel(count) {
        if (count === 1) {
            this.labelElement.textContent = this.options.singularLabel;
        } else {
            this.labelElement.textContent = this.options.pluralLabel;
        }
    }

    /**
     * Formats a number with commas for thousands.
     * @param {number} num - The number to format.
     * @returns {string} The formatted number.
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Announces the count change to screen readers.
     * @param {number} newCount - The new count.
     * @param {number} previousCount - The previous count.
     */
    announceChange(newCount, previousCount) {
        const changeType = newCount > previousCount ? 'increased' : 'decreased';
        const label = newCount === 1 ? this.options.singularLabel : this.options.pluralLabel;
        const message = `Number of visible ${label} ${changeType} to ${newCount}`;
        
        // Update aria-label if needed
        this.counterElement.setAttribute('aria-label', message);
    }

    /**
     * Resets the counter to zero.
     * @param {boolean} animate - Whether to animate the change.
     */
    reset(animate = true) {
        this.updateCount(0, animate);
    }

    /**
     * Gets the current count.
     * @returns {number} The current count.
     */
    getCurrentCount() {
        return this.currentCount;
    }

    /**
     * Checks if the counter is currently animating.
     * @returns {boolean} Whether the counter is animating.
     */
    isCounterAnimating() {
        return this.isAnimating;
    }

    /**
     * Destroys the counter and cleans up resources.
     */
    destroy() {
        // Remove animation class if present
        if (this.numberElement) {
            this.numberElement.classList.remove('updating');
        }

        // Clear references
        this.counterElement = null;
        this.numberElement = null;
        this.labelElement = null;
    }
}