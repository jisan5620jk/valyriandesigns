if (!customElements.get('l-product-media')) {
	customElements.define(
		'l-product-media',
		class MediaGallery extends HTMLElement {
			constructor() {
				super()
				
				this.elements = {
					liveRegion: this.querySelector('[id^="GalleryStatus"]'),
					viewer: this,
					thumbnails: this.querySelector('[id^="ThumbnailList"]'),
				}
				
				this.mql = window.matchMedia('(min-width: 750px)')
				if (!this.elements.thumbnails) return

				this.elements.viewer.addEventListener('slideChanged', debounce(this.onSlideChanged.bind(this), 500))
				
				const thumbnailElements = this.elements.thumbnails.querySelectorAll('[data-media-id]')
				
				thumbnailElements.forEach((mediaToSwitch, index) => {
					const button = mediaToSwitch.querySelector('button')
					
					if (button) {
						button.addEventListener('click', (event) => {
							// Track the thumbnail position for variant switching
							const variantMedia = document.querySelector(`#LVariantMedia-${this.dataset.section}`)
							if (variantMedia && typeof variantMedia.trackThumbnailClick === 'function') {
								variantMedia.trackThumbnailClick(mediaToSwitch.dataset.mediaId)
							}
							
							this.setActiveMedia(mediaToSwitch.dataset.mediaId)
						})
					}
				})
				
				if (this.dataset.desktopLayout.includes('thumbnail') && this.mql.matches) this.removeListSemantic()
			}

			onSlideChanged(event) {
				const thumbnail = this.elements.thumbnails.querySelector(
					`[data-media-id="${event?.detail?.currentElement?.dataset?.mediaId}"]`
				)
				this.setActiveThumbnail(thumbnail)
			}

			setActiveMedia(mediaId) {
				const activeMedia =
					this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`) ||
					this.elements.viewer.querySelector('[data-media-id]')
					
				if (!activeMedia) {
					return
				}
				
				this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
					element.classList.remove('is-active')
				})
				
				activeMedia?.classList?.add('is-active')

				this.preventStickyHeader()
				window.setTimeout(() => {
					if (!this.mql.matches || this.elements.thumbnails) {
						activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft })
					}
					const activeMediaRect = activeMedia.getBoundingClientRect()
					// Don't scroll if the image is already in view
					if (activeMediaRect.top > -0.5) return
					const top = activeMediaRect.top + window.scrollY
					window.scrollTo({ top: top, behavior: 'smooth' })
				})
				this.playActiveMedia(activeMedia)

				if (!this.elements.thumbnails) return
				const activeThumbnail = this.elements.thumbnails.querySelector(`[data-media-id="${mediaId}"]`)
				this.setActiveThumbnail(activeThumbnail)
				this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition)
			}

			setActiveThumbnail(thumbnail) {
				if (!this.elements.thumbnails || !thumbnail) return

				// Remove active class from all thumbnail containers and buttons
				this.elements.thumbnails
					.querySelectorAll('.thumbnail-list__item')
					.forEach((element) => element.classList.remove('thumbnail-active'))
				
				this.elements.thumbnails
					.querySelectorAll('button')
					.forEach((element) => element.removeAttribute('aria-current'))
				
				// Add active class to the clicked thumbnail's container
				thumbnail.classList.add('thumbnail-active')
				thumbnail.querySelector('button').setAttribute('aria-current', true)
				
				// Only scroll if thumbnails element has slider functionality
				if (this.elements.thumbnails.isSlideVisible && this.elements.thumbnails.slider) {
					if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return
					this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft })
				}
			}

			announceLiveRegion(activeItem, position) {
				const image = activeItem.querySelector('.product__modal-opener--image img')
				if (!image) return
				image.onload = () => {
					this.elements.liveRegion.setAttribute('aria-hidden', false)
					this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace('[index]', position)
					setTimeout(() => {
						this.elements.liveRegion.setAttribute('aria-hidden', true)
					}, 2000)
				}
				image.src = image.src
			}

			playActiveMedia(activeItem) {
				window.pauseAllMedia()
				const deferredMedia = activeItem.querySelector('.deferred-media')
				if (deferredMedia) deferredMedia.loadContent(false)
			}

			preventStickyHeader() {
				this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header')
				if (!this.stickyHeader) return
				this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'))
			}

			removeListSemantic() {
				if (!this.elements.viewer.slider) return
				this.elements.viewer.slider.setAttribute('role', 'presentation')
				if (this.elements.viewer.sliderItems) {
					this.elements.viewer.sliderItems.forEach((slide) => slide.setAttribute('role', 'presentation'))
				}
			}
		}
	)
}

