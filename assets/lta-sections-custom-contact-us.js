if (!customElements.get('lta-custom-contact-us')) {
	class LTACustomContactUs extends HTMLElement {
		constructor() {
			super()

			window.initLazyScript(this, this.init.bind(this))
		}

		init() {
			this.setupCountries()
			this.toggleRequirementCompanyField()
		}

		setupCountries() {
			const countrySelect = this.querySelector('[data-country-select]')
			if (!countrySelect) return

			const formId = countrySelect.dataset.formId
			const stateContainer = this.querySelector(`#ContactFormProvinceContainer_${formId}`)
			const stateSelect = this.querySelector(`#ContactFormProvince_${formId}`)
			const stateInput = this.querySelector(`#ContactFormState`)

			// Catch change event -> setup state input
			countrySelect.addEventListener(
				'input',
				window.debounce(() => {
					const isShowStateSelect = stateContainer.classList.contains('is-active')

					if (isShowStateSelect) {
						stateSelect.removeAttribute('disabled')
						stateInput.setAttribute('disabled', 'true')
					} else {
						stateSelect.setAttribute('disabled', 'true')
						stateInput.removeAttribute('disabled')
					}
				}, 300)
			)

			// Setup render dynamic provinces
			new window.Shopify.CountryProvinceSelector(`ContactFormCountry_${formId}`, `ContactFormProvince_${formId}`, {
				hideElement: `ContactFormProvinceContainer_${formId}`,
			})
		}

		toggleRequirementCompanyField() {
			this.inquireForSelect = this.querySelector('[data-inquire-for]')
			this.companyInput = this.querySelector('[data-company]')
			if (!this.inquireForSelect || !this.companyInput) return

			this.inquireForSelect.addEventListener('change', () => {
				if (this.inquireForSelect.value == 'My self') {
					this.companyInput.removeAttribute('required')
				} else {
					this.companyInput.setAttribute('required', true)
				}
			})
		}
	}

	customElements.define('lta-custom-contact-us', LTACustomContactUs)
}

