function getFocusableElements(container) {
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
		)
	)
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
	summary.setAttribute('role', 'button')
	summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'))

	if (summary.nextElementSibling.getAttribute('id')) {
		summary.setAttribute('aria-controls', summary.nextElementSibling.id)
	}

	summary.addEventListener('click', (event) => {
		event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'))
	})

	if (summary.closest('header-drawer, menu-drawer')) return
	summary.parentElement.addEventListener('keyup', onKeyUpEscape)
})

const trapFocusHandlers = {}

function trapFocus(container, elementToFocus = container) {
	var elements = getFocusableElements(container)
	var first = elements[0]
	var last = elements[elements.length - 1]

	removeTrapFocus()

	trapFocusHandlers.focusin = (event) => {
		if (event.target !== container && event.target !== last && event.target !== first) return

		document.addEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.focusout = function () {
		document.removeEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== 'TAB') return // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault()
			first.focus()
		}

		//  On the first focusable element and tab backward, focus the last element.
		if ((event.target === container || event.target === first) && event.shiftKey) {
			event.preventDefault()
			last.focus()
		}
	}

	document.addEventListener('focusout', trapFocusHandlers.focusout)
	document.addEventListener('focusin', trapFocusHandlers.focusin)

	elementToFocus.focus()

	if (
		elementToFocus.tagName === 'INPUT' &&
		['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
		elementToFocus.value
	) {
		elementToFocus.setSelectionRange(0, elementToFocus.value.length)
	}
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
	document.querySelector(':focus-visible')
} catch (e) {
	focusVisiblePolyfill()
}

function focusVisiblePolyfill() {
	const navKeys = [
		'ARROWUP',
		'ARROWDOWN',
		'ARROWLEFT',
		'ARROWRIGHT',
		'TAB',
		'ENTER',
		'SPACE',
		'ESCAPE',
		'HOME',
		'END',
		'PAGEUP',
		'PAGEDOWN',
	]
	let currentFocusedElement = null
	let mouseClick = null

	window.addEventListener('keydown', (event) => {
		if (navKeys.includes(event.code.toUpperCase())) {
			mouseClick = false
		}
	})

	window.addEventListener('mousedown', (event) => {
		mouseClick = true
	})

	window.addEventListener(
		'focus',
		() => {
			if (currentFocusedElement) currentFocusedElement.classList.remove('focused')

			if (mouseClick) return

			currentFocusedElement = document.activeElement
			currentFocusedElement.classList.add('focused')
		},
		true
	)
}

function pauseAllMedia() {
	document.querySelectorAll('.js-youtube').forEach((video) => {
		video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*')
	})
	document.querySelectorAll('.js-vimeo').forEach((video) => {
		video.contentWindow.postMessage('{"method":"pause"}', '*')
	})
	document.querySelectorAll('video').forEach((video) => video.pause())
	document.querySelectorAll('product-model').forEach((model) => {
		if (model.modelViewerUI) model.modelViewerUI.pause()
	})
}

function removeTrapFocus(elementToFocus = null) {
	document.removeEventListener('focusin', trapFocusHandlers.focusin)
	document.removeEventListener('focusout', trapFocusHandlers.focusout)
	document.removeEventListener('keydown', trapFocusHandlers.keydown)

	if (elementToFocus) elementToFocus.focus()
}

function onKeyUpEscape(event) {
	if (event.code.toUpperCase() !== 'ESCAPE') return

	const openDetailsElement = event.target.closest('details[open]')
	if (!openDetailsElement) return

	const summaryElement = openDetailsElement.querySelector('summary')
	openDetailsElement.removeAttribute('open')
	summaryElement.setAttribute('aria-expanded', false)
	summaryElement.focus()
}

function debounce(fn, wait) {
	let t

	return (...args) => {
		clearTimeout(t)
		t = setTimeout(() => fn.apply(this, args), wait)
	}
}

function throttle(fn, delay) {
	let lastCall = 0

	return function (...args) {
		const now = new Date().getTime()
		if (now - lastCall < delay) {
			return
		}
		lastCall = now

		return fn(...args)
	}
}

/*********************************************
 ************ DOM FUNCTIONS ******************/
function generateDomFromString(elementContent, elementTag = 'div') {
	const newElement = document.createElement(elementTag)
	newElement.innerHTML = elementContent

	return newElement
}

function parseStringToDom(htmlString, selector = 'div') {
	const newDom = new DOMParser().parseFromString(htmlString, 'text/html')

	if (selector) return newDom.querySelector(selector)
	else return newDom
}

function isInViewport(elem) {
	const rect = elem.getBoundingClientRect()

	return (
		Math.round(rect.top) >= 0 &&
		Math.round(rect.left) >= 0 &&
		Math.round(rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) &&
		Math.round(rect.right) <= (window.innerWidth || document.documentElement.clientWidth)
	)
}

