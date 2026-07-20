// Tab switching
document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const name = tab.dataset.tab;
      document.getElementById("panel-status").style.display = name === "status" ? "block" : "none";
      document.getElementById("panel-config").style.display  = name === "config"  ? "block" : "none";
      if (name === "config") renderConfig();
    });
  });
  
  // ── Status panel ──────────────────────────────────────────
  
  async function renderStatus() {
    const data = await chrome.storage.local.get(["urls", "lastCheck"]);
    const urls = data.urls || [];
    const list = document.getElementById("service-list");
    const dot  = document.getElementById("header-dot");
    const lc   = document.getElementById("last-check");
  
    if (data.lastCheck) {
      lc.textContent = "Updated " + new Date(data.lastCheck).toLocaleTimeString();
    }
  
    if (urls.length === 0) {
      list.innerHTML = `<div class="empty">No services yet.<br><a id="go-config">Add one in Configure →</a></div>`;
      document.getElementById("go-config").onclick = () => {
        document.querySelector('[data-tab="config"]').click();
      };
      return;
    }
  
    const hasDown = urls.some(u => u.status === "down");
    dot.className = "logo-dot" + (hasDown ? " has-down" : "");
  
    list.innerHTML = urls.map(u => {
      const s = u.status || "unknown";
      return `
        <div class="service-row">
          <div class="status-dot ${s}"></div>
          <div class="service-name">${u.name || u.url}</div>
          <div class="service-url">${u.url}</div>
          <div class="badge ${s}">${s.toUpperCase()}</div>
        </div>
      `;
    }).join("");
  }
  
  document.getElementById("check-now").onclick = async () => {
    const btn = document.getElementById("check-now");
    btn.textContent = "Checking…";
    btn.disabled = true;
    await chrome.runtime.sendMessage({ action: "checkNow" });
    await new Promise(r => setTimeout(r, 1200));
    await renderStatus();
    btn.textContent = "Check now";
    btn.disabled = false;
  };
  
  // ── Config panel ──────────────────────────────────────────
  
  let configItems = [];
  
  async function renderConfig() {
    const data = await chrome.storage.local.get(["urls", "intervalMinutes"]);
    configItems = (data.urls || []).map(u => ({ ...u }));
    document.getElementById("interval-select").value = data.intervalMinutes || 1;
    drawConfigRows();
  }
  
  function drawConfigRows() {
    const container = document.getElementById("config-rows");
    container.innerHTML = configItems.map((item, i) => `
      <div class="config-row">
        <input class="inp-name" placeholder="Name" value="${item.name}" data-i="${i}" data-field="name">
        <input class="inp-url"  placeholder="https://…" value="${item.url}"  data-i="${i}" data-field="url">
        <button class="btn-icon" data-del="${i}" title="Remove">✕</button>
      </div>
    `).join("");
  
    container.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("input", e => {
        configItems[e.target.dataset.i][e.target.dataset.field] = e.target.value;
      });
    });
  
    container.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", e => {
        configItems.splice(Number(e.target.dataset.del), 1);
        drawConfigRows();
      });
    });
  }
  
  document.getElementById("btn-add").onclick = () => {
    configItems.push({ name: "", url: "", status: "unknown" });
    drawConfigRows();
    const inputs = document.querySelectorAll(".inp-name");
    if (inputs.length) inputs[inputs.length - 1].focus();
  };
  
  document.getElementById("btn-save").onclick = async () => {
    const filtered = configItems.filter(u => u.url.trim());
    const intervalMinutes = parseFloat(document.getElementById("interval-select").value);
  
    await chrome.storage.local.set({ urls: filtered, intervalMinutes });
    await chrome.runtime.sendMessage({ action: "reschedule" });
    await chrome.runtime.sendMessage({ action: "checkNow" });
  
    const msg = document.getElementById("save-msg");
    msg.textContent = "Saved!";
    setTimeout(() => msg.textContent = "", 2000);
  };
  
  // ── Init ──────────────────────────────────────────────────
  renderStatus();
  