export function getSpotifyEmbedUrl(
  input: string,
  options: { autoplay?: boolean } = {}
): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let embed: string | null = null;

  if (/open\.spotify\.com\/embed\//.test(trimmed)) {
    try {
      embed = new URL(trimmed).toString();
    } catch {
      embed = trimmed;
    }
  } else {
    const uri = trimmed.match(
      /^spotify:(track|album|playlist|episode|show):([a-zA-Z0-9]+)/i
    );
    if (uri) {
      embed = `https://open.spotify.com/embed/${uri[1].toLowerCase()}/${uri[2]}`;
    } else {
      const web = trimmed.match(
        /open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/i
      );
      if (web) {
        embed = `https://open.spotify.com/embed/${web[1].toLowerCase()}/${web[2]}`;
      }
    }
  }

  if (!embed) return null;
  if (!options.autoplay) return embed;

  try {
    const url = new URL(embed);
    url.searchParams.set("autoplay", "1");
    return url.toString();
  } catch {
    return embed.includes("?") ? `${embed}&autoplay=1` : `${embed}?autoplay=1`;
  }
}
