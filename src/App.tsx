import { Component, createEffect, createSignal } from 'solid-js'
import styles from './App.module.css'
import { Renderer } from './braille'
import { Grid } from './grid'

const App: Component = () => {
  const braille = Renderer()

  const [size, setSize] = createSignal(30)
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
      console.log('g')
      render()
    }, 60)
  }
  const stop = () => {
    clearInterval(interval)
    interval = undefined
  }

  createEffect(render)
  createEffect(() => setGrid(Grid(size(), true, map)))

  return (
    <>
      <button onclick={play}>play</button> {}
      <button onclick={stop}>stop</button> {}
      <label>
        grid size:{' '}
        <input
          type="range"
          min={1}
          value={size()}
          oninput={(e) => setSize(e.currentTarget.valueAsNumber)}
        />{' '}
        {size()}
      </label>
      <div
        class={styles.root}
        style={{ width: size() * 0.95 + 'em', height: size() * 0.95 + 'em' }}
      >
        <pre class={styles.background} textContent={all()} />
        <pre class={styles.foreground} textContent={text()} />
      </div>
    </>
  )
}

export default App
