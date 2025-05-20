// src/popup.ts
// src/popup.ts
document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.getElementById('copyButton') as HTMLButtonElement | null;
  const feedbackSpan = document.getElementById('feedback') as HTMLSpanElement | null;
  const mainContentToggle = document.getElementById('mainContentToggle') as HTMLInputElement | null;

  if (!copyButton) {
    console.error('Popup: Copy button not found.');
    return;
  }
  if (!feedbackSpan) {
    console.error('Popup: Feedback span not found.');
    // You might want to create it dynamically if it's essential and might be missing
  }
  if (!mainContentToggle) {
    console.error('Popup: Main content toggle not found.');
    // This is a critical element, so we might stop here or handle it differently
  }

  // Load saved toggle state
  chrome.storage.sync.get('findMainContentOnly', (data) => {
    if (mainContentToggle) {
      mainContentToggle.checked = data.findMainContentOnly === true;
    }
  });

  // Save toggle state on change
  if (mainContentToggle) {
    mainContentToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ findMainContentOnly: mainContentToggle.checked });
    });
  }


  copyButton.addEventListener('click', () => {
    if (feedbackSpan) {
      feedbackSpan.textContent = 'Processing...';
      feedbackSpan.style.display = 'inline';
    }
    console.log('Popup: Copy button clicked.');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || typeof activeTab.id === 'undefined') {
        console.error('Popup: No active tab found or tab ID is missing.');
        if (feedbackSpan) {
          feedbackSpan.textContent = 'Error: No active tab!';
          setTimeout(() => { if(feedbackSpan) feedbackSpan.style.display = 'none'; }, 3000);
        }
        return;
      }

      const tabId = activeTab.id;
      const findMainContentOnly = mainContentToggle ? mainContentToggle.checked : false;


      // Function to send the message and handle the response
      const sendMessageToContentScript = () => {
        console.log('Popup: Sending message to get markdown.');
        chrome.tabs.sendMessage(
          tabId,
          { action: 'getMarkdownFromPage', findMainContentOnly: findMainContentOnly },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Popup: Error receiving response from content script.', chrome.runtime.lastError.message);
              if (feedbackSpan) {
                feedbackSpan.textContent = 'Error: No response from page.';
                setTimeout(() => { if(feedbackSpan) feedbackSpan.style.display = 'none'; }, 3000);
              }
              return;
            }

            if (response && response.success) {
              console.log('Popup: Received markdown data.');
              navigator.clipboard.writeText(response.data)
                .then(() => {
                  console.log('Popup: Markdown copied to clipboard.');
                  if (feedbackSpan) feedbackSpan.textContent = '✅ Copied!';
                })
                .catch(err => {
                  console.error('Popup: Failed to copy to clipboard.', err);
                  if (feedbackSpan) feedbackSpan.textContent = '❌ Copy failed!';
                });
            } else {
              console.error('Popup: Content script failed to get markdown.', response?.error);
              if (feedbackSpan) feedbackSpan.textContent = `❌ Error: ${response?.error || 'Unknown'}`;
            }

            if (feedbackSpan) {
              setTimeout(() => { if(feedbackSpan) feedbackSpan.style.display = 'none'; }, 2000);
            }
          }
        );
      };

      // First, try to send a message to the content script.
      // If it fails, the content script is not yet injected.
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not injected, inject it now
          console.log('Popup: Content script not detected, injecting.');
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js'] // Path relative to extension root (dist folder)
          }, () => {
            if (chrome.runtime.lastError) {
              console.error('Popup: Failed to inject content script.', chrome.runtime.lastError.message);
              if (feedbackSpan) {
                feedbackSpan.textContent = 'Error injecting script!';
                setTimeout(() => { if(feedbackSpan) feedbackSpan.style.display = 'none'; }, 3000);
              }
              return;
            }
            console.log('Popup: Content script injected. Sending message.');
            sendMessageToContentScript(); // Send the actual message after injection
          });
        } else {
          // Content script is already injected, send the message directly
          console.log('Popup: Content script detected. Sending message directly.');
          sendMessageToContentScript();
        }
      });
    });
  });
});
