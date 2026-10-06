if (!customElements.get('l-hero-banner')) {
  class LTAHeroBanner extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.unSubscribeLoadCarousel = window.subscribe(
        window.PUB_SUB_EVENTS.library.carousel,
        () => {
          this.init();
        }
      );
    }

    disconnectedCallback() {
      this.unSubscribeLoadCarousel && this.unSubscribeLoadCarousel();
    }

    init() {
      this.sectionId = this.dataset.section;
      this.slides = this.querySelectorAll('[data-slide]');

      // Reset slide to avoid layout shift score
      this.slides.forEach((slide) => slide.classList.remove('hidden'));

      console.log(this.slides);

      // Setup carousel
      this.flickity = new window.Flickity(this, {
        cellAlign: 'center',
        wrapAround: true,
        contain: true,
        pageDots: false,
        autoPlay: 2000, // Autoplay every 5 seconds
        pauseAutoPlayOnHover: false,
      });

      // Setup navigation data
      this.navigationPrev = document.getElementById(
        `NavigationPrev-${this.sectionId}`
      );
      this.navigationNext = document.getElementById(
        `NavigationNext-${this.sectionId}`
      );

      if (this.navigationPrev) {
        this.navigationPrev.removeAttribute('disabled');
        this.navigationPrev.addEventListener('click', () => {
          this.flickity.previous();
          this.flickity.playPlayer(); // Restart autoplay
        });
      }

      if (this.navigationNext) {
        this.navigationNext.removeAttribute('disabled');
        this.navigationNext.addEventListener('click', () => {
          this.flickity.next();
          this.flickity.playPlayer(); // Restart autoplay
        });
      }
    }
  }

  customElements.define('l-hero-banner', LTAHeroBanner);
}
