const container = document.getElementById("items");


function render(items) {

    container.innerHTML = "";

    items.forEach((item, index) => {

        container.innerHTML += `
            <div>
                <input 
                    id="name-${index}"
                    value="${item.name}"
                    placeholder="Name"
                />

                <input
                    id="url-${index}"
                    value="${item.url}"
                    placeholder="URL"
                    style="width:400px"
                />

                <button onclick="remove(${index})">
                    Delete
                </button>
            </div>
        `;

    });

}


async function load() {

    const data = await chrome.storage.local.get("urls");

    render(
        data.urls || []
    );

}


document.getElementById("add")
.onclick = () => {

    chrome.storage.local.get("urls", data => {

        const urls = data.urls || [];

        urls.push({
            name:"",
            url:""
        });

        render(urls);

    });

};


document.getElementById("save")
.onclick = () => {

    const inputs = container.querySelectorAll("input");

    const urls = [];

    for(let i=0;i<inputs.length;i+=2){

        urls.push({
            name: inputs[i].value,
            url: inputs[i+1].value
        });

    }


    chrome.storage.local.set({
        urls
    });

};


function remove(index){

    chrome.storage.local.get("urls", data=>{

        const urls=data.urls || [];

        urls.splice(index,1);

        render(urls);

    });

}


load();