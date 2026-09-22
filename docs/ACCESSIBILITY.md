# Accessibility

Semantic landmarks, a skip link, visible focus rings, native details navigation, labelled forms, useful image alt text and responsive touch targets are foundational. Product option links have selected state and remain navigable without JavaScript. Unavailable combinations are exposed in text. Drawers and zoom use native modal dialogs with Escape handling and focus restoration.

Predictive search uses a labelled search field, suggestions, keyboard arrow navigation, Escape closing and a live result count. Forms and cart requests expose progress, inline errors and live updates. No invented review scores or inventory claims are used.

3D is supplemental: poster imagery, normal CTA, semantic story text, numbered hotspot links and keyboard rotation controls remain. Reduced motion is respected globally. Color controls can be misconfigured by merchants; verify contrast after changing a palette.

Automated testing includes axe on home, collection, product and open cart, plus keyboard/focus and reduced-motion browser tests. See QA reports for actual outcomes. The baseline storefront had no serious/critical home or collection violations. Shopify's unbranded accelerated checkout button surfaced a contrast issue; scoped unbranded-button styling corrected it and the targeted product/cart axe test passed. The second Lighthouse run reports 100 accessibility on home, collection and product.

Release still requires manual screen-reader testing (VoiceOver and NVDA), real iOS/Android focus/keyboard behavior, long translations and high zoom. Automated checks are not a declaration of WCAG conformance.

Cross-browser follow-up found WebKit did not reliably focus a clicked drawer trigger before opening. Dialog helpers now save an explicit trigger and restore its focus on close. WebKit focus/navigation assertions passed after the fix; its strict console gate still records a Shopify localhost CORS error.
