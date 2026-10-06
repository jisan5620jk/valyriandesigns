/**
 * Variant-Based Media Gallery System
 *
 * ─── ARCHITECTURE ────────────────────────────────────────────────────────────
 *
 * The Liquid template renders ALL variant images in the DOM.
 * Dawn's l-product-media handles the gallery (sizing, hero display, modal,
 * thumbnail clicks, active state). We do NOT override any of that.
 *
 * Our ONLY job is variant switching:
 *   • Add .vms-hidden to gallery items + thumbnail wrappers that DON'T belong
 *     to the newly selected variant
 *   • Remove .vms-hidden from items that DO belong to the new variant
 *   • Reset is-active so the first image of the new variant is the hero
 *   • Update the thumbnail highlight (is-active on button)
 *
 * DOM structure (produced by Liquid):
 *
 *   Main gallery items:
 *     <div class="product__media-item [is-active] [vms-hidden]"
 *          data-media-group
 *          data-variant-combo="Moderna, Black"
 *          data-media-id="123">
 *       (product-thumbnail snippet output)
 *     </div>
 *
 *   Thumbnail wrappers (ONE per image — Dawn requires individual wrappers):
 *     <div class="thumbnail-list__item [vms-hidden]"
 *          data-variant-combo="Moderna, Black"
 *          data-media-id="123">
 *       <button class="thumbnail [is-active]" data-media-id="123">
 *         <img ...>
 *       </button>
 *     </div>
 *
 *   CSS:
 *     .vms-hidden { display: none !important; }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

if (!customElements.get('l-variant-media')) {
	customElements.define(
		'l-variant-media',
		class LTAVariantMedia extends HTMLElement {

			connectedCallback() {
				this.sectionId   = this.dataset.section
				this.currentKey  = this.dataset.variantKey   // e.g. "Moderna, Black"

				// Store the last active thumbnail position to preserve it across variant changes
				this.lastActiveThumbnailPosition = 0

				// Thumbnail list is a sibling of l-variant-media in the DOM
				this.thumbList   = document.getElementById(`ThumbnailList-${this.sectionId}`)

				// Dawn's gallery element — we call its setActiveMedia if available
				this.galleryEl   = document.getElementById(`GalleryViewer-${this.sectionId}`)

				// Ensure we wait for the gallery element to be fully initialized
				this.waitForGallery()

				// Subscribe to Dawn's variant change event
				this.unsubscribe = window.subscribe(
					window.PUB_SUB_EVENTS.variantChangeWithoutHTML,
					(event) => this.switchVariant(event.data.variant)
				)
			}

			disconnectedCallback() {
				if (this.unsubscribe) this.unsubscribe()
			}

			/**
			 * Returns a function that tests whether a data-variant-combo
			 * matches the given variant (handles both "A, B" and "A,B" formats).
			 */
			buildMatcher(variant) {
				const withSpace   = variant.options.join(', ')
				const withoutSpace = variant.options.join(',')
				return (combo) => combo === withSpace || combo === withoutSpace
			}

			/**
			 * Track when a thumbnail is clicked to preserve its position
			 */
			trackThumbnailClick(mediaId) {
				const thumbnail = this.thumbList.querySelector(`[data-media-id="${mediaId}"]`)
				if (thumbnail) {
					// Find the position among all visible thumbnails
					const visibleThumbnails = Array.from(this.thumbList.querySelectorAll('[data-variant-combo]:not(.vms-hidden)'))
					const position = visibleThumbnails.indexOf(thumbnail)
					this.lastActiveThumbnailPosition = position
				}
			}

			/**
			 * Wait for the gallery element to be fully initialized
			 */
			waitForGallery() {
				const checkGallery = () => {
					if (this.galleryEl && typeof this.galleryEl.setActiveMedia === 'function') {
						// Gallery is ready
						return
					}
					// Gallery not ready yet, try again in 50ms
					setTimeout(checkGallery, 50)
				}
				checkGallery()
			}

			/**
			 * Called when the user selects a different variant.
			 * Swaps visibility between variant image sets and resets
			 * the active image to the first one of the new variant.
			 */
			switchVariant(variant) {
				const matches    = this.buildMatcher(variant)
				this.currentKey  = variant.options.join(', ')

				// ── Keep data-variant-key in sync so popup JS can read it ──
				this.dataset.variantKey = this.currentKey

				// ── 1. Main gallery items ───────────────────────────────────
				// Show all items belonging to the new variant, hide all others.
				// Reset is-active: only the first item of the new variant is active.
				let firstGalleryItem = null

				this.querySelectorAll('[data-variant-combo]').forEach((item) => {
					if (matches(item.dataset.variantCombo)) {
						item.classList.remove('vms-hidden')
						// Track the first item so we can activate it below
						if (!firstGalleryItem) firstGalleryItem = item
					} else {
						item.classList.remove('is-active')
						item.classList.add('vms-hidden')
					}
				})

				// Remove is-active from all gallery items of new variant,
				// then activate only the first one
				this.querySelectorAll('[data-variant-combo]').forEach((item) => {
					if (matches(item.dataset.variantCombo)) {
						item.classList.remove('is-active')
					}
				})
				if (firstGalleryItem) {
					firstGalleryItem.classList.add('is-active')

					// Tell Dawn's gallery to show this media ID as the hero image
					// (triggers its own internal scroll/display logic)
					const mediaId = firstGalleryItem.dataset.mediaId
					this.waitForGallery()
					if (mediaId && this.galleryEl && typeof this.galleryEl.setActiveMedia === 'function') {
						this.galleryEl.setActiveMedia(mediaId, false)
					}
				}

				// ── 2. Thumbnail wrappers ───────────────────────────────────
				if (!this.thumbList) return

				let firstThumbBtn = null

				// Remove all thumbnail is-active highlights first
				this.thumbList.querySelectorAll('.thumbnail.is-active').forEach((btn) => {
					btn.classList.remove('is-active')
				})
				this.thumbList.querySelectorAll('.thumbnail-list__item.thumbnail-active').forEach((item) => {
					item.classList.remove('thumbnail-active')
				})

				// Collect all visible thumbnails for the new variant
				const visibleThumbnails = []
				this.thumbList.querySelectorAll('[data-variant-combo]').forEach((wrapper) => {
					if (matches(wrapper.dataset.variantCombo)) {
						wrapper.classList.remove('vms-hidden')
						visibleThumbnails.push(wrapper)
					} else {
						wrapper.classList.add('vms-hidden')
					}
				})

				// Activate the thumbnail at the preserved position, or first if position is out of bounds
				const targetPosition = Math.min(this.lastActiveThumbnailPosition, visibleThumbnails.length - 1)
				const targetThumbnail = visibleThumbnails[targetPosition]
				
				if (targetThumbnail) {
					const btn = targetThumbnail.querySelector('.thumbnail')
					if (btn) {
						btn.classList.add('is-active')
						targetThumbnail.classList.add('thumbnail-active')
						
						// Also update the main gallery to show this media
						const mediaId = targetThumbnail.dataset.mediaId
						if (mediaId && this.galleryEl && typeof this.galleryEl.setActiveMedia === 'function') {
							this.galleryEl.setActiveMedia(mediaId, false)
						}
					}
				}
			}
		}
	)
}

