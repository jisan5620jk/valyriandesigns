if (!customElements.get('l-theme-config')) {
	class LTAThemeConfig extends HTMLElement {
		constructor() {
			super()
		}

		connectedCallback() {
			this.init()

			this.unSubscribeReCalculateHeader = window.subscribe(window.PUB_SUB_EVENTS.events.componentResize, () => {
				this.reCalculateHeader()
			})
		}

		disconnectedCallback() {
			if (this.unSubscribeReCalculateHeader) this.unSubscribeReCalculateHeader()
		}

		init() {
			// Set default
			this.reCalculateHeader()

			// Events
			this.detectLibrariesLoaded()
			this.onGlobalResize()
			this.onMediaQueriesChange()
			this.onWindowClick()
			this.onWindowKeyup()
		}

		detectLibrariesLoaded() {
			// if (window.Flickity) {
			// 	window.publish(window.PUB_SUB_EVENTS.library.carousel)
			// }
		}

		/********************** Setup events ***********************
		 ******************************************************************/
		onGlobalResize() {
			window.addEventListener(
				'resize',
				window.debounce(() => {
					this.reCalculateHeader()

					window.publish(window.PUB_SUB_EVENTS.events.resize, {
						source: 'global',
					})
				}, 50)
			)
		}

		onMediaQueriesChange() {
			const mediaQueries = window.LTA_Theme.mediaQueries

			for (const [device, mediaQuery] of Object.entries(mediaQueries)) {
				const queryMatchMedia = window.matchMedia(mediaQuery)

				queryMatchMedia.addEventListener('change', () => {
					for (const [device, mediaQuery] of Object.entries(mediaQueries)) {
						window.LTA_Theme.mediaMatches[device] = window.matchMedia(mediaQuery).matches
					}

					window.publish(window.PUB_SUB_EVENTS.events.matchMedia, {
						source: 'global',
						mediaMatches: window.LTA_Theme.mediaMatches,
						device,
					})
				})
			}
		}

		onWindowClick() {
			document.addEventListener('click', (event) => {
				window.publish(window.PUB_SUB_EVENTS.events.click, event)
			})
		}

		onWindowKeyup() {
			document.addEventListener('keyup', (event) => {
				window.publish(window.PUB_SUB_EVENTS.events.keyup, event)
			})
		}

		/********************** Setup header state (height) ***************
		 ******************************************************************/
		reCalculateHeader() {
			this.header = this.header || document.querySelector('.section-header')

			if (this.header) {
				document.documentElement.style.setProperty(
					'--header-bottom-position',
					`${this.header.getBoundingClientRect().bottom}px`
				)

				document.documentElement.style.setProperty(
					'--header-bottom-position-desktop',
					`${Math.floor(this.header.getBoundingClientRect().bottom)}px`
				)
			}

			/* Set global viewport height */
			document.documentElement.style.setProperty(
				'--viewport-height',
				`${visualViewport?.height ?? window.innerHeight}px`
			)
		}
	}

	customElements.define('l-theme-config', LTAThemeConfig)
}

