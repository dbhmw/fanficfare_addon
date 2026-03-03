let enabled = false;
redirect_url = ''
browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'toggle') enabled = !enabled;
    return Promise.resolve({ enabled });
});

function listener_req(details) {
    if (!enabled || !details.url) return {};
    console.log(`Internal: ${details.url}`);
    const b64_url = new URL(details.url).pathname.slice(1)
    redirect_url = atob(b64_url)
    console.log(`Loading: ${redirect_url}`);

    browser.webRequest.onHeadersReceived.addListener(
        listener_res,
        { urls: ['*://*/*'], types: ['main_frame'] },
        ['blocking', 'responseHeaders']
    );

    return {
        redirectUrl:
        redirect_url,
    };
}

function listener_res(details) {
    console.log(`Got: ${details.url}`);
    if ((details.url !== redirect_url) || !details.responseHeaders) {
        return {};
    }

    if (details.statusCode >= 300 && details.statusCode < 400) {
        const location = details.responseHeaders.find(h => h.name.toLowerCase() === 'location');
        if (location) {
            redirect_url = location.value;
            console.log(`Following redirect to: ${redirect_url}`);
        }
        return {};
    }
    redirect_url = ''
    browser.webRequest.onHeadersReceived.removeListener(listener_res);

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

browser.webRequest.onBeforeRequest.addListener(
    listener_req,
    { urls: ['*://fanficfare.internal/*'], types: ['main_frame'] },
    ['blocking']
);