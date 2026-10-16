/* 受けつがれてきたもの 先生向けの解説 — クライアント側復号（AES-256-GCM / PBKDF2-SHA256） */
(function () {
  "use strict";

  var encEl = document.getElementById("enc");
  if (!encEl) return;
  var enc;
  try { enc = JSON.parse(encEl.textContent); } catch (e) { return; }

  var lock = document.getElementById("lock");
  var form = document.getElementById("lock-form");
  var input = document.getElementById("lock-pass");
  var errEl = document.getElementById("lock-err");
  var mainEl = document.getElementById("content");

  function b64ToBuf(b64) {
    var bin = atob(b64);
    var buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }
  function bufToB64(buf) {
    var bin = "";
    var bytes = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function deriveKey(password) {
    var encoder = new TextEncoder();
    return crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: b64ToBuf(enc.salt), iterations: enc.iter, hash: "SHA-256" },
          base,
          { name: "AES-GCM", length: 256 },
          true,
          ["decrypt"]
        );
      });
  }

  function decryptWith(key) {
    return crypto.subtle.decrypt({ name: "AES-GCM", iv: b64ToBuf(enc.iv) }, key, b64ToBuf(enc.ct))
      .then(function (plain) {
        var payload = JSON.parse(new TextDecoder().decode(plain));
        render(payload);
        return key;
      });
  }

  function render(payload) {
    if (payload.title) document.title = payload.title;
    mainEl.innerHTML = payload.html;
    if (lock) lock.style.display = "none";
    mainEl.style.display = "block";
    document.body.classList.add("unlocked");
    if (location.hash) {
      var t = document.querySelector(location.hash);
      if (t) t.scrollIntoView();
    }
  }

  function cacheKey(key) {
    crypto.subtle.exportKey("raw", key).then(function (raw) {
      try { sessionStorage.setItem("uketsugi_sensei_key", bufToB64(raw)); } catch (e) {}
    });
  }

  function tryCached() {
    var b64;
    try { b64 = sessionStorage.getItem("uketsugi_sensei_key"); } catch (e) { return Promise.reject(); }
    if (!b64) return Promise.reject();
    return crypto.subtle.importKey("raw", b64ToBuf(b64), { name: "AES-GCM" }, true, ["decrypt"])
      .then(decryptWith);
  }

  tryCached().catch(function () {
    if (lock) lock.style.display = "block";
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var pw = (input.value || "").trim();
        if (!pw) return;
        errEl.textContent = "";
        lock.classList.add("busy");
        deriveKey(pw)
          .then(function (key) {
            return decryptWith(key).then(function () { cacheKey(key); });
          })
          .catch(function () {
            lock.classList.remove("busy");
            errEl.textContent = "パスワードが違うようです。もう一度お確かめください。";
            input.select();
          });
      });
      input.focus();
    }
  });
})();
