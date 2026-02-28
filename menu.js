const btn = document.getElementById('toggle');

browser.runtime.sendMessage({ type: 'getState' }).then(({ enabled }) => {
    btn.textContent = enabled ? 'Enabled' : 'Disabled';
});

btn.addEventListener('click', () => {
    browser.runtime.sendMessage({ type: 'toggle' }).then(({ enabled }) => {
        btn.textContent = enabled ? 'Enabled' : 'Disabled';
    });
});