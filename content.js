function applyEffect(word, effect) {
  switch (effect) {
    case "blur":
      return `<span class="keyword-filtered blur">${word}</span>`;
    case "emoji":
      return `<span class="keyword-filtered emoji">💩</span>`;
    case "remove":
      return ""; 
    default:
      return word;
  }
}

function highlightKeywords(node, keywords, effect) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue;
    const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
    
    if (regex.test(text)) {
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      
      text.replace(regex, (match, keyword, index) => {
        // Add text before the match
        if (index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
        }
        
        // Create a span for the matched keyword
        const span = document.createElement('span');
        span.innerHTML = applyEffect(match, effect);
        fragment.appendChild(span);
        
        lastIndex = index + match.length;
      });
      
      // Add remaining text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
      }
      
      return fragment;
    }
  }
  return node;
}

function processNode(node, keywords, effect) {
  if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
    if (node.childNodes && node.childNodes.length) {
      const childNodes = Array.from(node.childNodes);
      childNodes.forEach(childNode => {
        const processedNode = highlightKeywords(childNode, keywords, effect);
        
        if (processedNode !== childNode) {
          if (processedNode instanceof DocumentFragment) {
            node.replaceChild(processedNode, childNode);
          } else {
            node.insertBefore(processedNode, childNode);
            node.removeChild(childNode);
          }
        }
      });
    } else {
      const processedNode = highlightKeywords(node, keywords, effect);
      if (processedNode !== node) {
        if (processedNode instanceof DocumentFragment) {
          node.parentNode.replaceChild(processedNode, node);
        }
      }
    }
  }
}

function main() {
  const tags = ["p", "h1", "h2", "h3", "font", "code", "span", "li"];
  
  chrome.storage.local.get(["keywords", "effect"], ({ keywords, effect }) => {
    if (!keywords || keywords.length === 0) {
      return;
    }

    tags.forEach(tagName => {
      const elements = document.getElementsByTagName(tagName);
      Array.from(elements).forEach(element => {
        processNode(element, keywords, effect);
      });
    });
  });

  // Add global styles
  const style = document.createElement("style");
  style.textContent = `
    .keyword-filtered.blur { 
      background: rgba(0, 0, 0, 0.8); 
      color: transparent; 
      text-shadow: 0 0 5px black; 
      padding: 0 5px; 
      border-radius: 3px; 
    }
    .keyword-filtered.emoji {
      position: relative;
      display: inline-block;
    }
    .keyword-filtered.emoji::after {
      content: '💩';
      position: absolute;
      top: 0;
      left: 0;
    }
  `;
  document.head.appendChild(style);
}

main();