// ─────────────────────────────────────────────────────────────────────────────
// Popup video button: show/hide on variant change
// Uses window.variantVideoMap built by product-media-gallery.liquid:
//   { "6ft, Corten Steel": "https://cdn.shopify.com/...mp4", ... }
// Button shows when the new variant's key exists in the map.
// No product_video block or customizer checkboxes needed.
// ─────────────────────────────────────────────────────────────────────────────
;(function () {
	const videoMap = window.variantVideoMap
	if (!videoMap) return

	// Function to update button visibility
	function updateVideoButton(variantKey) {
		const btn = document.getElementById('openPopupBtn')
		if (!btn) return

		const variantKeyNoSpace = variantKey.replace(/,\s*/g, ',')
		const hasVideo = !!(videoMap[variantKey] || videoMap[variantKeyNoSpace])
		
		if (hasVideo) {
			btn.classList.add('show')
		} else {
			btn.classList.remove('show')
		}
	}

	// Initialize button state on page load
	document.addEventListener('DOMContentLoaded', function() {
		// Get initial variant from the LVariantMedia element or fallback
		const lvm = document.querySelector('[id^="LVariantMedia"]')
		if (lvm && lvm.dataset.variantKey) {
			updateVideoButton(lvm.dataset.variantKey)
		}
	})

	// Update on variant change
	window.subscribe(window.PUB_SUB_EVENTS.variantChangeWithoutHTML, (event) => {
		const variant = event.data.variant
		const variantKey = (variant.options || []).join(', ')
		updateVideoButton(variantKey)
	})
})()

// ─────────────────────────────────────────────────────────────────────────────
// Legacy stubs — safe no-ops so nothing errors if referenced elsewhere
// ─────────────────────────────────────────────────────────────────────────────
;['l-media-finish', 'l-media-landscape', 'l-media-dimensions', 'l-media-others'].forEach((tag) => {
	if (!customElements.get(tag)) {
		customElements.define(tag, class extends HTMLElement {
			connectedCallback() { /* legacy — not used in new variant system */ }
		})
	}
})