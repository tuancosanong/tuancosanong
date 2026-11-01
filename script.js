(function () {
  "use strict";
  var doc = document;
  var dialog = doc.getElementById("contact-dialog");
  var dialogValue = doc.getElementById("dialog-value");
  var dialogOpen = doc.getElementById("dialog-open");
  var copyBtn = doc.getElementById("copy-contact");
  var toast = doc.getElementById("toast");
  var toastTimer;

  doc.getElementById("year").textContent = new Date().getFullYear();

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2300);
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve, reject) {
      try {
        var field = doc.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.cssText = "position:fixed;opacity:0;left:-9999px";
        doc.body.appendChild(field);
        field.select();
        var copied = doc.execCommand("copy");
        doc.body.removeChild(field);
        copied ? resolve() : reject();
      } catch (error) { reject(error); }
    });
  }

  function openContactSheet(value, href) {
    dialogValue.textContent = value;
    dialogOpen.href = href;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      window.location.href = href;
    }
  }

  // Trình duyệt tích hợp (Facebook, Zalo, Instagram, TikTok, Messenger, WebView...)
  var ua = navigator.userAgent || "";
  var inApp = /FBAN|FBAV|FB_IAB|Instagram|Zalo|Line\/|musical_ly|BytedanceWebview|TikTok|Messenger|; wv\)/i.test(ua) ||
    (/iPhone|iPad|iPod/.test(ua) && !/Safari/i.test(ua));

  if (inApp) {
    doc.querySelectorAll("[data-kind]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        openContactSheet(link.dataset.copy, link.href);
      });
    });
  }

  copyBtn.addEventListener("click", function () {
    copyText(dialogValue.textContent).then(function () {
      notify("Đã sao chép: " + dialogValue.textContent);
    }).catch(function () {
      notify("Không thể tự sao chép. Hãy nhấn giữ số để sao chép.");
    });
  });
  doc.getElementById("close-dialog").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  // ---------- QR Code + chia sẻ danh thiếp ----------
  var pageUrl = "https://tuancosanong.vercel.app";
  var qrBox = doc.getElementById("qrcode");
  function buildQR() {
    if (typeof QRCode === "undefined") return false;
    new QRCode(qrBox, { text: pageUrl, width: 180, height: 180, colorDark: "#0a4a0a", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    return true;
  }
  window.addEventListener("load", function () { if (!buildQR()) qrBox.textContent = "Không tải được mã QR"; });

  doc.getElementById("share-btn").addEventListener("click", function () {
    var data = { title: "Huỳnh Minh Tuấn – Mật Ong Rừng Nguyên Chất", text: "Danh thiếp Huỳnh Minh Tuấn – Mật Ong Rừng Nguyên Chất", url: pageUrl };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else {
      copyText(pageUrl).then(function () { notify("Đã sao chép liên kết danh thiếp"); })
        .catch(function () { notify("Không thể sao chép liên kết"); });
    }
  });

  doc.getElementById("vcard-btn").addEventListener("click", function () {
    var vcf = ["BEGIN:VCARD", "VERSION:3.0", "FN:Huỳnh Minh Tuấn", "N:Huỳnh;Minh Tuấn;;;",
      "ORG:Mật Ong Rừng Nguyên Chất", "TEL;TYPE=CELL:+84915462127",
      "URL:" + pageUrl, "URL:https://www.facebook.com/tuan.ta.768991", "URL:https://www.youtube.com/@tuancosanong", "URL:https://www.tiktok.com/@tuanta239",
      "END:VCARD"].join("\r\n");
    var url = URL.createObjectURL(new Blob([vcf], { type: "text/vcard;charset=utf-8" }));
    var a = doc.createElement("a");
    a.href = url; a.download = "Huynh-Minh-Tuan.vcf";
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    notify("Đang tải danh bạ (.vcf)");
  });

  // ---------- Video YouTube ----------
  // Cách chèn: viết [video]https://www.youtube.com/embed/MÃ_VIDEO[/video] trong <div class="video">
  // Trang hiện ảnh bìa video; bấm vào ảnh là phát video ngay tại chỗ.
  var playIcon = '<svg viewBox="0 0 68 48" aria-hidden="true"><path d="M66.5 7.7A8.5 8.5 0 0 0 60.5 2C55.2.7 34 .7 34 .7S12.8.7 7.5 2a8.5 8.5 0 0 0-6 5.7C.2 13 .2 24 .2 24s0 11 1.3 16.3A8.5 8.5 0 0 0 7.5 46c5.3 1.3 26.500 1.300 26.500 1.300s21.200 0 26.500-1.300a8.5 8.5 0 0 0 6-5.700C67.800 35 67.800 24 67.800 24s0-11-1.300-16.300z" fill="#f03"/><path d="m27 34 18-10-18-10z" fill="#fff"/></svg>';
  var videoTag = /\[video\]\s*(?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([\w-]+)[^\[]*\[\/video\]/i;

  doc.querySelectorAll(".video").forEach(function (box) {
    var match = videoTag.exec(box.textContent);
    if (!match) return;
    var id = match[1];
    var heading = box.closest(".product") && box.closest(".product").querySelector("h3");
    var title = "Video " + (heading ? heading.textContent : "YouTube");

    var button = doc.createElement("button");
    button.type = "button";
    button.className = "video-facade";
    button.setAttribute("aria-label", "Phát " + title);
    button.innerHTML = '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy" decoding="async"><span class="play">' + playIcon + '</span>';

    button.addEventListener("click", function () {
      var frame = doc.createElement("iframe");
      frame.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      frame.title = title;
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.setAttribute("frameborder", "0");
      frame.allowFullscreen = true;
      box.replaceChild(frame, button);
    });

    box.textContent = "";
    box.appendChild(button);
  });
})();
