# Copy Page as Markdown

This extension adds an icon to the browser toolbar.

When clicked, a small menu/UI is shown.

The UI has a button that, when clicked, the content from the current browser tab is copied to the
clipboard as markdown.

# New feature:

__Feature:__ "Try to find `main` content only" Toggle

__Description:__ Implement a user interface toggle labeled "Try to find `main` content only". When enabled, this feature modifies the HTML-to-Markdown conversion process to target specific content areas rather than the entire document body.

__Behavior:__ If the "Try to find `main` content only" option is selected, the system shall attempt to identify the primary content block within the loaded HTML document using the following prioritized selection logic:

1. __Semantic `<main>` element:__ First, search for the presence of a `<main>` HTML element. If found, this element's inner HTML will be considered the target content for Markdown conversion.
2. __Element with `id="main"`:__ If no `<main>` element is found, search for a single HTML element with the attribute `id="main"`. If found, its inner HTML will be used.
3. __Element with `class="main"`:__ If neither a `<main>` element nor an element with `id="main"` is found, search for a single HTML element with the attribute `class="main"`. If found, its inner HTML will be used.

If none of the above criteria yield a single target element, the feature should gracefully fall back to converting the entire document body (similar to when the toggle is disabled). This prioritized search order aims to maximize the likelihood of accurately identifying the main content across diverse web page structures.
