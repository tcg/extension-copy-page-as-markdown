/// <reference types="chrome" />
import { NodeHtmlMarkdown } from 'node-html-markdown';

// Use a unique property on window to ensure the script runs only once per page load
if ((window as any).myMarkdownExtensionContentScriptLoaded) {
  console.log('Markdown extension content script already loaded, exiting.');
} else {
  (window as any).myMarkdownExtensionContentScriptLoaded = true;
  console.log('Markdown extension content script initialized.');

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getMarkdownFromPage') {
      console.log('Content script received getMarkdownFromPage request.');
      try {
        const title = document.title;
        const url = window.location.href;
        const findMainContentOnly = request.findMainContentOnly === true;

        let contentHtml = '';
        let selectedElement: Element | null = null;

        if (findMainContentOnly) {
          console.log('Content script: Attempting to find main content.');
          // Prioritized search logic
          selectedElement = document.querySelector('main');
          if (!selectedElement) {
            selectedElement = document.getElementById('main');
          }
          if (!selectedElement) {
            const mainClassElements = document.getElementsByClassName('main');
            if (mainClassElements.length === 1) {
              selectedElement = mainClassElements[0];
            } else if (mainClassElements.length > 1) {
              console.warn('Content script: Found multiple elements with class="main". Falling back to body.');
              selectedElement = null; // Fallback if multiple elements with class="main"
            }
          }

          if (selectedElement) {
            console.log('Content script: Main content element found.', selectedElement);
            contentHtml = selectedElement.innerHTML;
          } else {
            console.log('Content script: Main content element not found using prioritized logic. Falling back to body.');
            contentHtml = document.body ? document.body.innerHTML : '';
          }
        } else {
          console.log('Content script: Main content toggle is off. Using entire body.');
          contentHtml = document.body ? document.body.innerHTML : '';
        }


        if (!contentHtml) {
           console.warn('Content script: No content HTML found.');
           sendResponse({ success: false, error: 'No content available for conversion.' });
           return true; // Keep channel open for async response
        }


        const markdown = NodeHtmlMarkdown.translate(contentHtml);
        const finalMarkdown = `# ${title}\n\n[${url}](${url})\n\n${markdown}`;

        console.log('Content script generated markdown.');
        sendResponse({ success: true, data: finalMarkdown });
      } catch (e: any) {
        console.error('Content script error during markdown generation:', e);
        sendResponse({ success: false, error: e.message });
      }
      return true; // Indicates that sendResponse will be called asynchronously
    } else if (request.action === 'ping') {
      console.log('Content script received ping request.');
      sendResponse({ success: true, message: 'pong' });
      return true; // Keep channel open for async response
    }
  });
}
