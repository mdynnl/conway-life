const CHAR_MAP = [0x1, 0x8, 0x2, 0x10, 0x04, 0x20, 0x40, 0x80]
const R = 4,
  C = 2
const char = (r: number, c: number) => CHAR_MAP[(r % R) * C + (c % C)]

export const Renderer = () => {
  const display: number[][] = []
  let text = ''
  
  const setCell = (r: number, c: number, v: number) => {
    let dr = Math.floor(r / R)
    let dc = Math.floor(c / C)
    display[dr] = display[dr] || []
    display[dr][dc] = (display[dr][dc] || 0x2800) + (v ? char(r, c) : 0)
  }

  const render = (cells: number[][]) => {
    display.length = 0
    
    cells.forEach((_, r) => {
      _.forEach((v, c) => {
        setCell(r, c, v)
      })
    })

    return display
  }

  const renderText = (cells: number[][]) => {
    text = ''

    render(cells).forEach((_) => {
      _.forEach((v) => {
        text += String.fromCharCode(v)
      })
      text += '\n'
    })

    return text
  }

  return { render, renderText }
}