function handelize(str) {
	return str
		.toLowerCase() // Chuyển đổi chuỗi thành chữ thường
		.replace(/[^\w\s-]/g, '') // Loại bỏ tất cả các ký tự không phải chữ, số, khoảng trắng, hoặc dấu gạch ngang
		.trim() // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
		.replace(/[\s_-]+/g, '-') // Thay thế khoảng trắng, dấu gạch dưới, và dấu gạch ngang liên tiếp bằng một dấu gạch ngang duy nhất
		.replace(/^-+|-+$/g, '') // Loại bỏ dấu gạch ngang ở đầu và cuối chuỗi (nếu có)
}

/*********************************************
 ********** DEBOUNCE / THROTTLE *************/

const addEventDelegate = ({ element = document.documentElement, selector, eventName = 'click', callback, options }) => {
	const onEvent = (event) => {
		const target = event.target?.closest(selector)
		if (target) {
			callback(event, target)
		}
	}

	element.addEventListener(eventName, onEvent, options)

	return () => element.removeEventListener(eventName, onEvent, options)
}

/*****************************************************************
 ************************** FETCH / AJAX *************************/
const requestDefaultConfigs = {
	mode: 'same-origin',
	credentials: 'same-origin',
	headers: {
		'X-Requested-With': 'XMLHttpRequest',
		'Content-Type': 'application/json',
	},
}

function getRequestDefaultConfigs() {
	return JSON.parse(JSON.stringify(requestDefaultConfigs))
}

function fetchConfig(type = 'json', method = 'POST') {
	return {
		method,
		headers: {
			'Content-Type': 'application/json',
			Accept: `application/${type}`,
		},
	}
}

function fetchConfigTest(type = 'json') {
	return {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
	}
}

function fetchJSON(url, options = getRequestDefaultConfigs()) {
	return fetch(url, options).then((response) => {
		if (!response.ok) throw response

		return response.json()
	})
}

/*******************************************************************
 ******************** FETCH TEXT / JSON CACHE *********************/
const cache = new Map()

function fetchCache(url, options = getRequestDefaultConfigs()) {
	return new Promise((resolve, reject) => {
		let cachedResult = cache.get(url)
		if (cachedResult) return resolve(cachedResult)

		fetch(url, options)
			.then((response) => {
				cachedResult = response.text()
				cache.set(url, cachedResult)
				resolve(cachedResult)
			})
			.catch(reject)
	})
}

const cacheJson = new Map()

function fetchJsonCache(url, options = requestDefaultConfigs) {
	return new Promise((resolve, reject) => {
		if (cacheJson.get(url)) {
			return resolve(cacheJson.get(url))
		}

		fetch(url, options)
			.then((response) => {
				if (response.ok) {
					const result = response.json()
					cacheJson.set(url, result)

					return resolve(result)
				}

				reject(response)
			})
			.catch(reject)
	})
}

/****************************************************************
 ******************** FETCH SECTION CACHE ***********************/
const sectionCache = new Map()

function fetchSection(e, options = {}) {
	const { url: cachedURL, fromCache = !1, params = {} } = options

	return new Promise((resolve, reject) => {
		const url = new URL(cachedURL || window.location.href)

		url.searchParams.set('section_id', e)
		Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))

		if (fromCache) {
			const sectionCached = sectionCache.get(url)

			if (sectionCached) {
				return resolve(sectionCached)
			}
		}

		fetch(url, getRequestDefaultConfigs())
			.then((response) => {
				if (response.ok) {
					return response.text()
				}

				reject(`Failed to load section: ${e}`)
			})
			.then((e) => {
				const sectionHTML = generateDomFromString(e)
				sectionCache.set(url, sectionHTML)
				resolve(sectionHTML)
			})
			.catch(reject)
	})
}

/****************************************************************
 ********************* FORMAT MONEY FUNCTION ********************/
function formatMoney(cents, format = '') {
	let value = ''
	const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/
	const formatString = format || '${{amount}}'

	if (typeof cents == 'string') {
		cents = cents.replace('.', '')
	}

	function defaultOption(opt, def) {
		return typeof opt == 'undefined' ? def : opt
	}

	function formatWithDelimiters(number, precision, thousands, decimal) {
		precision = defaultOption(precision, 2)
		thousands = defaultOption(thousands, ',')
		decimal = defaultOption(decimal, '.')

		if (isNaN(number) || number == null) {
			return 0
		}

		number = (number / 100.0).toFixed(precision)

		var parts = number.split('.'),
			dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
			cents = parts[1] ? decimal + parts[1] : ''

		return dollars + cents
	}

	switch (formatString.match(placeholderRegex)[1]) {
		case 'amount':
			value = formatWithDelimiters(cents, 2)
			break
		case 'amount_no_decimals':
			value = formatWithDelimiters(cents, 0, ' ', '.')
			break
		case 'amount_with_comma_separator':
			value = formatWithDelimiters(cents, 2, '.', '.')
			break
		case 'amount_no_decimals_with_comma_separator':
			value = formatWithDelimiters(cents, 0, '.', '.')
			break
	}

	return formatString.replace(placeholderRegex, value)
}

