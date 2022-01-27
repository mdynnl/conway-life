export const Grid = (
  size = 3,
  toroidal = false,
  mapper = (r: number, c: number) => 0
) => {
  let future = Array(size)
    .fill(0)
    .map(() => Array<number>(size).fill(0))
  let cells = future.map((_, r) => _.map((_, c) => mapper(r, c)))

  const getRC = (r: number, c: number) => {
    if (toroidal) {
      r = (r %= size) + (r < 0 ? size : 0)
      c = (c %= size) + (c < 0 ? size : 0)
    } else if (r < 0 || c < 0 || r >= size || c >= size) return
    return [r, c]
  }
  const getCell = (r: number, c: number) => {
    let rc = getRC(r, c)
    if (!rc) return 0
    ;[r, c] = rc
    return cells[r][c]
  }

  const setCell = (
    r: number,
    c: number,
    v: number | ((v: number) => number)
  ) => {
    let rc = getRC(r, c)
    if (!rc) return
    ;[r, c] = rc
    cells[r][c] = typeof v === 'function' ? v(cells[r][c]) : v
  }

  const next = () => {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let count = 0
        let n = r - 1
        let s = r + 1
        let w = c - 1
        let e = c + 1

        count =
          getCell(n, w) +
          getCell(n, c) +
          getCell(n, e) +
          getCell(r, w) +
          getCell(r, e) +
          getCell(s, w) +
          getCell(s, c) +
          getCell(s, e)

        future[r][c] = count == 2 ? cells[r][c] : +(count == 3)
      }
    }

    let f = cells
    cells = future
    future = f
  }

  return {
    next,
    get cells() {
      return cells
    },
    setCell,
  }
}
