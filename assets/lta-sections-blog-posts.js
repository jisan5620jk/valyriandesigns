if (!customElements.get('l-blog-posts')) {
	class LTABlogPosts extends HTMLElement {
		constructor() {
			super()

			window.initLazyScript(this, this.init.bind(this))
		}

		init() {
			this.showMoreBtn = this.querySelector('[data-show-more]')
			if (!this.showMoreBtn) return

			this.articlesContainer = this.querySelector('[data-articles]')
			this.showMoreBtnSpinner = this.showMoreBtn.querySelector('.loading__spinner')
			this.currentPage = parseInt(this.dataset.currentPage)
			this.totalPage = parseInt(this.dataset.totalPage)

			this.showMoreBtn.addEventListener('click', () => {
				this.currentPage++

				this.showMoreBtn.classList.add('loading')
				this.showMoreBtnSpinner.classList.remove('hidden')

				fetch(`${this.dataset.url}?section_id=${this.dataset.section}&page=${this.currentPage}`)
					.then((response) => response.text())
					.then((responseText) => {
						const html = new DOMParser().parseFromString(responseText, 'text/html')

						console.log(html)

						this.articlesContainer.insertAdjacentHTML(
							'beforeend',
							html.querySelector('[data-articles]')?.innerHTML || ''
						)
					})
					.finally(() => {
						this.showMoreBtn.classList.remove('loading')
						this.showMoreBtnSpinner.classList.add('hidden')

						if (this.currentPage >= this.totalPage) this.showMoreBtn.remove()
					})
			})
		}
	}

	customElements.define('l-blog-posts', LTABlogPosts)
}

