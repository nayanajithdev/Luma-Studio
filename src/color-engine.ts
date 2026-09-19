export type ColorSettings = {
  style: string
  tone: number
  color: number
  palette: number
  adjustments: Record<string, number>
}

type Profile = { contrast: number; saturation: number; warmth: number; shadow: number; highlight: number; sky: number; green: number; skin: number }

const profiles: Record<string, Profile> = {
  'Cool Rose': { contrast: .06, saturation: .05, warmth: .02, shadow: .08, highlight: .02, sky: .16, green: -.04, skin: .08 },
  Neutral: { contrast: 0, saturation: 0, warmth: 0, shadow: 0, highlight: 0, sky: 0, green: 0, skin: 0 },
  Bright: { contrast: .02, saturation: .04, warmth: .02, shadow: .06, highlight: .12, sky: .03, green: .02, skin: .03 },
  'Rose Gold': { contrast: .07, saturation: .08, warmth: .16, shadow: .02, highlight: .08, sky: -.03, green: -.06, skin: .14 },
  Gold: { contrast: .1, saturation: .1, warmth: .22, shadow: .04, highlight: .1, sky: -.07, green: -.08, skin: .18 },
  Amber: { contrast: .14, saturation: .13, warmth: .3, shadow: -.02, highlight: .12, sky: -.1, green: -.1, skin: .2 },
  Standard: { contrast: 0, saturation: 0, warmth: 0, shadow: 0, highlight: 0, sky: 0, green: 0, skin: 0 },
  Vibrant: { contrast: .12, saturation: .26, warmth: .01, shadow: .03, highlight: .05, sky: .12, green: .14, skin: .03 },
  Natural: { contrast: .04, saturation: .05, warmth: .02, shadow: .02, highlight: .03, sky: .02, green: .03, skin: .04 },
  Luminous: { contrast: -.03, saturation: .06, warmth: -.01, shadow: .13, highlight: .18, sky: .05, green: .01, skin: .04 },
  Dramatic: { contrast: .28, saturation: -.08, warmth: -.02, shadow: -.16, highlight: .1, sky: -.05, green: -.04, skin: -.02 },
  Quiet: { contrast: -.08, saturation: -.18, warmth: -.02, shadow: .05, highlight: -.02, sky: -.04, green: -.08, skin: -.03 },
  Cozy: { contrast: .06, saturation: .04, warmth: .17, shadow: .04, highlight: .05, sky: -.04, green: -.02, skin: .12 },
  Ethereal: { contrast: -.04, saturation: -.08, warmth: -.03, shadow: .12, highlight: .15, sky: .1, green: -.06, skin: .02 },
  'Muted B&W': { contrast: .08, saturation: -1, warmth: 0, shadow: .02, highlight: .03, sky: 0, green: 0, skin: 0 },
  'Stark B&W': { contrast: .32, saturation: -1, warmth: 0, shadow: -.12, highlight: .12, sky: 0, green: 0, skin: 0 },
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const smoothstep = (edge0: number, edge1: number, x: number) => { const t = clamp((x - edge0) / (edge1 - edge0)); return t * t * (3 - 2 * t) }

function applySaturation(r: number, g: number, b: number, amount: number) {
  const l = r * .2126 + g * .7152 + b * .0722
  return [l + (r - l) * amount, l + (g - l) * amount, l + (b - l) * amount]
}

export function renderStyledPhoto(canvas: HTMLCanvasElement, image: HTMLImageElement, settings: ColorSettings) {
  const longestSide = 1800
  const scale = Math.min(1, longestSide / Math.max(image.naturalWidth, image.naturalHeight))
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const frame = context.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = frame
  const profile = profiles[settings.style] ?? profiles.Standard
  const adjustment = (name: string) => settings.adjustments[name] ?? 0
  const paletteStrength = .55 + settings.palette / 220
  const globalExposure = (settings.tone + adjustment('Exposure') + adjustment('Brightness')) / 260
  const globalSaturation = 1 + settings.color / 125 + adjustment('Saturation') / 115 + adjustment('Vibrance') / 170
  const globalContrast = adjustment('Contrast') / 180 + adjustment('Black Point') / 230 + adjustment('Definition') / 280
  const warmth = adjustment('Warmth') / 260
  const tint = adjustment('Tint') / 330

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255; let g = data[i + 1] / 255; let b = data[i + 2] / 255
    const max = Math.max(r, g, b); const min = Math.min(r, g, b)
    const luma = r * .2126 + g * .7152 + b * .0722
    const chroma = max - min
    const highlight = smoothstep(.58, .96, luma)
    const shadow = 1 - smoothstep(.06, .45, luma)
    const skin = smoothstep(.04, .38, r - b) * smoothstep(.01, .27, r - g) * smoothstep(.14, .85, luma) * smoothstep(.03, .45, chroma)
    const sky = smoothstep(.04, .45, b - r) * smoothstep(.02, .26, b - g) * smoothstep(.2, .95, luma)
    const vegetation = smoothstep(.03, .3, g - r) * smoothstep(.01, .25, g - b) * smoothstep(.06, .55, chroma)
    const localExposure = globalExposure + shadow * profile.shadow * paletteStrength + highlight * profile.highlight * paletteStrength
    const contrast = 1 + profile.contrast * paletteStrength + globalContrast
    r = (r - .5) * contrast + .5 + localExposure
    g = (g - .5) * contrast + .5 + localExposure
    b = (b - .5) * contrast + .5 + localExposure
    const saturation = Math.max(0, globalSaturation + profile.saturation * paletteStrength + sky * profile.sky + vegetation * profile.green + skin * profile.skin * .2)
    ;[r, g, b] = applySaturation(r, g, b, saturation)
    const localWarmth = profile.warmth * paletteStrength + warmth + skin * profile.skin * .35 - sky * profile.sky * .2
    r += localWarmth + tint * .45; g += tint * -.15; b -= localWarmth + tint * .35
    if (profile.saturation <= -.95) {
      const mono = r * .2126 + g * .7152 + b * .0722
      r = mono; g = mono; b = mono
    }
    data[i] = Math.round(clamp(r) * 255); data[i + 1] = Math.round(clamp(g) * 255); data[i + 2] = Math.round(clamp(b) * 255)
  }
  context.putImageData(frame, 0, 0)
}
