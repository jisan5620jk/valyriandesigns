window.ON_CHANGE_DEBOUNCE_TIMER = 300

window.PUB_SUB_EVENTS = {
	// Dawn events
	cartUpdate: 'cart-update',
	quantityUpdate: 'quantity-update',
	variantChange: 'variant-change',
	cartError: 'cart-error',
	// Custom events
	variantChangeWithoutHTML: 'variant-change-without-html',
	modal: {
		drawer: 'drawer-modal-open',
		menu: 'header-menu-open',
	},
	library: {
		carousel: 'carousel-loaded',
	},
	events: {
		resize: 'window-resize',
		matchMedia: 'window-match-media',
		click: 'window-click',
		keyup: 'window-keyup',
		componentResize: 'component-resize',
	},
}

var LTA_Theme = LTA_Theme || {}

LTA_Theme.mediaQueries = {
	mobile: '(min-width: 480px)',
	tablet: '(min-width: 750px)',
	desktop: '(min-width: 990px)',
	desktopLg: '(min-width: 1280px)',
	desktopXl: '(min-width: 1440px)',
	portrait: '(orientation: portrait)',
}

LTA_Theme.mediaMatches = {
	mobile: window.matchMedia(window.LTA_Theme.mediaQueries.mobile).matches,
	tablet: window.matchMedia(window.LTA_Theme.mediaQueries.tablet).matches,
	desktop: window.matchMedia(window.LTA_Theme.mediaQueries.desktop).matches,
	desktopLg: window.matchMedia(window.LTA_Theme.mediaQueries.desktopLg).matches,
	desktopXl: window.matchMedia(window.LTA_Theme.mediaQueries.desktopXl).matches,
	portrait: window.matchMedia(window.LTA_Theme.mediaQueries.portrait).matches,
}

