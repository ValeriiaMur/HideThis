chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ keywords: [], effect: "blur" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "updateSettings") {
    chrome.storage.local.set({
      keywords: request.keywords,
      effect: request.effect,
    });
  }
});