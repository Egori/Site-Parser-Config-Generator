let highlightedElement = null;
let isSelecting = false;

function generateSelector(element) {
    if (!(element instanceof Element)) return;
    
    let path = [];
    while (element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.nodeName.toLowerCase();
        if (element.id) {
            selector += '#' + CSS.escape(element.id);
            path.unshift(selector);
            break;
        } else {
            let sibling = element;
            let nth = 1;
            while (sibling.previousElementSibling) {
                sibling = sibling.previousElementSibling;
                if (sibling.nodeName.toLowerCase() === selector) nth++;
            }
            if (nth > 1) selector += `:nth-of-type(${nth})`;
        }
        path.unshift(selector);
        element = element.parentNode;
    }
    return path.join(' > ');
}

function highlightElement(element) {
    if (highlightedElement) {
        highlightedElement.style.outline = '';
    }
    if (element) {
        element.style.outline = '2px solid #2196F3';
    }
    highlightedElement = element;
}

function handleMouseOver(e) {
    if (!isSelecting) return;
    e.stopPropagation();
    highlightElement(e.target);
}

function handleClick(e) {
    if (!isSelecting) return;
    e.preventDefault();
    e.stopPropagation();
    
    const selector = generateSelector(e.target);
    const elementText = e.target.textContent.trim();
    
    chrome.runtime.sendMessage({
        type: 'ELEMENT_SELECTED',
        data: {
            selector: selector,
            text: elementText,
            attributes: Array.from(e.target.attributes).reduce((acc, attr) => {
                acc[attr.name] = attr.value;
                return acc;
            }, {})
        }
    });
    
    stopSelecting();
}

function startSelecting() {
    isSelecting = true;
    document.body.style.cursor = 'crosshair';
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('click', handleClick, true);
}

function stopSelecting() {
    isSelecting = false;
    document.body.style.cursor = '';
    if (highlightedElement) {
        highlightedElement.style.outline = '';
        highlightedElement = null;
    }
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('click', handleClick, true);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_SELECTING') {
        startSelecting();
        sendResponse({ success: true });
    } else if (message.type === 'STOP_SELECTING') {
        stopSelecting();
        sendResponse({ success: true });
    } else if (message.type === 'TEST_SELECTOR') {
        try {
            const elements = document.querySelectorAll(message.selector);
            const results = Array.from(elements).map(el => ({
                text: el.textContent.trim(),
                attributes: Array.from(el.attributes).reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                }, {})
            }));
            sendResponse({ success: true, results });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }
    return true;
});
