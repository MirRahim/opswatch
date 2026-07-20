async function check() {

    const data = await chrome.storage.local.get("urls");
    const urls = data.urls || [];

    let failedCount = 0;

    for (const item of urls) {

        try {

            const response = await fetch(item.url, { cache: "no-store" });
            item.status = response.ok ? "up" : "down";

        } catch (e) {

            item.status = "down";

        }

        if (item.status === "down") failedCount++;

    }

    await chrome.storage.local.set({ urls, lastCheck: new Date().toISOString() });

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
