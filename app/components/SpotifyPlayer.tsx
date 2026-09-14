"use client";

import { useEffect, useRef } from "react";

type EmbedController = {
  play: () => void;
  addListener: (event: string, cb: () => void) => void;
};

type SpotifyIframeApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: string },
    callback: (controller: EmbedController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let iframeApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (iframeApiPromise) return iframeApiPromise;

  iframeApiPromise = new Promise((resolve) => {
    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      previous?.(api);
      resolve(api);
    };

    if (!document.querySelector("script[data-spotify-iframe-api]")) {
      const script = document.createElement("script");
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.dataset.spotifyIframeApi = "true";
      document.body.appendChild(script);
    }
  });

  return iframeApiPromise;
}

function embedUrlToUri(embedUrl: string): string | null {
  const match = embedUrl.match(
    /\/embed\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/i
  );
  return match ? `spotify:${match[1].toLowerCase()}:${match[2]}` : null;
}

export function SpotifyPlayer({
  embedUrl,
  autoplay = false,
}: {
  embedUrl: string;
  autoplay?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoplay) return;
    const uri = embedUrlToUri(embedUrl);
    if (!uri || !hostRef.current) return;

    let cancelled = false;
    const host = hostRef.current;

    loadSpotifyIframeApi().then((api) => {
      if (cancelled || !host) return;
      host.replaceChildren();
      const mount = document.createElement("div");
      host.appendChild(mount);
      api.createController(
        mount,
        { uri, width: "100%", height: "152" },
        (controller) => {
          controller.addListener("ready", () => {
            if (!cancelled) controller.play();
          });
        }
      );
    });

    return () => {
      cancelled = true;
      host.replaceChildren();
    };
  }, [autoplay, embedUrl]);

  if (autoplay) {
    return (
      <div
        ref={hostRef}
        className="min-h-[152px] overflow-hidden rounded-xl"
      />
    );
  }

  return (
    <iframe
      title="Spotify"
      src={embedUrl}
      width="100%"
      height="152"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="rounded-xl border-0"
    />
  );
}
