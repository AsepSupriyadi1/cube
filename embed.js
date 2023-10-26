(async () => {
  const el = document.querySelector(".vev-embed") || document.currentScript;
  let basePath = el.getAttribute("src").replace("embed.js", "");
  if (basePath && !basePath.endsWith("/")) basePath += "/";

  const a = document.createElement("div");
  a.className = "vev";
  a.attachShadow({ mode: "open" });
  const b = a.shadowRoot || a;

  const id = "page-" + Date.now();
  b.innerHTML = '<div class="vev" data-path="' + id + '"></div>';

  if (document.head.contains(document.currentScript)) {
    setTimeout(() => document.body.prepend(a));
  } else {
    document.currentScript.after(a);
  }

  const res = await fetch(basePath + "index.html");
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  let manifest = JSON.parse(
    doc.querySelector("script[type='text/vev']").innerHTML
  );

  const currentPage = manifest.pages.find(
    (p) => p.key === manifest.route.pageKey
  );

  if (!currentPage.index) {
    basePath = basePath.replace("/" + currentPage.path, "");
  }

  manifest = JSON.parse(
    JSON.stringify(manifest).replaceAll(
      currentPage.index ? "assets/" : "../assets/",
      basePath + "assets/"
    )
  );
  manifest.embed = true;
  manifest.host = basePath || "/";
  manifest.resolveIndex = true;
  manifest.replaceAssetsPaths = true;

  (window.vevs || (window.vevs = {}))[id] = manifest;

  const createStyleElement = (text) => {
    const el = document.createElement("style");
    el.innerText = text.replaceAll(
      currentPage.index ? "assets/" : "../assets/",
      basePath + "assets/"
    );
    return el;
  };

  doc.querySelectorAll(".vev-style").forEach((css) => {
    const a = createStyleElement(css.innerText);
    b.appendChild(a);
    const c = createStyleElement(css.innerText);
    document.head.appendChild(c);
  });

  doc.querySelectorAll(".vev-dep").forEach((s) => {
    const a = document.createElement("script");
    a.src = basePath + "assets/" + s.src.split("/").slice(-1).join();
    (document.body || document.head).appendChild(a);
  });
})();