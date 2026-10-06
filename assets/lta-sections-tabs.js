if (!customElements.get('l-tabs')) {
	class LTATabs extends HTMLElement {
		constructor() {
			super()

			window.initLazyScript(this, this.init.bind(this))
		}

		init() {
			this.tabs = this.querySelectorAll('[data-tab]')
			this.contents = this.querySelectorAll('[data-content]')

			this.tabs.forEach((tab) => {
				tab.addEventListener('click', () => {
					const tabId = tab.dataset.tab

					this.tabs.forEach((currentTab) => {
						tab == currentTab ? currentTab.classList.add('is-active') : currentTab.classList.remove('is-active')
					})

					this.contents.forEach((currentContent) => {
						const contentId = currentContent.dataset.content

						if (tabId == contentId) {
							currentContent.classList.remove('hidden')
						} else {
							currentContent.classList.add('hidden')
						}
					})
				})
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

	customElements.define('l-tabs', LTATabs)
}

