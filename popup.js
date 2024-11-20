// On load, retrieve keywords and effect from chrome.storage
chrome.storage.local.get(["keywords", "effect"], ({ keywords = [], effect = "blur" }) => {
  // Populate the keyword list
  updateKeywordList(keywords);

  // Set the selected effect in the dropdown
  document.getElementById("effectSelect").value = effect;
});

// Add a new keyword to storage
document.getElementById("addKeyword").addEventListener("click", () => {
  const keywordInput = document.getElementById("keywordInput");
  const keyword = keywordInput.value.trim();

  if (keyword) {
    // Retrieve existing keywords, add the new one, and save back
    chrome.storage.local.get(["keywords"], ({ keywords = [], tabs }) => {
      keywords.push(keyword);
      chrome.storage.local.set({ keywords }, () => updateKeywordList(keywords));
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id); // Reload the current tab
      }
    });

    // Clear the input field
    keywordInput.value = "";
  }
});

// Save effect and refresh the current page
document.getElementById("saveSettings").addEventListener("click", () => {
  const effect = document.getElementById("effectSelect").value;

  // Save the selected effect to storage
  chrome.storage.local.set({ effect }, () => {
    // Notify background script or refresh the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id); // Reload the current tab
      }
    });
  });
});

// Function to update the list of keywords
function updateKeywordList(keywords) {
  const list = document.getElementById("keywordList");

  // Render keywords as a list with remove buttons
  list.innerHTML = keywords
    .map((kw, index) => `
      <li>
        ${kw}
        <button class="remove-btn" data-index="${index}" title="Remove keyword">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4z"/>
          </svg>
        </button>
      </li>
    `)
    .join("");

  // Add event listeners to remove buttons
  document.querySelectorAll(".remove-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = parseInt(button.getAttribute("data-index"), 10);

      // Remove the keyword from storage
      chrome.storage.local.get(["keywords"], ({ keywords = [] }) => {
        keywords.splice(index, 1); // Remove the keyword at the specified index
        chrome.storage.local.set({ keywords }, () => {
          updateKeywordList(keywords); // Update the list
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.reload(tabs[0].id); // Reload the current tab
            }
          });
        });
      });
    });
  });
}