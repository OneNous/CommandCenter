/** Defaults aligned with `design-mobile` `MOBILE_DEFAULTS` / v77 ArtSky. */
export const DESKTOP_SKY_DEFAULTS = {
  skyTheme: 'cerulean' as const,
  skySpeed: 62,
  skyZoom: 40,
  skyWarp: 235,
  skyWind: 144,
  skyFbm: 91,
  skyBlur: 127,
  skyGrain: 14,
  blackVeil: 0,
}

export function buildArtSkyProps(
  d: typeof DESKTOP_SKY_DEFAULTS & { skyThemeOverride?: string },
) {
  return {
    theme: d.skyThemeOverride ?? d.skyTheme,
    speed: d.skySpeed / 100,
    zoom: d.skyZoom / 100,
    warpPower: d.skyWarp / 1000,
    windSpeed: d.skyWind / 1000,
    fbmStrength: d.skyFbm / 100,
    blurRadius: d.skyBlur / 100,
    grainStrength: d.skyGrain / 1000,
    blackVeil: d.blackVeil / 100,
  }
}
