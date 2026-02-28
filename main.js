let enabled = true;
browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'toggle') enabled = !enabled;
    return Promise.resolve({ enabled });
});
function listener(details) {
    if (!enabled) return {};
    if (!details.responseHeaders) return {};

    for (let i = 0; i < details.responseHeaders.length; i++) {
        if (details.responseHeaders[i].name.toLowerCase() === 'cache-control') {
            details.responseHeaders[i].value = 'public, max-age=3600';
            break;
        }
    }

    details.responseHeaders = details.responseHeaders.filter(
        header => header.name.toLowerCase() !== 'pragma'
    );
    console.log(details.responseHeaders)
    return { responseHeaders: details.responseHeaders };
}

browser.webRequest.onHeadersReceived.addListener(
    listener,
    { urls: ['*://*/*'], types: ['main_frame'] },
    ['blocking', 'responseHeaders']
);