/*****************************************************************
 ************************* LOAD ASSETS ***************************/
function loadJS(src, container = document.body, async = false, defer = true) {
	return new Promise((resolve, reject) => {
		const ownerDocument = container.ownerDocument
		const existScript = ownerDocument.querySelector(`script[src="${src}"]`)

		if (existScript) {
			return existScript.dataset.loaded
				? resolve(true)
				: void existScript.addEventListener('load', () => {
						existScript.dataset.loaded = true
						resolve(true)
				  })
		}

		const newScript = ownerDocument.createElement('script')
		newScript.src = src
		newScript.async = async
		newScript.defer = defer

		newScript.addEventListener('load', () => {
			newScript.dataset.loaded = true
			resolve(true)
		})

		newScript.onerror = reject
		container.appendChild(newScript)
	})
}

function loadCSS(src, container = document.head) {
	return new Promise((resolve, reject) => {
		const ownerDocument = container.ownerDocument
		const stylesheet = ownerDocument.querySelector(`link[href="${src}"]`)

		if (stylesheet) {
			return stylesheet.dataset.loaded
				? resolve(true)
				: void stylesheet.addEventListener('load', () => {
						stylesheet.dataset.loaded = true
						resolve(true)
				  })
		}

		const newStylesheet = ownerDocument.createElement('link')
		newStylesheet.rel = 'stylesheet'
		newStylesheet.href = src

		newStylesheet.addEventListener('load', () => {
			newStylesheet.dataset.loaded = true
			resolve(true)
		})

		newStylesheet.onerror = reject
		container.appendChild(newStylesheet)
	})
}

function initLazyScript(element, callback, threshold = 500) {
	if ('IntersectionObserver' in window) {
		const io = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						if (typeof callback === 'function') {
							callback()
							observer.unobserve(entry.target)
						}
					}
				})
			},
			{ rootMargin: `0px 0px ${threshold}px 0px` }
		)

		io.observe(element)
	} else {
		callback()
	}
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
	window.Shopify = {}
}

window.Shopify.bind = function (fn, scope) {
	return function () {
		return fn.apply(scope, arguments)
	}
}

window.Shopify.setSelectorByValue = function (selector, value) {
	for (var i = 0, count = selector.options.length; i < count; i++) {
		var option = selector.options[i]
		if (value == option.value || value == option.innerHTML) {
			selector.selectedIndex = i

			return i
		}
	}
}

window.Shopify.addListener = function (target, eventName, callback) {
	target.addEventListener
		? target.addEventListener(eventName, callback, false)
		: target.attachEvent('on' + eventName, callback)
}

window.Shopify.postLink = function (path, options) {
	options = options || {}
	var method = options['method'] || 'post'
	var params = options['parameters'] || {}

	var form = document.createElement('form')
	form.setAttribute('method', method)
	form.setAttribute('action', path)

	for (var key in params) {
		var hiddenField = document.createElement('input')
		hiddenField.setAttribute('type', 'hidden')
		hiddenField.setAttribute('name', key)
		hiddenField.setAttribute('value', params[key])
		form.appendChild(hiddenField)
	}
	document.body.appendChild(form)
	form.submit()
	document.body.removeChild(form)
}

window.Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
	this.countryEl = document.getElementById(country_domid)
	this.provinceEl = document.getElementById(province_domid)
	this.provinceContainer = document.getElementById(options['hideElement'] || province_domid)

	window.Shopify.addListener(this.countryEl, 'change', window.Shopify.bind(this.countryHandler, this))

	this.initCountry()
	this.initProvince()
}

window.Shopify.CountryProvinceSelector.prototype = {
	initCountry: function () {
		var value = this.countryEl.getAttribute('data-default')
		window.Shopify.setSelectorByValue(this.countryEl, value)
		this.countryHandler()
	},

	initProvince: function () {
		var value = this.provinceEl.getAttribute('data-default')
		if (value && this.provinceEl.options.length > 0) {
			window.Shopify.setSelectorByValue(this.provinceEl, value)
		}
	},

	countryHandler: function (e) {
		var opt = this.countryEl.options[this.countryEl.selectedIndex]
		var raw = opt.getAttribute('data-provinces')
		var provinces = JSON.parse(raw)

		this.clearOptions(this.provinceEl)
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = 'none'
			this.provinceContainer.classList.remove('is-active')
		} else {
			for (var i = 0; i < provinces.length; i++) {
				opt = document.createElement('option')
				opt.value = provinces[i][0]
				opt.innerHTML = provinces[i][1]
				this.provinceEl.appendChild(opt)
			}

			this.provinceContainer.style.display = ''
			this.provinceContainer.classList.add('is-active')
		}
	},

	clearOptions: function (selector) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild)
		}
	},

	setOptions: function (selector, values) {
		for (var i = 0, count = values.length; i < values.length; i++) {
			var opt = document.createElement('option')
			opt.value = values[i]
			opt.innerHTML = values[i]
			selector.appendChild(opt)
		}
	},
}

