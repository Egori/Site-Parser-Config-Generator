chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'ELEMENT_SELECTED') {
        chrome.runtime.sendMessage({
            type: 'UPDATE_SELECTOR',
            data: message.data
        });
    }
    return true;
});
