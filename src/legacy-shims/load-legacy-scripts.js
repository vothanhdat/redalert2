const LEGACY_SCRIPT_ATTR = "data-legacy-url";

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[${LEGACY_SCRIPT_ATTR}="${url}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.setAttribute(LEGACY_SCRIPT_ATTR, url);
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load legacy script ${url}`));
    document.head.appendChild(script);
  });
}

export function loadLegacyScriptsSequential(urls) {
  return urls.reduce((promise, url) => promise.then(() => loadScript(url)), Promise.resolve());
}
