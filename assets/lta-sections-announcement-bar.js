if (!customElements.get('l-announcement-bar')) {
	class LAnnouncementBar extends HTMLElement {
		constructor() {
			super()

			this.slider = this.querySelector('[data-slider]')
			this.sliders = this.querySelectorAll('[data-slide]')
			this.navNextBtn = this.querySelector("[data-nav='next']")
			this.navPrevBtn = this.querySelector("[data-nav='prev']")
		}

		connectedCallback() {
			this.unSubscribeChangeEvent = window.subscribe(window.PUB_SUB_EVENTS.events.resize, () => {
				const currentSlide = this.querySelector('[data-slide].is-visible')
				const currentSlideIndex = Array.from(currentSlide.parentElement.children).indexOf(currentSlide)
				this.setActiveHeight(currentSlideIndex)
			})

			if (this.slider) {
				this.slider.addEventListener('mouseenter', this.pauseSlider.bind(this))
				this.slider.addEventListener('mouseleave', this.resumeSlider.bind(this))
			}

			this.setActiveHeight()
			this.autoSlider()
			this.setupClose()
		}

		setupClose() {
			const closeBtn = this.querySelector('[data-close]')

			closeBtn &&
				closeBtn.addEventListener('click', () => {
					this.parentElement.remove()
				})
		}

		autoSlider() {
			if (this.sliders.length <= 1) return

			this.sliders[0].classList.add('is-visible')

			const autoChangeSlide = () => {
				if (!this.pausedSlider && window.isInViewport(this)) {
					this.changeSlide()
				}

				window.debounce(() => {
					autoChangeSlide()
				}, this.dataset.readTime)()
			}

			// Setup automatically change slide
			window.debounce(() => {
				autoChangeSlide()
			}, this.dataset.readTime)()

			// Setup navigation click events
			if (this.navNextBtn && this.navPrevBtn) {
				this.navNextBtn.addEventListener('click', () => {
					this.changeSlide()
					this.pauseSlider()

					window.debounce(() => {
						this.resumeSlider()
					}, this.dataset.readTime * 2)()
				})

				this.navPrevBtn.addEventListener('click', () => {
					this.changeSlide(false)
					this.pauseSlider()

					window.debounce(() => {
						this.resumeSlider()
					}, this.dataset.readTime * 2)()
				})
			}
		}

		changeSlide(isNext = true) {
			const currentSlide = this.querySelector('[data-slide].is-visible')
			const currentSlideIndex = Array.from(currentSlide.parentElement.children).indexOf(currentSlide)

			let nextSlideIndex = currentSlideIndex + 1 < this.sliders.length ? currentSlideIndex + 1 : 0

			if (!isNext) {
				nextSlideIndex = currentSlideIndex - 1 >= 0 ? currentSlideIndex - 1 : this.sliders.length - 1
			}

			this.style.setProperty('--l-announcement-bar-height', `${this.sliders[nextSlideIndex].offsetHeight}px`)

			this.sliders[nextSlideIndex].classList.add('is-visible')
			this.sliders[currentSlideIndex].classList.remove('is-visible')

			// Set nav disable / enable
			this.toggleNavBtn(currentSlideIndex)

			window.debounce(() => {
				this.publishChangeHeightEvent()
			}, 100)()
		}

		toggleNavBtn(currentSlideIndex) {
			if (!this.navNextBtn || this.navPrevBtn) return

			if (currentSlideIndex == 0) {
				this.navNextBtn.setAttribute('disabled', '')
			} else {
				this.navNextBtn.removeAttribute('disabled')
			}

			if (currentSlideIndex + 1 == this.sliders.length) {
				this.navNextBtn.setAttribute('disabled', '')
			} else {
				this.navNextBtn.removeAttribute('disabled')
			}
		}

		setActiveHeight(index = 0) {
			this.style.setProperty('--l-announcement-bar-height', `${this.sliders[index].offsetHeight}px`)
		}

		publishChangeHeightEvent() {
			window.publish(window.PUB_SUB_EVENTS.events.componentResize, {
				source: 'l-announcement-bar',
			})
		}

		pauseSlider() {
			this.pausedSlider = true
		}

		resumeSlider() {
			this.pausedSlider = false
		}
	}

	customElements.define('l-announcement-bar', LAnnouncementBar)
}

