if (!customElements.get('lta-before-after')) {
	class LTABeforeAfter extends HTMLElement {
		constructor() {
			super()

			window.initLazyScript(this, this.init.bind(this))
		}

		init() {
			this.media = this.querySelector('[data-media]')
			this.inputRange = this.querySelector('[data-range]')
			this.testimonials = this.querySelectorAll('[data-testimonial]')

			this.inputRange.addEventListener('input', window.debounce(this.handleInputChange.bind(this), 10))
		}

		handleInputChange() {
			this.style.setProperty('--l-before-after-range', `${this.inputRange.value}%`)
		}
	}

	customElements.define('lta-before-after', LTABeforeAfter)
}

