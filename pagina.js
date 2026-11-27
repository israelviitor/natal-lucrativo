function checkoutUrl(destination, search) {
  const url = new URL(destination);
  if (url.protocol !== "https:" || url.hostname !== "pay.cakto.com.br") {
    throw new Error("Link de checkout da Cakto inválido");
  }

  const received = new URLSearchParams(search);
  for (const key of new Set(received.keys())) {
    if (!key.startsWith("utm_") && !["src", "sck", "fbclid"].includes(key)) continue;
    url.searchParams.delete(key);
    for (const value of received.getAll(key)) url.searchParams.append(key, value);
  }
  return url.href;
}

const config = window.ceiaConfig;
for (const link of document.querySelectorAll("[data-plano]")) {
  const destination = config.checkout[link.dataset.plano];
  if (!destination) continue;
  try {
    link.href = checkoutUrl(destination, location.search);
    link.removeAttribute("aria-disabled");
  } catch (error) {
    console.error(error.message);
  }
}

if (/^\d+$/.test(config.metaPixelId)) {
  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.push = fbq;
    window.fbq = window._fbq = fbq;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.append(script);
  }
  window.fbq("init", config.metaPixelId);
  window.fbq("track", "PageView");
  window.fbq("track", "ViewContent");
}
