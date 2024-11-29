let highlightedElement = null;
let isSelecting = false;

function generateSelector_(element) {
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

function generateSelector(element) {
    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    } else if (element.className) {
        return `${element.nodeName.toLowerCase()}.${Array.from(element.classList).map(CSS.escape).join('.')}`;
    } else {
        return element.nodeName.toLowerCase();
    }
}

function generateOptimalSelector(element) {
    if (!(element instanceof Element)) return;

    // Если у элемента есть ID, используем его
    if (element.id) {
        return `#${CSS.escape(element.id)}`;
    }

    // Функция для проверки уникальности селектора
    const isUnique = (selector) => document.querySelectorAll(selector).length === 1;

    // Получаем классы элемента, исключая динамические и служебные
    const getRelevantClasses = (el) => {
        return Array.from(el.classList)
            .filter(cls => 
                !cls.startsWith('js-') && 
                !cls.includes('active') && 
                !cls.includes('selected') &&
                !cls.match(/^(ng-|v-|react-)/)
            );
    };

    const classes = getRelevantClasses(element);
    const tag = element.nodeName.toLowerCase();

    // Пробуем использовать комбинацию тега и классов
    if (classes.length > 0) {
        const classSelector = `${tag}.${classes.map(CSS.escape).join('.')}`;
        if (isUnique(classSelector)) {
            return classSelector;
        }

        // Пробуем каждый класс отдельно с тегом
        for (const cls of classes) {
            const selector = `${tag}.${CSS.escape(cls)}`;
            if (isUnique(selector)) {
                return selector;
            }
        }
    }

    // Ищем ближайшего родителя с ID или уникальным классом
    let parent = element.parentElement;
    let path = [tag];
    let maxParents = 3; // Ограничиваем глубину поиска

    while (parent && maxParents > 0) {
        if (parent.id) {
            return `#${CSS.escape(parent.id)} > ${path.join(' > ')}`;
        }

        const parentClasses = getRelevantClasses(parent);
        const parentTag = parent.nodeName.toLowerCase();

        if (parentClasses.length > 0) {
            const parentSelector = `${parentTag}.${parentClasses.map(CSS.escape).join('.')}`;
            if (isUnique(parentSelector)) {
                return `${parentSelector} > ${path.join(' > ')}`;
            }
        }

        // Добавляем nth-child только если есть одинаковые соседние элементы
        let siblings = Array.from(parent.children).filter(child => 
            child.nodeName.toLowerCase() === path[0].split(':')[0]
        );

        if (siblings.length > 1) {
            const index = siblings.indexOf(element) + 1;
            path[0] = `${path[0]}:nth-child(${index})`;
        }

        path.unshift(parentTag);
        element = parent;
        parent = parent.parentElement;
        maxParents--;
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
    
    const selector = generateOptimalSelector(e.target);
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
    console.log('Received message:', message);
    if (message.type === 'START_SELECTING') {
        console.log('Starting selecting');
        startSelecting();
        sendResponse({ success: true });
    } else if (message.type === 'STOP_SELECTING') {
        console.log('Stopping selecting');
        stopSelecting();
        sendResponse({ success: true });
    } else if (message.type === 'GET_ELEMENT_INFO') {
        console.log('GET_ELEMENT_INFO received:', message);
        try {
            const element = document.querySelector(message.selector);
            console.log('Found element:', element);
            
            if (element) {
                console.log('Element found, attempting to retrieve text or attribute value');
                let text;
                if (message.valueAttribute || message.nameAttribute) {
                    const attribute = message.valueAttribute || message.nameAttribute;
                    console.log('Attempting to retrieve attribute:', attribute);
                    text = element.getAttribute(attribute);
                    console.log('Attribute value:', text);
                } else {
                    console.log('No attribute specified, attempting to retrieve text content');
                    if (element.value !== undefined && element.value !== '') {
                        text = element.value;
                    } else if (element.textContent) {
                        text = element.textContent.trim();
                    } else if (element.innerText) {
                        text = element.innerText.trim();
                    } else {
                        text = element.innerHTML.trim();
                    }
                    console.log('Text content:', text);
                }
                
                const isLink = element.tagName.toLowerCase() === 'a';
                const href = isLink ? element.href : null;
                
                console.log('Preparing response');
                const response = { 
                    success: true, 
                    text: text,
                    isLink: isLink,
                    href: href
                };
                console.log('Sending response:', response);
                sendResponse(response);
            } else {
                console.log('Element not found');
                sendResponse({ success: false });
            }
        } catch (error) {
            console.error('Error in GET_ELEMENT_INFO:', error);
            sendResponse({ success: false });
        }
    } else if (message.type === 'TEST_SELECTOR') {
        try {
            console.log('TEST_SELECTOR received:', message);
            const elements = document.querySelectorAll(message.selector);
            console.log('Found elements:', elements);
            const results = Array.from(elements).map(el => ({
                text: el.textContent.trim(),
                attributes: Array.from(el.attributes).reduce((acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                }, {})
            }));
            console.log('Sending response:', results);
            sendResponse({ success: true, results });
        } catch (error) {
            console.error('Error in TEST_SELECTOR:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    return true;
});
