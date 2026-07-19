console.log(chrome.storage);
chrome.storage.local.get("health", (result) => {

    const container = document.getElementById("result");

    if (!result.health) {

        container.innerHTML = "No data";

        return;
    }


    const health = result.health;


    let html = `
        <div>
            Status:
            ${health.status}
        </div>
        <hr>
    `;


    health.checks.forEach(item => {

        html += `
            <div>
                ${item.status === "Healthy" ? "🟢" : "🔴"}
                ${item.name}
            </div>
        `;

    });


    container.innerHTML = html;

});