export function range(n: number): number[] {
  if (n > 0) {
    return [...new Array(n).keys()]
  } else {
    return []
  }
}