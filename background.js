const TIMEOUT_MS = 5000;

async function check() {

    const data = await chrome.storage.local.get(["urls", "notifiedDown"]);
    const urls = data.urls || [];
    const notifiedDown = data.notifiedDown || {};

    let failedCount = 0;

    for (const item of urls) {

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        const start = Date.now();

        try {

            const response = await fetch(item.url, {
                cache: "no-store",
                signal: controller.signal
            });

            clearTimeout(timer);
            item.responseTime = Date.now() - start;
            item.statusCode = response.status;
            item.status = response.ok ? "up" : "down";

        } catch (e) {

            clearTimeout(timer);
            item.responseTime = null;
            item.statusCode = e.name === "AbortError" ? "TIMEOUT" : "ERROR";
            item.status = "down";

        }

        if (item.status === "down") {

            failedCount++;

            if (!notifiedDown[item.url]) {

                const detail = item.statusCode === "TIMEOUT"
                    ? "Request timed out."
                    : `Returned ${item.statusCode}.`;

                chrome.notifications.create(`down-${item.url}`, {
                    type: "basic",
                    iconUrl: "icons/icon48.png",
                    title: `Down: ${item.name || item.url}`,
                    message: detail
                });

                notifiedDown[item.url] = true;

            }

        } else {

            if (notifiedDown[item.url]) {

                chrome.notifications.create(`up-${item.url}`, {
                    type: "basic",
                    iconUrl: "icons/icon48.png",
                    title: `Recovered: ${item.name || item.url}`,
                    message: `Back up in ${item.responseTime}ms.`
                });

            }

            delete notifiedDown[item.url];

        }

    }

    await chrome.storage.local.set({
        urls,
        notifiedDown,
        lastCheck: new Date().toISOString()
    });

    if (failedCount === 0) {

        chrome.action.setBadgeText({ text: "" });

    } else {

        chrome.action.setBadgeText({ text: failedCount.toString() });
        chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });

    }

}


async function rescheduleAlarm() {

    const data = await chrome.storage.local.get("intervalMinutes");
    const minutes = data.intervalMinutes || 1;

    await chrome.alarms.clear("health");
    chrome.alarms.create("health", { periodInMinutes: minutes });

}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.action === "checkNow") {
        check().then(() => sendResponse({ ok: true }));
        return true;
    }

    if (msg.action === "reschedule") {
        rescheduleAlarm().then(() => sendResponse({ ok: true }));
        return true;
    }

});


chrome.runtime.onInstalled.addListener(() => {

    check();
    rescheduleAlarm();

});


chrome.runtime.onStartup.addListener(() => {

    check();
    rescheduleAlarm();

});


chrome.alarms.onAlarm.addListener((alarm) => {

    if (alarm.name === "health") check();

});
