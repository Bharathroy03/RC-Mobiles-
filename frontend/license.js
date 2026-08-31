/**
 * RC Mobiles ERP — Premium License Management System
 * Hreeem Softech Solutions | www.hreeem.com
 */

const LICENSE_STORAGE_KEY = "rcm_license_data";
const LOCKED_MODULES = ["inventory", "mobiles", "accessories"];

// ─────────────────────────────────────────────────
// CORE LICENSE FUNCTIONS
// ─────────────────────────────────────────────────

function getLicenseData() {
    try {
        const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function isLicenseActive() {
    const data = getLicenseData();
    return !!(data && data.active && data.license_key);
}

function getLicensePlan() {
    const data = getLicenseData();
    return data ? (data.plan_name || "Advanced") : null;
}

function clearLicense() {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
}

// ─────────────────────────────────────────────────
// ACTIVATE LICENSE (calls backend)
// ─────────────────────────────────────────────────

async function activateLicenseKey(rawKey) {
    const cleanKey = rawKey.trim().toUpperCase();
    if (!cleanKey) throw new Error("Please enter a license key.");
    if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(cleanKey)) {
        throw new Error("Invalid format. Use XXXX-XXXX-XXXX-XXXX.");
    }

    const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: cleanKey })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error || "Activation failed. Please try again.");
    }

    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify({
        active: true,
        license_key: data.license_key,
        plan_name: data.plan_name,
        activated_at: data.activated_at
    }));

    return data;
}

// ─────────────────────────────────────────────────
// SIDEBAR: Apply lock badges
// ─────────────────────────────────────────────────

function applyLicenseSidebar() {
    const licensed = isLicenseActive();
    const plan = getLicensePlan();

    document.querySelectorAll("[data-license-guard]").forEach(el => {
        const guard = el.getAttribute("data-license-guard");
        const isLocked = LOCKED_MODULES.some(m => guard === m);
        if (!isLocked) return;

        if (licensed) {
            el.removeAttribute("style");
            el.removeAttribute("onclick");
            const lockBadge = el.querySelector(".lic-lock-badge");
            if (lockBadge) lockBadge.remove();
            const lockIcon = el.querySelector(".lic-lock-icon");
            if (lockIcon) lockIcon.remove();
            let planBadge = el.querySelector(".lic-pro-badge");
            if (!planBadge) {
                planBadge = document.createElement("span");
                planBadge.className = "lic-pro-badge ml-auto text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200";
                el.appendChild(planBadge);
            }
            planBadge.textContent = "✓ PRO";
        } else {
            const origHref = el.getAttribute("href");
            if (origHref) el.setAttribute("data-original-href", origHref);
            el.removeAttribute("href");
            el.style.cursor = "pointer";
            el.onclick = (e) => { e.preventDefault(); openLicenseModal(); };
            el.setAttribute("title", "Advanced License Required — Click to Activate");

            let lockIcon = el.querySelector(".lic-lock-icon");
            if (!lockIcon) {
                lockIcon = document.createElement("span");
                lockIcon.className = "lic-lock-icon material-symbols-outlined text-[14px] text-amber-500 ml-0.5 align-middle";
                lockIcon.textContent = "lock";
                const labelEl = el.querySelector("span.text-sm");
                if (labelEl) labelEl.appendChild(lockIcon);
            }

            let badge = el.querySelector(".lic-lock-badge");
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "lic-lock-badge ml-auto text-[9px] font-black px-1.5 py-0.5 rounded text-white shadow-sm";
                badge.style.background = "linear-gradient(135deg,#f59e0b,#ea580c)";
                badge.textContent = "PRO";
                el.appendChild(badge);
            }
        }
    });
}

// ─────────────────────────────────────────────────
// ACTIVATION MODAL
// ─────────────────────────────────────────────────

function openLicenseModal() {
    let modal = document.getElementById("licenseActivationModal");
    if (modal) {
        modal.classList.remove("hidden");
        setTimeout(() => document.getElementById("licKeyInput")?.focus(), 80);
        return;
    }
    _renderLicenseModal();
    setTimeout(() => document.getElementById("licKeyInput")?.focus(), 80);
}

