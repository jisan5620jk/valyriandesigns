if (!customElements.get('l-customer-reviews')) {
	customElements.define(
		'l-customer-reviews',
		class LTACustomerReview extends HTMLElement {
			constructor() {
				super()
			}

			connectedCallback() {
				this.unSubscribeLoadCarousel = window.subscribe(window.PUB_SUB_EVENTS.library.carousel, () => {
					this.setupCarousel()
				})
			}

			disconnectedCallback() {
				this.unSubscribeLoadCarousel && this.unSubscribeLoadCarousel()
			}

			setupCarousel() {
				if (!window.Flickity) return

				this.sectionId = this.dataset.sectionId
				const customerReviewsCarousel = this.querySelector('.js-carousel')

				this.classList.remove('hidden')

				this.flickity = new window.Flickity(customerReviewsCarousel, {
					cellAlign: 'left',
					prevNextButtons: false,
					adaptiveHeight: true,
					pageDots: false,
					autoPlay: false,
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
	)
}

