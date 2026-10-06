# Valyrian Designs — Shopify Theme

Custom Shopify Online Store 2.0 theme for Valyrian Designs (fountains, rain curtains, fire features, reflection pools and privacy screens). It is built on Shopify's **Dawn 14.0.0** and adds a set of custom sections, snippets and scripts.

## Requirements

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) 3.x
- Access to the Valyrian Designs store (staff account or collaborator access)

## Local development

```bash
# Log in and start a local preview with hot reload
shopify theme dev --store <store-name>.myshopify.com

# Pull the latest theme from the store (includes merchant edits in the theme editor)
shopify theme pull --store <store-name>.myshopify.com

# Push changes to a theme (use --unpublished or --theme <id> to avoid touching the live theme)
shopify theme push --store <store-name>.myshopify.com --unpublished

# Lint Liquid and JSON
shopify theme check
```

> Merchants edit `config/settings_data.json` and the `templates/*.json` files through the theme editor. Run `shopify theme pull` before you start work so your push doesn't overwrite their changes.

## Project structure

| Folder | Contents |
| --- | --- |
| `layout/` | `theme.liquid` (main wrapper) and `password.liquid` |
| `templates/` | JSON page templates, including product, collection and page alternates (see below) |
| `sections/` | Dawn sections plus custom sections |
| `snippets/` | Reusable Liquid partials (cards, galleries, icons, cart, etc.) |
| `assets/` | CSS and JS files |
| `config/` | `settings_schema.json` (theme settings), `settings_data.json` (saved values), `markets.json` |
| `locales/` | Translation strings and theme editor labels |
| `.shopify/metafields.json` | Metafield definitions the theme uses |

## Custom code conventions

- **`A-*` sections and snippets** are custom components added on top of Dawn, for example `A-hero-banner`, `A-before-after`, `A-faqs`, `A-customer-reviews`, `A-tabs`, `A-founder` and `A-card-product`.
- **`lta-*` assets** are the theme's JavaScript and CSS:
  - `lta-global-*.js`, `lta-utilities.js`, `lta-components.js` and `lta-config.js` load globally from `layout/theme.liquid`.
  - `lta-components-*` holds component scripts and styles (cart, facets, product form, predictive search, etc.).
  - `lta-sections-*` holds section-specific scripts and styles.
- **`jb-product-gallery*`** and **`product-media-gallery-*`** snippets are custom product galleries for specific product templates.
- **`new-main-product*`** sections are custom product page layouts used by the alternate product templates.
- `assets/custom.css` contains extra style overrides.

## Alternate templates

Products and collections are assigned these templates in Shopify admin (**Theme template** field):

- **Product:** `custom-door`, `floor-circle-fountain`, `floor-square-fountain`, `modern-fire-feature`, `two-modern-fire-feature`, `rain-curtain-fountain-*`, `rain-curtain-pots`, `reflection-pool-fountain`, `reflection-pool-fountain-two`, `new-product`, `new-product-two`, `template-akta-service`
- **Collection:** `fire-features`, `fountains`, `privacy-screens`, `rain-curtains`, `reflection-pool-fountain`
- **Page:** `about-us`, `contact`, `faq`, `gallery`
- **Blog / article:** `blog.blogs`, `blog.gallery`, `article.project`

Before you rename or delete a template, check that no product, collection or page in admin still uses it.

## Metafields

The theme reads these custom metafields. The full list is in `.shopify/metafields.json`.

| Owner | Key | Type |
| --- | --- | --- |
| Product | `custom.product_card_color` | color |
| Product | `custom.product_page_image` | file |
| Product | `custom.product_sort_dec` | multi-line text |
| Product | `custom.product_full_description` | multi-line text |
| Variant | `custom.product_weight` | single-line text |
| Variant | `custom.variant_description` | multi-line text |
| Variant | `custom.description_contact` | rich text |
| Article | `custom.card_image` | file |
| Article | `custom.build_product` | product reference |
| Article | `custom.url` | URL |
| Article | `custom.project_label` | single-line text |
| Article | `custom.dec` | rich text |
| Blog | `custom.dec` | rich text |

## Deployment

1. Push to an unpublished theme: `shopify theme push --unpublished`.
2. Preview it and check it in the theme editor.
3. Publish it from **Online Store → Themes** in Shopify admin.
