import { range } from './range'

test('range 3 の配列が生成される', () => {
  expect(range(3)).toEqual([0, 1, 2]);
});

test('range に負の数を与えたとき空配列が返る', () => {
  expect(range(-1)).toEqual([])
})
