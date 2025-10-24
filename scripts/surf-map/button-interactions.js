/**
 * @fileoverview Manages continuous press-and-hold interactions for UI buttons.
 * @description This class uses a requestAnimationFrame loop for smooth, performant
 * continuous actions (like zooming) when a button is held down.
 */
export class ButtonInteractionManager {
    /**
     * @param {Object[]} buttonConfigs - Array of button configurations.
     *   Each config: { element: HTMLElement, action: Function, delay?: number, speed?: number }
     */
    constructor(buttonConfigs) {
        this.buttons = buttonConfigs;
        this.zoomState = {
            isZooming: false,
            action: null,
            lastZoomTime: 0,
            speed: 150 // Default ms between zooms
        };
        this.pressTimeout = null;
        this.isLooping = false;

        this.bound = {
            start: this.handlePressStart.bind(this),
            end: this.handlePressEnd.bind(this),
            loop: this.loop.bind(this)
        };

        this.init();
    }

    init() {
        this.buttons.forEach(config => {
            const { element } = config;
            element.addEventListener('mousedown', (e) => this.bound.start(e, config));
            element.addEventListener('touchstart', (e) => this.bound.start(e, config), { passive: false });

            element.addEventListener('mouseup', this.bound.end);
            element.addEventListener('mouseleave', this.bound.end);
            element.addEventListener('touchend', this.bound.end);
        });
    }

    handlePressStart(event, config) {
        event.preventDefault();
        config.element.classList.add('map-control-btn--active');
        
        // Execute the action immediately
        config.action();

        // For continuous actions, start the loop
        if (config.isContinuous) {
            this.zoomState.isZooming = true;
            this.zoomState.action = config.action;
            this.zoomState.speed = config.speed || 150;
            const delay = config.delay || 300;

            this.pressTimeout = setTimeout(() => {
                if (this.zoomState.isZooming && !this.isLooping) {
                    this.isLooping = true;
                    this.zoomState.lastZoomTime = performance.now();
                    requestAnimationFrame(this.bound.loop);
                }
            }, delay);
        }
    }

    handlePressEnd() {
        this.buttons.forEach(config => config.element.classList.remove('map-control-btn--active'));
        this.zoomState.isZooming = false;
        this.zoomState.action = null;
        if (this.pressTimeout) {
            clearTimeout(this.pressTimeout);
            this.pressTimeout = null;
        }
        this.isLooping = false;
    }

    loop(timestamp) {
        if (!this.isLooping) return;

        if (timestamp - this.zoomState.lastZoomTime > this.zoomState.speed) {
            if (this.zoomState.action) {
                this.zoomState.action();
            }
            this.zoomState.lastZoomTime = timestamp;
        }

        requestAnimationFrame(this.bound.loop);
    }

    destroy() {
        this.buttons.forEach(config => {
            const { element } = config;
            element.removeEventListener('mousedown', this.bound.start);
            element.removeEventListener('touchstart', this.bound.start);
            element.removeEventListener('mouseup', this.bound.end);
            element.removeEventListener('mouseleave', this.bound.end);
            element.removeEventListener('touchend', this.bound.end);
        });
        this.handlePressEnd(); // Ensure any active loops are stopped
    }
}