function closeLicenseModal() {
    const modal = document.getElementById("licenseActivationModal");
    if (modal) modal.classList.add("hidden");
}

function _renderLicenseModal() {
    const modal = document.createElement("div");
    modal.id = "licenseActivationModal";
    modal.className = "fixed inset-0 z-[10000] flex items-center justify-center p-4";
    modal.style.cssText = "background:rgba(0,0,0,0.78);backdrop-filter:blur(6px);";

    modal.innerHTML = `
      <div id="licModalCard" style="font-family:'Plus Jakarta Sans',Inter,sans-serif;border-radius:24px;overflow:hidden;max-width:440px;width:100%;box-shadow:0 25px 60px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%);padding:36px 32px 28px;text-align:center;position:relative;">
          <button onclick="closeLicenseModal()" style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.1);border:none;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.7);" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">
            <span class="material-symbols-outlined" style="font-size:18px;">close</span>
          </button>
          <div style="width:72px;height:72px;border-radius:20px;background:linear-gradient(135deg,#f59e0b,#ea580c);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 24px rgba(245,158,11,0.4);">
            <span class="material-symbols-outlined" style="color:white;font-size:36px;">workspace_premium</span>
          </div>
          <h2 style="color:white;font-size:20px;font-weight:800;margin:0 0 6px;">Advanced License Required</h2>
          <p style="color:#94a3b8;font-size:13px;margin:0;">Unlock Inventory, Mobile Stock &amp; Accessories</p>
        </div>

        <!-- What You Unlock -->
        <div style="background:#f8fafc;padding:16px 28px;border-bottom:1px solid #e2e8f0;">
          <p style="font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 10px;">What's Included</p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
            ${[["inventory_2","Inventory"],["smartphone","Mobiles"],["headphones","Accessories"]].map(([icon,label])=>`
              <div style="background:white;border-radius:12px;padding:10px 8px;text-align:center;border:1px solid #e2e8f0;">
                <span class="material-symbols-outlined" style="color:#f59e0b;font-size:22px;display:block;margin-bottom:4px;">${icon}</span>
                <p style="font-size:10px;font-weight:800;color:#1e293b;margin:0;">${label}</p>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Form -->
        <div style="background:white;padding:24px 28px;">
          <label style="display:block;font-size:11px;font-weight:800;color:#334155;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Product Activation Key</label>
          <div style="position:relative;">
            <span class="material-symbols-outlined" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:20px;">vpn_key</span>
            <input
              id="licKeyInput"
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              maxlength="19"
              oninput="formatLicenseKeyInput(this)"
              style="width:100%;box-sizing:border-box;padding:13px 14px 13px 40px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;font-family:monospace;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:0.12em;outline:none;transition:border-color 0.2s;"
              onfocus="this.style.borderColor='#f59e0b';this.style.boxShadow='0 0 0 3px rgba(245,158,11,0.15)'"
              onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"
            >
          </div>
          <div id="licKeyError" style="display:none;margin-top:8px;padding:8px 12px;background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">
            <p id="licKeyErrorMsg" style="margin:0;font-size:11px;font-weight:600;color:#dc2626;display:flex;align-items:center;gap:6px;">
              <span class="material-symbols-outlined" style="font-size:14px;">error</span>
              <span id="licKeyErrorText"></span>
            </p>
          </div>

          <!-- Activate -->
          <button
            id="licActivateBtn"
            onclick="handleLicenseActivation()"
            style="width:100%;margin-top:16px;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#0f172a,#1e3a5f);color:white;font-size:14px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.1s,box-shadow 0.2s;box-shadow:0 4px 14px rgba(15,23,42,0.3);"
            onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 20px rgba(15,23,42,0.4)'"
            onmouseout="this.style.transform='';this.style.boxShadow='0 4px 14px rgba(15,23,42,0.3)'"
            onmousedown="this.style.transform='scale(0.98)'"
            onmouseup="this.style.transform='translateY(-1px)'"
          >
            <span class="material-symbols-outlined" style="font-size:20px;">verified</span>
            Activate License
          </button>

          <!-- Contact Row -->
          <div style="display:flex;gap:8px;margin-top:10px;">
            <a href="https://wa.me/918453036381?text=Hi%2C+I+need+an+RC+Mobiles+ERP+Advanced+License." target="_blank"
              style="flex:1;padding:10px;border-radius:10px;border:2px solid #d1fae5;background:#f0fdf4;color:#059669;font-size:11px;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;"
              onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">
              <span class="material-symbols-outlined" style="font-size:14px;">chat</span> WhatsApp Vendor
            </a>
            <a href="mailto:support@hreeem.com?subject=RC+Mobiles+License+Request"
              style="flex:1;padding:10px;border-radius:10px;border:2px solid #dbeafe;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:700;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px;transition:background 0.2s;"
              onmouseover="this.style.background='#dbeafe'" onmouseout="this.style.background='#eff6ff'">
              <span class="material-symbols-outlined" style="font-size:14px;">mail</span> Email Support
            </a>
          </div>

          <p style="text-align:center;font-size:10px;color:#94a3b8;margin-top:14px;">
            Hreeem Softech Solutions &bull; <a href="https://www.hreeem.com" target="_blank" style="color:#60a5fa;">www.hreeem.com</a> &bull; WA: 8453036381
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeLicenseModal(); });
}

