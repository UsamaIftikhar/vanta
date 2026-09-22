# VANTA merchant guide

## Install and preview

Upload the theme ZIP under Online Store → Themes → Add theme. Preview the unpublished theme before publishing. Your products, collections, navigation, policies and language settings remain in Shopify. The included VANTA imagery describes a fictional design concept; replace it with imagery of the products you sell.

## Brand, typography and colors

Open Customize → Theme settings. Under Brand, set your text logo, favicon, social media image and profile URLs. Turn off fictional demo imagery once your media is ready. Header supports an image logo and an alternate logo for its overlay mode. Start with a transparent logo around 400px wide.

Typography has separate display, heading, body and button font pickers. Use one or two related families for a cohesive result. Layout controls page width, spacing, corner radius and card treatment. Colors control background, text, accent, surface, secondary text and borders. Check contrast after changes, including sale prices and form controls. VANTA is the active preset. AURA and FORGE are future design directions, not finished presets in this release.

## Header, navigation and footer

Select your main menu in Header. Build nested navigation in Shopify Content → Menus. Two nested levels are supported, with desktop columns and expandable mobile navigation. Header can remain sticky, reveal on upward scroll, or scroll normally. Overlay mode is intended for a dark first section; choose a matching alternate logo. A promotion block can add an image/link to expanded desktop navigation.

Search is available in the header and on the full search page. Account UI uses Shopify's account component when customer accounts are enabled. Cart opens a drawer when the global drawer setting is on; disabling it returns to normal cart navigation.

Footer supports menu columns, social media links, payment icons, policies and Follow on Shop. Country and language selectors appear when your Shopify Markets/language configuration has multiple choices. Native forms submit your selection; prices are never manually converted.

## Home page and editorial sections

Sections can be reordered, hidden and added through the editor. The default sequence combines a large hero, statement, collections, horizontal story, hotspots, lookbook, featured products, marquee, manifesto and newsletter. Press, testimonials, video and comparison are available but disabled until appropriate content is supplied. Do not invent endorsements or technical measurements.

Every marketing section has content, color and spacing settings where relevant. Use a short eyebrow, a concise heading and a useful product-focused description. Long headings wrap naturally; preview on mobile. The hero's “Use as page heading” option should be on for the primary home page hero only.

Featured collection requires a selected collection. Featured product requires a selected product and supports reorderable information blocks. An unconfigured featured product is hidden from shoppers. The Custom Liquid section is for trusted code and compatible app snippets.

## Product pages

Product media, title, options, prices, availability and inventory come from Shopify. Add option swatches through Shopify's native swatch configuration. Product blocks include price, options, buy buttons, pickup, description, vendor, SKU, inventory, sharing, collapsible content, Custom Liquid and app blocks. Add a collapsible block linked to a Shopify page for your size guide; enter your actual sizing measurements and regional conversions there.

Gallery, stacked, sticky, immersive and 3D-first media layouts share the same purchasing logic. Videos have controls. Images open in a larger view. Native model media uses Shopify's product media rendering. Related and complementary recommendation sections use Shopify's recommendation service. Configure complementary items through Shopify's supported merchandising tools.

Keep accelerated checkout enabled unless your selling arrangement makes it unsuitable. Gift cards with recipient fields use Add to bag; recipient validation is not supported by accelerated checkout. Subscription choices appear when selling plans are assigned. Selected plan names and line properties appear in the cart.

## Collections and search

Configure filter availability in Shopify. The theme renders the filters the platform provides, including price ranges, then submits standard URLs. Sorting and pagination use server-rendered navigation and work without JavaScript. Single-variant quick add is available only when no required selling plan is involved; products needing a choice link to their product page.

## 3D setup

Upload a self-contained GLB to Shopify Files and paste its URL into the 3D section. Add a poster image first: it is visible immediately and remains the complete fallback. Start with balanced quality, mobile poster mode, no automatic rotation and subtle scroll rotation. Camera distance, rotation, scale, model position and lighting tune the composition.

Use GLB with embedded textures under 5 MB, ideally under 2 MB for mobile. Keep textures around 1024–2048px and minimize mesh/material count. The current custom engine does not support Draco/Meshopt/KTX2-compressed files. Your model artist should export an ordinary GLB and check it in the preview. A 20 MB transfer limit protects shoppers from accidental large uploads.

Story frames define text plus a camera/rotation/scale state. Desktop scroll reveals frames beside the scene; mobile uses concise horizontal cards. Hotspots use easy X/Y percentages and independent accessible information panels. Exploded view requires intentionally prepared independent nodes named `explode_…`; an ordinary model will remain whole.

No model is required to sell products. If graphics are unsupported or a model fails, the poster and CTA remain. Users with reduced-motion preferences get a quieter experience. Avoid running several large animated models on the same page.

## Motion, video and mobile

Choose no reveals, fade, fade-up, clip or subtle scale. The marquee is decorative, and its readable text is exposed once. Magnetic buttons and the pointer halo are off by default. Reduced motion overrides animation settings. Native scrolling is never locked for storytelling.

For video, prefer Shopify-hosted MP4 with a useful poster and controls. External YouTube/Vimeo embeds load only in configured video sections. Upload portrait editorial images around 1600×2000 and landscape hero images around 1800×1200. Set Shopify focal points so meaningful details survive cropping.

## Troubleshooting

- **No 3D:** check that 3D is enabled, the URL is a direct GLB, textures are embedded, the file is within budget, and the browser supports WebGL. The “Explore in 3D” button intentionally gates mobile and reduced-motion use.
- **No filters:** configure filters in Shopify; empty/unsupported filter data cannot be invented by the theme.
- **No pickup:** a selected variant needs an enabled pickup location and genuine availability.
- **No recommendations:** Shopify may have no recommendation data for that product yet.
- **No locale selectors:** publish another language or enable additional countries in Markets.
- **Wrong image framing:** use a focal point or a more suitable source aspect ratio.
- **Cart error:** review the displayed Shopify message; stock or purchase rules may have changed. The full cart page remains available.
- **Slow page:** reduce image sizes, video duration, model complexity and the number of simultaneous 3D sections. Measure with real content on a published-domain HTTPS preview.

This development build has not been approved by the Shopify Theme Store. Public theme support and documentation hosting must be established before commercial release.
