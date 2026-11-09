"use client";

import { useEffect } from "react";

/**
 * Tells the parent page (Lovable, axarat.com) how tall this page really is,
 * so the iframe can be sized to fit and never shows a scrollbar of its own.
 *
 * Why the `data-embedded` attribute: the layout uses `h-full` on <html>,
 * `min-h-full` on <body> and `min-h-screen` on the page. Inside an iframe,
 * "screen" is the iframe itself, so body.scrollHeight could never drop below
 * the iframe's current height. The height would grow but never shrink.
 * globals.css lifts those minimums only when the page is embedded, so the
 * standalone page looks exactly as before.
 */
export default function IframeHeight() {
  useEffect(() => {
    if (window.parent === window) return; // not embedded: nothing to report

    document.documentElement.dataset.embedded = "1";

    let last = 0;
    const sendHeight = () => {
      const height = Math.ceil(document.body.scrollHeight);
      if (height === last) return; // avoid flooding the parent with repeats
      last = height;
      window.parent.postMessage({ type: "axarat-iframe-height", height }, "*");
    };

    sendHeight();
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);
    // Web fonts change line heights after first paint.
    document.fonts?.ready.then(sendHeight).catch(() => {});

    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.embedded;
    };
  }, []);

  return null;
}