function formatLicenseKeyInput(input) {
    let val = input.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    let formatted = "";
    for (let i = 0; i < val.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) formatted += "-";
        formatted += val[i];
    }
    input.value = formatted;
    const errEl = document.getElementById("licKeyError");
    if (errEl) errEl.style.display = "none";
}

async function handleLicenseActivation() {
    const input = document.getElementById("licKeyInput");
    const btn = document.getElementById("licActivateBtn");
    if (!input || !btn) return;

    const key = input.value.trim();
    if (!key) { showLicenseError("Please enter your activation key."); return; }

    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;animation:spin 1s linear infinite;">refresh</span> Validating...`;

    try {
        const result = await activateLicenseKey(key);
        btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;">check_circle</span> License Activated! Reloading...`;
        btn.style.background = "linear-gradient(135deg,#059669,#047857)";
        btn.style.boxShadow = "0 4px 14px rgba(5,150,105,0.4)";
        setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
        showLicenseError(err.message || "Activation failed.");
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;">verified</span> Activate License`;
        btn.style.background = "linear-gradient(135deg,#0f172a,#1e3a5f)";
        btn.style.boxShadow = "0 4px 14px rgba(15,23,42,0.3)";
    }
}

function showLicenseError(msg) {
    const errEl = document.getElementById("licKeyError");
    const errText = document.getElementById("licKeyErrorText");
    if (errEl && errText) {
        errText.textContent = msg;
        errEl.style.display = "block";
    }
}

// ─────────────────────────────────────────────────
// FULL-PAGE LOCK SCREEN (for restricted pages)
// ─────────────────────────────────────────────────

