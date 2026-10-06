if (!customElements.get('l-collapsible-tab')) {
	class LTACollapsibleTab extends HTMLElement {
		constructor() {
			super()

			this.collapsibleContainer = this.closest('[data-collapsible-container]')

			this.collapsibleContainer ? this.init() : window.initLazyScript(this, this.init.bind(this))
		}

		init() {
			// Setup default
			this.trigger = this.querySelector('[data-trigger]')
			this.content = this.querySelector('[data-content]')
			this.contentInner = this.content.querySelector('[data-content-inner]')

			if (!this.trigger || !this.content) return

			this.expandedClass = 'is-expanded'
			this.collapsedClass = 'is-collapsed'
			this.collapsedHeight = '0px'

			// Set default height to trigger animate in the first time
			this.classList.contains('is-open')
				? window.debounce(() => {
						this.content.style.height = this.content.scrollHeight + 'px'
				  }, 500)()
				: (this.content.style.height = '0px')

			// Setup events
			this.trigger.addEventListener('click', () => {
				this.classList.contains('is-open') ? this.close() : this.open()
			})
		}

		open() {
			this.closeOtherTabs()

			this.classList.add('is-open')
			this.content.classList.remove('hidden')
			this.content.style.height = this.contentInner.scrollHeight + 'px'

			this.setExpandedAria()
			this.trigger.focus()
		}

		close() {
			this.classList.remove('is-open')
			this.content.style.height = '0px'

			window.debounce(() => {
				// Avoid bug when use only open 1 tab in one time (click many tabs in time)
				!this.classList.contains('is-open') && this.content.classList.add('hidden')
			}, 400)()

			this.setCollapsedAria()
		}

		closeOtherTabs() {
			if (!this.collapsibleContainer) {
				return
			}

			this.otherTabs = this.otherTabs || this.collapsibleContainer.querySelectorAll('l-collapsible-tab')

			this.otherTabs.forEach((tab) => {
				if (tab != this) tab.close()
			})
		}

		setExpandedAria() {
			this.trigger.setAttribute('aria-expanded', 'true')
			this.content.setAttribute('aria-hidden', 'false')
		}

		setCollapsedAria() {
			this.trigger.setAttribute('aria-expanded', 'false')
			this.content.setAttribute('aria-hidden', 'true')
		}
	}

	customElements.define('l-collapsible-tab', LTACollapsibleTab)
}

