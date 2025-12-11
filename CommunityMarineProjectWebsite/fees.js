/* ========================= FULL FEES.JS — WORKING VERSION ========================= */
document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Header scroll ---------- */
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (header) {
      window.scrollY > 50
        ? header.classList.add("scrolled")
        : header.classList.remove("scrolled");
    }
  });

  /* ---------- Sidebar ---------- */
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeBtn");
  hamburger?.addEventListener("click", () => sidebar?.classList.add("active"));
  closeBtn?.addEventListener("click", () =>
    sidebar?.classList.remove("active")
  );
  window.addEventListener("click", (e) => {
    if (
      sidebar &&
      hamburger &&
      !sidebar.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      sidebar.classList.remove("active");
    }
  });

  /* ---------- Modal & payment elements ---------- */
  const modal = document.getElementById("paymentModal");
  const closeModalBtn = modal?.querySelector(".close");
  const feeAmountField = document.getElementById("feeAmount");
  const payButtons = document.querySelectorAll(".pay-btn");
  const methods = document.querySelectorAll(".method");
  const forms = document.querySelectorAll(".payment-form");

  const mpesaForm = document.getElementById("mpesaForm");
  const completeBtn = document.getElementById("completePayment");

  /* ---------- Open modal and set amount ---------- */
  payButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name || "Payment";
      const rawAmount = btn.dataset.amount || "0";
      const numericAmount = rawAmount.replace(/[^\d]/g, "");

      // Fill hidden M-Pesa inputs
      const mpesaAmountInput = document.getElementById("mpesaAmount");
      const mpesaDescInput = document.getElementById("mpesaDescription");
      if (mpesaAmountInput) mpesaAmountInput.value = numericAmount;
      if (mpesaDescInput) mpesaDescInput.value = name;

      if (feeAmountField) feeAmountField.textContent = rawAmount;

      // Show modal
      if (modal) modal.style.display = "block";

      // Show correct payment method
      if (rawAmount.includes("KES")) {
        methods.forEach((m) => m.classList.remove("active"));
        document.querySelector(".method[data-method='mpesa']")?.classList.add("active");
        forms.forEach((f) => f.classList.remove("show"));
        document.getElementById("mpesa")?.classList.add("show");
        if (completeBtn) completeBtn.style.display = "none";
      } else {
        methods.forEach((m) => m.classList.remove("active"));
        document.querySelector(".method[data-method='card']")?.classList.add("active");
        forms.forEach((f) => f.classList.remove("show"));
        document.getElementById("card")?.classList.add("show");
        if (completeBtn) completeBtn.style.display = "inline-block";
      }
    });
  });

  /* ---------- Close modal ---------- */
  if (closeModalBtn)
    closeModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  window.addEventListener("click", (e) => {
    if (modal && e.target === modal) modal.style.display = "none";
  });

  /* ---------- Method switching ---------- */
  methods.forEach((method) => {
    method.addEventListener("click", () => {
      methods.forEach((m) => m.classList.remove("active"));
      method.classList.add("active");
      forms.forEach((f) => f.classList.remove("show"));
      document.getElementById(method.dataset.method)?.classList.add("show");

      if (method.dataset.method === "mpesa") {
        if (completeBtn) completeBtn.style.display = "none";
      } else {
        if (completeBtn) completeBtn.style.display = "inline-block";
      }
    });
  });

  /* ---------- Wallet / QR features ---------- */
  document.querySelectorAll(".viewQRBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = document.getElementById("qrImage");
      if (img) img.src = btn.getAttribute("data-qr");
      const qrModal = document.getElementById("qrModal");
      if (qrModal) qrModal.style.display = "flex";
    });
  });
  document.querySelectorAll(".downloadQRBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = btn.getAttribute("data-qr");
      a.download = "qr-code.png";
      a.click();
    });
  });
  document.querySelectorAll(".copyWalletBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.parentElement.querySelector(".walletText")?.innerText || "";
      navigator.clipboard.writeText(text);
      alert("Copied: " + text);
    });
  });

  /* ---------- M-PESA PAYMENT ---------- */
  async function payNow(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();

  function findValue(selectors) {
    for (const s of selectors) {
      const el = document.getElementById(s) || document.querySelector(`.${s}`) || document.querySelector(`[name="${s}"]`);
      if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          if (el.value && el.value.trim() !== '') return el.value.trim();
        } else if (el.dataset && el.dataset.amount) {
          return el.dataset.amount;
        } else if (el.textContent && el.textContent.trim() !== '') {
          return el.textContent.trim();
        }
      }
    }
    return null;
  }

  const phoneRaw = findValue(['mpesaPhone', 'phone', 'mpesa-phone', 'mpesa_phone']) || '';
  let amountRaw =
    findValue([
      'mpesaAmount',
      'mpesa-amount',
      'amount',
      'feeAmount',
      'selectedAmount',
      'selectedFeeAmount',
      'mpesaAmountDisplay',
    ]) || '';

  const description =
    findValue(['mpesaDescription', 'description', 'mpesa-description']) || 'Conservation fee';

  const pm = document.getElementById('paymentModal');
  if ((!amountRaw || amountRaw === '') && pm && pm.dataset && pm.dataset.amount) {
    amountRaw = pm.dataset.amount;
  }

  const normalizePhone = (p) => {
    if (!p) return '';
    let digits = p.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('07')) digits = '254' + digits.slice(1);
    if (digits.length === 9 && digits.startsWith('7')) digits = '254' + digits;
    if (digits.length === 12 && digits.startsWith('254')) digits = digits;
    return digits;
  };

  const phone = normalizePhone(phoneRaw);
  if (!/^(?:2547\d{8})$/.test(phone)) {
    alert('Please enter a valid M-Pesa phone number (e.g. 2547XXXXXXXX or 07XXXXXXXX).');
    const phoneEl = document.getElementById('mpesaPhone') || document.querySelector('[name="phone"]');
    if (phoneEl && typeof phoneEl.focus === 'function') phoneEl.focus();
    return;
  }

  const amount = Number(String(amountRaw).replace(/[^0-9.]/g, ''));
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    alert('Unable to determine a valid amount for M-Pesa STK push. Please select a fee or try again.');
    return;
  }

  if (!confirm(`Send M-Pesa STK push to ${phone} for KES ${amount}?`)) return;

  const endpoint = 'mpesaapi/stkpush.php';
  const formData = new FormData();
  formData.append('phone', phone);
  formData.append('amount', String(amount));
  formData.append('description', description);

  try {
    alert('Sending STK push request...');
    const resp = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });

    // Read body ONCE
    const text = await resp.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      data = null;
    }

    if (!resp.ok) {
      console.error('STK push server error', resp.status, text);
      // show server response if available
      const serverMsg = text ? text : `HTTP ${resp.status}`;
      alert(`Server error while sending STK push: ${serverMsg}`);
      return;
    }

    // Success (200-299)
    if (data && typeof data === 'object') {
      if (data.success === true || data.status === 'success' || data.received === true) {
        alert(data.message || 'STK push sent. Check your phone for the prompt.');
      } else {
        const msg = data.message || data.error || JSON.stringify(data);
        alert(`STK push failed: ${msg}`);
      }
    } else {
      // Non-JSON success response - basic heuristic
      if (text && /success|ok|initiated|stk/i.test(text)) {
        alert('STK push appears to have been sent. Check your phone.');
      } else {
        alert(text || 'STK push returned success but no readable message.');
      }
    }
  } catch (err) {
    console.error('Error sending STK push request:', err);
    alert('Could not send STK push. Network or server error occurred. See console for details.');
  }
}

// Ensure function is globally available if HTML uses onclick="payNow()"
window.payNow = payNow;

  /* ---------- EmailJS receipt ---------- */
  if (completeBtn) {
    completeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!window.emailjs) return alert("EmailJS not loaded!");

      const name = document.querySelector('#crypto input[name="name"]')?.value || "";
      const email = document.querySelector('#crypto input[type="email"]')?.value || "";
      const phone = document.querySelector('#crypto input[type="text"]')?.value || "";
      const wallet = document.querySelector('#crypto input[placeholder="Enter wallet address"]')?.value || "";
      const amountDisplay = document.getElementById("feeAmount")?.innerText || "Not specified";
      const payment_method = document.querySelector(".method.active span")?.innerText || "Not specified";

      const templateParams = {
        name,
        user_email: email,
        user_phone: phone,
        wallet_address: wallet,
        amount: amountDisplay,
        payment_method,
      };

      try {
        await emailjs.send("service_slre5e5", "template_t1zq6di", templateParams);
        alert("Receipt sent! Check your email.");
      } catch (err) {
        console.error("EmailJS error:", err);
        alert("Failed to send receipt.");
      }
    });
  }
});
