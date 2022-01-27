import {
  Component,
  createEffect,
  createSignal,
  Index,
  on,
  onCleanup,
  onMount,
} from 'solid-js'
import styles from './App.module.css'
import { Renderer } from './braille'
import { Grid } from './grid'

const App: Component = () => {
  const braille = Renderer()

  const [size, setSize] = createSignal(30)
  let [cellSize, setCellSize] = createSignal(20)

  const map = (r: number, c: number) => {
    let i = r * size() + c
    return +!(i % 2 && i % 7)
  }
  const [grid, setGrid] = createSignal(Grid(size(), true, map), {
    equals: false,
  })

  const all = () => braille.renderText(grid().cells.map((_) => _.map(() => 1)))

  let [text, setText] = createSignal('')
  const render = () => setText(braille.renderText(grid().cells))

  let interval: number | undefined
  const play = () => {
    if (interval) return
    interval = setInterval(() => {
      grid().next()
      render()
    }, 60)
  }
  const stop = () => {
    clearInterval(interval)
    interval = undefined
  }

  createEffect(render)
  createEffect(() => setGrid(Grid(size(), true, map)))
  let rect: DOMRect

  let last: string
  const handlePointer = (
    e: PointerEvent,
    i: number | ((v: number) => number) = (v) => +!v
  ) => {
    e.preventDefault()
    const x = e.x - rect.x,
      y = e.y - rect.y
    const c = ~~(x / cellSize()),
      r = ~~(y / cellSize())
    if (last === `${r}-${c}` && down()) return
    last = `${r}-${c}`
    grid().setCell(r, c, i)
    setGrid(grid())
  }

  let [down, setDown] = createSignal(false)

  createEffect((l) => {
    if (down() && typeof interval === 'number') {
      stop()
      return true
    } else if (l) {
      play()
    }
  })

  const resetDown = () => setDown(false)
  let ctrl = false
  const key = (e: KeyboardEvent) => (ctrl = e.ctrlKey)
  onMount(() => {
    addEventListener('keydown', key)
    addEventListener('keyup', key)
    addEventListener('pointercancel', resetDown)
    addEventListener('pointerup', resetDown)
  })
  onCleanup(() => {
    removeEventListener('keydown', key)
    removeEventListener('keyup', key)
    removeEventListener('pointercancel', resetDown)
    removeEventListener('pointerup', resetDown)
  })

  return (
    <>
      <div
        style={{
          overflow: 'hidden',
          position: 'absolute',
          inset: 0,
        }}
      >
        <div
          class={styles.root}
          style={{
            'font-size': `${cellSize() * 4}px`,
            width: `${cellSize() * size()}px`,
            height: `${cellSize() * size()}px`,
          }}
        >
          <pre class={styles.background} textContent={all()} />
          <pre
            ref={(ref) =>
              createEffect(on(text, () => (rect = ref.getBoundingClientRect())))
            }
            onpointerdown={(e) => (handlePointer(e, +!ctrl), setDown(true))}
            onpointermove={(e) => (
              e.preventDefault(), down() && handlePointer(e, +!ctrl)
            )}
            class={styles.foreground}
            textContent={text()}
          />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          top: 'initial',
          padding: '20px',
        }}
      >
        <button onclick={play}>play</button> {}
        <button onclick={stop}>stop</button> {}
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '1em',
          width: 0,
          right: '1.5em',
        }}
      >
        <div
          style={{
            width: 'max-content',
            transform: 'rotate(-90deg)',
            'transform-origin': 'left',
          }}
        >
          <label>
            <input
              type="range"
              min={2}
              step={2}
              max={navigator.maxTouchPoints ? 150 : 300}
              value={size()}
              oninput={(e) => setSize(e.currentTarget.valueAsNumber)}
            />
          </label>
          <label>
            <input
              type="range"
              min={5}
              step={0.01}
              max={20}
              value={cellSize()}
              oninput={(e) => setCellSize(e.currentTarget.valueAsNumber)}
            />
          </label>
        </div>
      </div>
    </>
  )
}

export default App
