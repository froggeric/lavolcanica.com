/**
 * Keyboard Handler for Surf Map Navigation
 * Provides comprehensive keyboard controls for map interaction
 */

export class KeyboardHandler {
    constructor(surfMap, options = {}) {
        this.surfMap = surfMap;
        this.options = {
            panStep: 50, // pixels per arrow press
            zoomStep: 0.2, // zoom amount per +/- press
            enableContinuousPan: true, // hold arrow for continuous pan
            panSpeed: 16, // ms between pan updates when holding
            ...options
        };
        this.keysPressed = new Set();
        this.panIntervalId = null;
        this.isEnabled = true;
        this.boundHandlers = {
            keyDown: this.handleKeyDown.bind(this),
            keyUp: this.handleKeyUp.bind(this)
        };
        this.init();
    }

    init() {
        document.addEventListener('keydown', this.boundHandlers.keyDown);
        document.addEventListener('keyup', this.boundHandlers.keyUp);
    }

    handleKeyDown(event) {
        // Ignore if typing in input field
        if (this.isTyping(event)) return;

        // Ignore if disabled
        if (!this.isEnabled) return;

        const key = event.key;

        // Prevent default for map controls
        if (this.isMapControl(key)) {
            event.preventDefault();
        }

        // Single-press actions
        switch(key) {
            case '+':
            case '=':
                this.surfMap.zoomIn(this.options.zoomStep);
                break;
            case '-':
            case '_':
                this.surfMap.zoomOut(this.options.zoomStep);
                break;
            case '0':
                this.surfMap.resetView();
                break;
            case 'Escape':
                this.handleEscape();
                break;
            case '?':
                this.toggleKeyboardShortcuts();
                break;
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                this.keysPressed.add(key);
                if (this.options.enableContinuousPan && !this.panIntervalId) {
                    this.startContinuousPan();
                } else if (!this.options.enableContinuousPan) {
                    // Single-step pan if continuous pan is disabled
                    this.handleSinglePan();
                }
                break;
        }
    }

    handleKeyUp(event) {
        const key = event.key;
        if (key.startsWith('Arrow')) {
            this.keysPressed.delete(key);
            if (this.keysPressed.size === 0) {
                this.stopContinuousPan();
            }
        }
    }

    startContinuousPan() {
        this.panIntervalId = setInterval(() => {
            let deltaX = 0;
            let deltaY = 0;

            if (this.keysPressed.has('ArrowLeft')) deltaX += this.options.panStep;
            if (this.keysPressed.has('ArrowRight')) deltaX -= this.options.panStep;
            if (this.keysPressed.has('ArrowUp')) deltaY += this.options.panStep;
            if (this.keysPressed.has('ArrowDown')) deltaY -= this.options.panStep;

            if (deltaX !== 0 || deltaY !== 0) {
                this.surfMap.pan(deltaX, deltaY);
            }
        }, this.options.panSpeed);
    }

    stopContinuousPan() {
        if (this.panIntervalId) {
            clearInterval(this.panIntervalId);
            this.panIntervalId = null;
        }
    }

    handleSinglePan() {
        let deltaX = 0;
        let deltaY = 0;

        if (this.keysPressed.has('ArrowLeft')) deltaX += this.options.panStep;
        if (this.keysPressed.has('ArrowRight')) deltaX -= this.options.panStep;
        if (this.keysPressed.has('ArrowUp')) deltaY += this.options.panStep;
        if (this.keysPressed.has('ArrowDown')) deltaY -= this.options.panStep;

        if (deltaX !== 0 || deltaY !== 0) {
            this.surfMap.pan(deltaX, deltaY);
        }
    }

    handleEscape() {
        // Close any open panels
        const sidePanel = document.getElementById('side-panel');
        if (sidePanel && sidePanel.classList.contains('active')) {
            const closeBtn = sidePanel.querySelector('.close-panel-btn');
            if (closeBtn) {
                closeBtn.click();
            }
        }

        // Also close search panel if open
        const searchPanel = document.getElementById('search-panel');
        if (searchPanel && searchPanel.classList.contains('active')) {
            const closeBtn = searchPanel.querySelector('.close-search-panel');
            if (closeBtn) {
                closeBtn.click();
            }
        }

        // Close keyboard shortcuts panel if open
        const keyboardShortcutsPanel = document.getElementById('keyboard-shortcuts-panel');
        if (keyboardShortcutsPanel && keyboardShortcutsPanel.getAttribute('aria-hidden') === 'false') {
            keyboardShortcutsPanel.setAttribute('aria-hidden', 'true');
        }
    }

    toggleKeyboardShortcuts() {
        const keyboardShortcutsPanel = document.getElementById('keyboard-shortcuts-panel');
        if (keyboardShortcutsPanel) {
            const isHidden = keyboardShortcutsPanel.getAttribute('aria-hidden') === 'true';
            keyboardShortcutsPanel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
        }
    }

    isTyping(event) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        return tagName === 'input' ||
               tagName === 'textarea' ||
               target.isContentEditable;
    }

    isMapControl(key) {
        return ['+', '=', '-', '_', '0', '?', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape'].includes(key);
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.stopContinuousPan();
        this.keysPressed.clear();
    }

    destroy() {
        this.stopContinuousPan();
        document.removeEventListener('keydown', this.boundHandlers.keyDown);
        document.removeEventListener('keyup', this.boundHandlers.keyUp);
        this.keysPressed.clear();
        this.isEnabled = false;
    }
}