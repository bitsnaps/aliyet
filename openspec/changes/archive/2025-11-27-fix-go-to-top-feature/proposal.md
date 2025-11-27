# Proposal: Fix the 'Go to Top' feature

This proposal aims to fix the "Go to Top" feature. The existing `GoToTop.vue` component is implemented but does not work, likely because it's listening for scroll events on the `window` object, while the actual scrollable container is another element (a common occurrence in layouts provided by UI frameworks like `@nuxt/ui`). The fix involves changing the scroll event handling to use `document.documentElement` and also installing the missing icon library for the button.


## Why
The "Go to Top" feature is currently non-functional, leading to a suboptimal user experience when navigating long pages. The existing `GoToTop.vue` component, while present, fails to correctly detect scroll events and activate, primarily due to an incompatibility with modern Nuxt/UI framework layouts where the `window` object is not the primary scrollable element. Additionally, the chevron icon for the button is not rendering due to a missing icon library setup.

## What Changes
This proposal introduces modifications to the `GoToTop.vue` component to correctly handle scroll detection and smooth scrolling by targeting `document.documentElement` instead of the `window` object. It also includes the necessary steps to ensure the `nuxt-lucide-icons` module is properly installed and configured, allowing the chevron icon to render as intended.
