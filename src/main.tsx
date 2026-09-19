import { useEffect, useRef, useState } from 'react'
import { Download, Grid2X2, ImagePlus, RotateCcw, SlidersHorizontal, Sparkles, Undo2, Redo2 } from 'lucide-react'
import './style.css'

type Style = { name: string; tone: number; color: number; palette: number; swatch: string }
const styles: Style[] = [
  { name: 'Original', tone: 0, color: 0, palette: 0, swatch: 'linear-gradient(135deg,#b9d4d8,#273c40)' },
  { name: 'Natural', tone: 16, color: 8, palette: 8, swatch: 'linear-gradient(135deg,#e7c7a9,#688e89)' },
  { name: 'Vivid', tone: 28, color: 35, palette: 22, swatch: 'linear-gradient(135deg,#f1655c,#235eaa)' },
  { name: 'Warm', tone: 20, color: 26, palette: 35, swatch: 'linear-gradient(135deg,#f3a15d,#8b3232)' },
  { name: 'Cool', tone: 10, color: -22, palette: -32, swatch: 'linear-gradient(135deg,#8dd6ec,#404ca3)' },
  { name: 'Dramatic', tone: 48, color: -8, palette: 0, swatch: 'linear-gradient(135deg,#d6c8b8,#242327)' },
]

function App() {
  const [image, setImage] = useState<string | null>(null)
  const [active, setActive] = useState(1)
  const [tone, setTone] = useState(styles[1].tone)
  const [color, setColor] = useState(styles[1].color)
  const [palette, setPalette] = useState(styles[1].palette)
  const input = useRef<HTMLInputElement>(null)
  const filter = `contrast(${1 + tone / 170}) saturate(${1 + color / 120}) sepia(${Math.max(0, palette) / 180}) hue-rotate(${Math.min(0, palette) * 0.45}deg)`

  useEffect(() => { const s = styles[active]; setTone(s.tone); setColor(s.color); setPalette(s.palette) }, [active])
  function chooseFile(file?: File) { if (file?.type.startsWith('image/')) setImage(URL.createObjectURL(file)) }
  function reset() { setActive(0); setTone(0); setColor(0); setPalette(0) }
  return <main className="app">
    <header>
      <button className="word-button">Cancel</button>
      <div className="brand"><Sparkles size={17} fill="currentColor" /> LUMA</div>
      <button className="done" onClick={() => input.current?.click()}>Add photo</button>
    </header>
    <section className="workspace">
      <div className={'photo-stage' + (!image ? ' empty' : '')} onClick={() => !image && input.current?.click()}>
        {image ? <img src={image} style={{ filter }} alt="Your selected photo" /> : <div className="empty-state"><div className="upload-icon"><ImagePlus size={27}/></div><h1>Your photo, your style.</h1><p>Tap to choose an image and create a look that feels like you.</p><button className="upload-cta">Choose photo</button></div>}
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={e => chooseFile(e.target.files?.[0])}/>
    </section>
    <section className="editor" aria-label="Photo editor controls">
      <div className="tool-row"><button className="icon-button" aria-label="Undo"><Undo2 size={20}/></button><button className="icon-button muted" aria-label="Redo"><Redo2 size={20}/></button><span className="section-title">STYLES</span><button className="icon-button" onClick={reset} aria-label="Reset adjustments"><RotateCcw size={19}/></button><button className="export" onClick={() => alert('Export will be connected in the next step.') }><Download size={17}/> Export</button></div>
      <div className="style-strip">{styles.map((style, index) => <button key={style.name} onClick={() => setActive(index)} className={'style-card ' + (active === index ? 'selected' : '')}><span className="thumbnail" style={{ background: style.swatch }}></span><span>{style.name}</span></button>)}</div>
      <div className="control-card">
        <Control label="Tone" value={tone} setValue={setTone} />
        <Control label="Color" value={color} setValue={setColor} />
        <Control label="Palette" value={palette} setValue={setPalette} />
        <button className="reset" onClick={reset}><RotateCcw size={15}/> Reset adjustments</button>
      </div>
      <nav className="tabbar"><button className="active"><Grid2X2 size={20}/><span>Styles</span></button><button><SlidersHorizontal size={20}/><span>Adjust</span></button><button onClick={() => input.current?.click()}><ImagePlus size={20}/><span>Photo</span></button></nav>
    </section>
  </main>
}
function Control({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) {
 return <label className="control"><span><b>{label}</b><em>{value > 0 ? '+' : ''}{value}</em></span><input type="range" min="-50" max="50" value={value} onChange={e => setValue(+e.target.value)} /></label>
}
export default App
