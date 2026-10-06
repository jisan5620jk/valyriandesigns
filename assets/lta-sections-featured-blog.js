if (!customElements.get('l-featured-blog')) {
	class LTAFeaturedBlog extends HTMLElement {
		constructor() {
			super()
		}

		connectedCallback() {
			this.unSubscribeLoadCarousel = window.subscribe(window.PUB_SUB_EVENTS.library.carousel, () => {
				this.init()
			})
		}

		disconnectedCallback() {
			this.unSubscribeLoadCarousel && this.unSubscribeLoadCarousel()
		}

		init() {
			this.sectionId = this.dataset.section
			this.carousel = this.querySelector('[data-carousel]')

			// Setup carousel
			this.flickity = new window.Flickity(this.carousel, {
				cellAlign: 'left',
				contain: true,
				pageDots: false,
			})

			// Setup navigation data
			this.navigationPrev = document.getElementById(`NavigationPrev-${this.sectionId}`)
			this.navigationNext = document.getElementById(`NavigationNext-${this.sectionId}`)

			if (this.navigationPrev) {
				this.navigationPrev.removeAttribute('disabled')
				this.navigationPrev.addEventListener('click', () => {
					this.flickity.previous()
				})
			}

			if (this.navigationNext) {
				this.navigationNext.removeAttribute('disabled')
				this.navigationNext.addEventListener('click', () => {
					this.flickity.next()
				})
			}
		}
	}

	customElements.define('l-featured-blog', LTAFeaturedBlog)
}

