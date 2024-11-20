// document.getElementById("addKeyword").addEventListener("click", () => {
//   const keywordInput = document.getElementById("keywordInput");
//   const keyword = keywordInput.value.trim();
//   if (keyword) {
//     chrome.storage.local.get(["keywords"], ({ keywords }) => {
//       keywords.push(keyword);
//       chrome.storage.local.set({ keywords }, () => updateKeywordList(keywords));
//     });
//     keywordInput.value = "";
//   }
// });

// document.getElementById("saveSettings").addEventListener("click", () => {
//   const effect = document.getElementById("effectSelect").value;
//   chrome.storage.local.get(["keywords"], ({ keywords }) => {
//     chrome.runtime.sendMessage({ type: "updateSettings", keywords, effect });
//   });
//   chrome.storage.local.set({ effect }, () => effect);
// });

// function updateKeywordList(keywords) {
//   const list = document.getElementById("keywordList");
//   list.innerHTML = keywords.map((kw) => `<li>${kw}</li>`).join("");
// }

// chrome.storage.local.get(["keywords"], ({ keywords }) => updateKeywordList(keywords));
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
    chrome.storage.local.get(["keywords"], ({ keywords = [] }) => {
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

  // Render keywords as a list
  list.innerHTML = keywords.map((kw) => `<li>${kw}</li>`).join("");
}