function guardLicensedPage(pageTitle, pageIcon) {
    if (isLicenseActive()) return;

    // Hide all main content immediately
    document.querySelectorAll("main, #sideNav, #mobileNavBackdrop").forEach(el => {
        if (el) el.style.display = "none";
    });

    const lockScreen = document.createElement("div");
    lockScreen.id = "fullPageLockScreen";
    lockScreen.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);font-family:'Plus Jakarta Sans',Inter,sans-serif;overflow:auto;";

    lockScreen.innerHTML = `
      <style>
        @keyframes lockPulse { 0%{transform:scale(1);opacity:0.05;} 100%{transform:scale(1.4);opacity:0.08;} }
        @keyframes lockSpin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .lock-float { animation: lockPulse 3s ease-in-out infinite alternate; }
      </style>

      <!-- Ambient Glows -->
      <div class="lock-float" style="position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,#f59e0b,transparent);top:10%;left:15%;pointer-events:none;"></div>
      <div class="lock-float" style="position:absolute;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,#3b82f6,transparent);bottom:15%;right:10%;pointer-events:none;animation-delay:1.5s;"></div>

      <!-- Lock Card -->
      <div style="position:relative;z-index:10;text-align:center;max-width:480px;width:100%;">
        <!-- Lock Icon -->
        <div style="display:flex;justify-content:center;margin-bottom:24px;">
          <div style="width:96px;height:96px;border-radius:28px;background:linear-gradient(135deg,#f59e0b,#ea580c);display:flex;align-items:center;justify-content:center;box-shadow:0 16px 48px rgba(245,158,11,0.4);">
            <span class="material-symbols-outlined" style="color:white;font-size:52px;">lock</span>
          </div>
        </div>

        <span style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:#f59e0b;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:10px;">
          <span class="material-symbols-outlined" style="font-size:14px;">workspace_premium</span>
          Advanced License Required
        </span>

        <h1 style="color:white;font-size:clamp(24px,5vw,36px);font-weight:900;margin:0 0 12px;font-family:'Outfit','Plus Jakarta Sans',sans-serif;">
          ${pageIcon} ${pageTitle}
        </h1>

        <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;max-width:380px;margin-left:auto;margin-right:auto;">
          This module is part of the <strong style="color:#f59e0b;">RC Mobiles Advanced Plan</strong>.
          Activate your license key to unlock full access to all premium modules.
        </p>

        <!-- Feature Pills -->
        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:32px;">
          ${[["inventory_2","Inventory"],["smartphone","Mobile Stock"],["headphones","Accessories"],["delete_sweep","Bulk Delete"],["branding_watermark","Brand Tools"]].map(([icon,label])=>`
            <span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:11px;font-weight:700;color:#cbd5e1;border:1px solid #334155;background:rgba(30,41,59,0.8);">
              <span class="material-symbols-outlined" style="font-size:14px;color:#f59e0b;">${icon}</span>${label}
            </span>
          `).join("")}
        </div>

        <!-- CTA Button -->
        <button
          onclick="openLicenseModal()"
          style="display:inline-flex;align-items:center;gap:10px;padding:16px 36px;border-radius:16px;border:none;background:linear-gradient(135deg,#f59e0b,#ea580c);color:white;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 8px 28px rgba(245,158,11,0.4);transition:transform 0.15s,box-shadow 0.2s;"
          onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 36px rgba(245,158,11,0.5)'"
          onmouseout="this.style.transform='';this.style.boxShadow='0 8px 28px rgba(245,158,11,0.4)'"
          onmousedown="this.style.transform='scale(0.97)'"
          onmouseup="this.style.transform='translateY(-2px)'"
        >
          <span class="material-symbols-outlined" style="font-size:22px;">vpn_key</span>
          Enter Activation Key
        </button>

        <!-- Secondary Actions -->
        <div style="display:flex;justify-content:center;gap:10px;margin-top:14px;flex-wrap:wrap;">
          <a href="https://wa.me/918453036381?text=Hi%2C+I+need+an+Advanced+License+for+RC+Mobiles+ERP." target="_blank"
            style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:12px;border:1px solid #166534;background:rgba(22,101,52,0.3);color:#4ade80;font-size:12px;font-weight:700;text-decoration:none;transition:background 0.2s;"
            onmouseover="this.style.background='rgba(22,101,52,0.5)'" onmouseout="this.style.background='rgba(22,101,52,0.3)'">
            <span class="material-symbols-outlined" style="font-size:16px;">chat</span> WhatsApp Vendor
          </a>
          <a href="index.html"
            style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:12px;border:1px solid #334155;background:rgba(30,41,59,0.8);color:#94a3b8;font-size:12px;font-weight:700;text-decoration:none;transition:background 0.2s;"
            onmouseover="this.style.background='rgba(51,65,85,0.8)'" onmouseout="this.style.background='rgba(30,41,59,0.8)'">
            <span class="material-symbols-outlined" style="font-size:16px;">arrow_back</span> Back to Billing
          </a>
        </div>

        <p style="color:#475569;font-size:10px;margin-top:28px;">
          Powered by Hreeem Softech Solutions &bull;
          <a href="https://www.hreeem.com" target="_blank" style="color:#60a5fa;text-decoration:none;">www.hreeem.com</a>
          &bull; WA: 8453036381
        </p>
      </div>
    `;

    document.body.insertBefore(lockScreen, document.body.firstChild);
}

// ─────────────────────────────────────────────────
// AUTO-INIT
// ─────────────────────────────────────────────────

function _licenseInit() {
    setTimeout(applyLicenseSidebar, 120);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _licenseInit);
} else {
    _licenseInit();
}
