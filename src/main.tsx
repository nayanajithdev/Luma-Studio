import { CSSProperties, PointerEvent, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ChevronLeft, ChevronRight, Download, Grid2X2, ImagePlus, RotateCcw, SlidersHorizontal, Sparkles, Undo2, Redo2 } from 'lucide-react'
import { renderStyledPhoto } from './color-engine'
import './style.css'
import './pad.css'
import './layout.css'
import './header-layout.css'
import './apple-font.css'
import './wide-layout.css'
import './adjust.css'
import './adjust-grid.css'
import './vignette.css'
import './style-carousel.css'
import './palette-arrows.css'
import './five-style-cards.css'
import './style-arrow-controls.css'
import './style-arrow-center.css'
import './style-snap.css'
import './all-adjustments.css'
import './canvas-photo.css'

type Style = { name: string; tone: number; color: number; palette: number; swatch: string }
const styles: Style[] = [
  { name: 'Cool Rose', tone: 14, color: -24, palette: 25, swatch: 'linear-gradient(135deg,#bbd9ec,#a35b75)' },
  { name: 'Neutral', tone: 0, color: 0, palette: 0, swatch: 'linear-gradient(135deg,#cad5d1,#4e5b5a)' },
  { name: 'Bright', tone: 34, color: 9, palette: 5, swatch: 'linear-gradient(135deg,#fff0c9,#9bc8dd)' },
  { name: 'Rose Gold', tone: 18, color: 21, palette: 28, swatch: 'linear-gradient(135deg,#e8a28d,#a3565a)' },
  { name: 'Gold', tone: 22, color: 27, palette: 36, swatch: 'linear-gradient(135deg,#f4d47e,#a76c29)' },
  { name: 'Amber', tone: 30, color: 34, palette: 44, swatch: 'linear-gradient(135deg,#f2a551,#79381f)' },
  { name: 'Standard', tone: 0, color: 0, palette: 0, swatch: 'linear-gradient(135deg,#b9d4d8,#273c40)' },
  { name: 'Vibrant', tone: 22, color: 42, palette: 10, swatch: 'linear-gradient(135deg,#f1665f,#225fad)' },
  { name: 'Natural', tone: 12, color: 7, palette: 6, swatch: 'linear-gradient(135deg,#e7c7a9,#688e89)' },
  { name: 'Luminous', tone: 38, color: 12, palette: 11, swatch: 'linear-gradient(135deg,#f6f4dd,#7fc7df)' },
  { name: 'Dramatic', tone: 46, color: -9, palette: 0, swatch: 'linear-gradient(135deg,#d6c8b8,#242327)' },
  { name: 'Quiet', tone: -16, color: -18, palette: 0, swatch: 'linear-gradient(135deg,#93a2a3,#465354)' },
  { name: 'Cozy', tone: 8, color: 18, palette: 30, swatch: 'linear-gradient(135deg,#dba36a,#6d4635)' },
  { name: 'Ethereal', tone: 29, color: -12, palette: 8, swatch: 'linear-gradient(135deg,#e1e9ed,#8678a5)' },
  { name: 'Muted B&W', tone: -9, color: -50, palette: 0, swatch: 'linear-gradient(135deg,#d0d0cb,#666562)' },
  { name: 'Stark B&W', tone: 42, color: -50, palette: 0, swatch: 'linear-gradient(135deg,#f5f5f2,#171717)' },
]
const standardIndex = styles.findIndex(style => style.name === 'Standard')
const adjustOptions = ['Exposure', 'Brilliance', 'Highlights', 'Shadows', 'Contrast', 'Brightness', 'Black Point', 'Saturation', 'Vibrance', 'Warmth', 'Tint', 'Sharpness', 'Definition', 'Noise Reduction', 'Vignette']

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [editorTab, setEditorTab] = useState<'styles' | 'adjust'>('styles')
  const [adjustments, setAdjustments] = useState<Record<string, number>>({})
  const [active, setActive] = useState(standardIndex)
  const [tone, setTone] = useState(styles[standardIndex].tone)
  const [color, setColor] = useState(styles[standardIndex].color)
  const [palette, setPalette] = useState(styles[standardIndex].palette)
  const input = useRef<HTMLInputElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const stylePad = useRef<HTMLDivElement>(null)
  const styleStrip = useRef<HTMLDivElement>(null)
  const selectedStyle = styles[active] ?? styles[standardIndex]
  const value = (name: string) => adjustments[name] ?? 0

  useEffect(() => {
    const s = styles[active]
    if (!s) return
    setTone(s.tone)
    setColor(s.color)
    setPalette(s.palette)
  }, [active])
  useEffect(() => { centerStyle(standardIndex, 'auto') }, [])
  useEffect(() => { if (editorTab === 'styles') centerStyle(active, 'auto') }, [editorTab])
  useEffect(() => {
    if (canvas.current && sourceImage) renderStyledPhoto(canvas.current, sourceImage, { style: selectedStyle.name, tone, color, palette, adjustments })
  }, [sourceImage, selectedStyle, tone, color, palette, adjustments])
  function chooseFile(file?: File) {
    if (!file?.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const nextImage = new Image()
    nextImage.onload = () => { setImage(url); setSourceImage(nextImage) }
    nextImage.src = url
    resetToStandard()
    resetAdjustments()
    setEditorTab('styles')
  }
  function resetStyleControls() { setTone(selectedStyle.tone); setColor(selectedStyle.color); setPalette(selectedStyle.palette) }
  function resetToStandard() { const standard = styles[standardIndex]; setActive(standardIndex); setTone(standard.tone); setColor(standard.color); setPalette(standard.palette) }
  function resetAdjustments() { setAdjustments({}) }
  function centerStyle(index: number, behavior: ScrollBehavior = 'smooth') {
    requestAnimationFrame(() => {
      const strip = styleStrip.current
      const card = strip?.children.item(index) as HTMLElement | null
      if (strip && card) strip.scrollTo({ left: card.offsetLeft - strip.clientWidth / 2 + card.offsetWidth / 2, behavior })
    })
  }
  function chooseStyle(index: number) { setActive(index); centerStyle(index) }
  function scrollStyles(direction: number) {
    const strip = styleStrip.current
    const firstCard = strip?.children.item(0) as HTMLElement | null
    if (strip && firstCard) strip.scrollBy({ left: direction * (firstCard.offsetWidth + 12), behavior: 'smooth' })
  }
  function moveStyleDot(event: PointerEvent<HTMLDivElement>) {
    const bounds = stylePad.current?.getBoundingClientRect()
    if (!bounds) return
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width))
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height))
    setColor(Math.round((x - .5) * 100))
    setTone(Math.round((.5 - y) * 100))
  }
  return <main className="app">
    <header>
      <div className="brand"><Sparkles size={17} fill="currentColor" /> LUMA</div>
      <button className="done" onClick={() => input.current?.click()}>Add photo</button>
    </header>
    <div className="content-layout horizontal">
    <section className="workspace">
      <div className={'photo-stage' + (!image ? ' empty' : '') + (image && value('Vignette') !== 0 ? ' has-vignette' : '')} style={{ '--vignette-strength': Math.abs(value('Vignette')) / 55 } as CSSProperties} onClick={() => !image && input.current?.click()}>
        {image ? <canvas ref={canvas} className="photo-canvas" aria-label="Your edited photo" /> : <div className="empty-state"><div className="upload-icon"><ImagePlus size={27}/></div><h1>Your photo, your style.</h1><p>Tap to choose an image and create a look that feels like you.</p><button className="upload-cta">Choose photo</button></div>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={e => chooseFile(e.target.files?.[0])}/>
    </section>
    <section className="editor" aria-label="Photo editor controls">
      <div className="tool-row"><button className="icon-button" aria-label="Undo"><Undo2 size={20}/></button><button className="icon-button muted" aria-label="Redo"><Redo2 size={20}/></button><div className="editor-switch"><button className={editorTab === 'styles' ? 'selected' : ''} onClick={() => setEditorTab('styles')}>Styles</button><button className={editorTab === 'adjust' ? 'selected' : ''} onClick={() => setEditorTab('adjust')}>Adjust</button></div><button className="icon-button" onClick={editorTab === 'styles' ? resetStyleControls : resetAdjustments} aria-label="Reset adjustments"><RotateCcw size={19}/></button><button className="export" onClick={() => alert('Export will be connected in the next step.') }><Download size={17}/> Export</button></div>
      {editorTab === 'styles' ? <>
      <div className="style-carousel"><button className="style-scroll" onClick={() => scrollStyles(-1)} aria-label="Previous styles"><ChevronLeft size={17}/></button><div className="style-strip" ref={styleStrip}>{styles.map((style, index) => <button key={style.name} onClick={() => chooseStyle(index)} className={'style-card ' + (active === index ? 'selected' : '')}><span className="thumbnail" style={{ background: style.swatch }}></span><span>{style.name}</span></button>)}</div><button className="style-scroll" onClick={() => scrollStyles(1)} aria-label="More styles"><ChevronRight size={17}/></button></div>
      <div className="style-pad-wrap">
        <div className="pad-heading"><span>STYLE MAP</span><small>Drag to tune your look</small></div>
        <div className="style-pad" style={{ background: `radial-gradient(circle at 50% 0%,rgba(255,255,255,.18),transparent 52%),${styles[active]?.swatch ?? styles[standardIndex].swatch}` } as CSSProperties} ref={stylePad} onPointerDown={moveStyleDot} onPointerMove={event => { if (event.buttons === 1) moveStyleDot(event) }}>
          <span className="pad-label top">BRIGHT</span><span className="pad-label bottom">RICH</span><span className="pad-label left">COOL</span><span className="pad-label right">WARM</span>
          <span className="crosshair vertical"/><span className="crosshair horizontal"/>
          <span className="style-dot" style={{ left: `${color + 50}%`, top: `${50 - tone}%` }} />
        </div>
      </div>
      <div className="control-card">
        <Control label="Tone" value={tone} setValue={setTone} />
        <Control label="Color" value={color} setValue={setColor} />
        <Control label="Palette" value={palette} setValue={setPalette} min={0} max={100} />
        <button className="reset" onClick={resetStyleControls}><RotateCcw size={15}/> Reset adjustments</button>
      </div>
      </> : <div className="adjust-panel adjust-list">{adjustOptions.map(option => <Control key={option} label={option} value={value(option)} setValue={nextValue => setAdjustments(current => ({ ...current, [option]: nextValue }))} />)}<button className="reset adjust-reset" onClick={resetAdjustments}><RotateCcw size={15}/> Reset all adjustments</button></div>}
      <nav className="tabbar"><button className={editorTab === 'styles' ? 'active' : ''} onClick={() => setEditorTab('styles')}><Grid2X2 size={20}/><span>Styles</span></button><button className={editorTab === 'adjust' ? 'active' : ''} onClick={() => setEditorTab('adjust')}><SlidersHorizontal size={20}/><span>Adjust</span></button><button onClick={() => input.current?.click()}><ImagePlus size={20}/><span>Photo</span></button></nav>
    </section>
    </div>
  </main>
}
function Control({ label, value, setValue, min = -50, max = 50 }: { label: string; value: number; setValue: (value: number) => void; min?: number; max?: number }) {
 return <label className="control"><span><b>{label}</b><em>{value > 0 ? '+' : ''}{value}</em></span><input type="range" min={min} max={max} value={value} onChange={e => setValue(+e.target.value)} /></label>
}
export default App

createRoot(document.getElementById('root')!).render(<App />)
