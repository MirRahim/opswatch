console.log("Background Loaded");

// const URL = "https://api2.optime-ai.com/health";
async function check() {

    const data = await chrome.storage.local.get("urls");

    const urls = data.urls || [];


    for (const item of urls) {

        try {

            const response = await fetch(item.url);

            console.log(
                item.name,
                response.status
            );

        }
        catch(e){

            console.log(
                item.name,
                "DOWN"
            );

        }

    }

}

async function setHealthyStatus(healthyCount, failedCount) {

    if (failedCount === 0) {

        chrome.action.setBadgeText({
            text: ""
        });

    }
    else {

        chrome.action.setBadgeText({
            text: failedCount.toString()
        });

        chrome.action.setBadgeBackgroundColor({
            color: "#ff0000"
        });

    }

}


async function check() {

    console.log("Checking...");

    try {

        const response = await fetch(URL, {
            cache: "no-store"
        });


        const data = await response.json();

        console.log("Health:", data);
        chrome.storage.local.set({
            health: data,
            lastCheck: new Date().toISOString()
        });


        const failedChecks = data.checks
            ? data.checks.filter(x => x.status !== "Healthy")
            : [];


        const isHealthy =
            response.ok &&
            data.status === "Healthy" &&
            failedChecks.length === 0;


        if (isHealthy) {

            console.log("Everything is OK");

            await setHealthyStatus(
                data.checks?.length ?? 0,
                0
            );

        }
        else {

            console.log(
                "Failed services:",
                failedChecks
            );

            await setHealthyStatus(
                data.checks?.length ?? 0,
                failedChecks.length
            );

        }


    }
    catch (e) {

        console.error("Health check failed:", e);


        chrome.action.setBadgeText({
            text: "!"
        });


        chrome.action.setBadgeBackgroundColor({
            color: "#ff0000"
        });

    }

}



chrome.runtime.onInstalled.addListener(() => {

    console.log("Installed");

    check();


    chrome.alarms.create("health", {
        periodInMinutes: 1
    });

});



chrome.runtime.onStartup.addListener(() => {

    check();

});



chrome.alarms.onAlarm.addListener((alarm) => {

    if (alarm.name === "health") {

        check();

    }

});