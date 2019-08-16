import React from 'react'
import ReactDOM from 'react-dom'
import hark from 'hark'

document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('root')

  ReactDOM.render(<App />, rootEl)
})

type Volume = number

const App: React.FC = () => {
  const canvasElRef = React.useRef<HTMLCanvasElement>(null)
  const audioLevelDrawerRef = React.useRef<AudioLevelDrawer>(null)
  const currentVolume = React.useRef<number>(null)

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function(stream) {
        const speechEvents = hark(stream)

        speechEvents.on('volume_change', function(e: any) {
          if (currentVolume != undefined && e !== Infinity && e !== -Infinity) {
            // @ts-ignore
            // current は readonly プロパティではない
            currentVolume.current = e
          }
        })
      })
      .catch(function(err: Error) {
        window.alert(err.message)
      })

    // 音量を記録して再描画する
    window.setInterval(() => {
      if (
        currentVolume != undefined &&
        audioLevelDrawerRef.current != undefined
      ) {
        const { current } = currentVolume

        if (current == undefined) {
          return
        }

        const audioLevelDrawer = audioLevelDrawerRef.current

        const nextVolume = Math.pow(
          Math.abs(10 * Math.log((current - 20) / -100)),
          2
        )

        audioLevelDrawerRef.current.setVolumes([
          ...audioLevelDrawer.volumes,
          nextVolume,
        ])

        audioLevelDrawer.draw()
      }
    }, 50)
  }, [])

  React.useEffect(() => {
    const canvas = canvasElRef.current

    if (canvas != undefined) {
      // @ts-ignore
      audioLevelDrawerRef.current = new AudioLevelDrawer(
        // @ts-ignore
        // なぜか canvas が HTMLCanvasElement | null になる
        canvas.getContext('2d')
      )
    }
  }, [canvasElRef.current])

  return (
    <canvas
      ref={canvasElRef}
      width={1000}
      height={400}
      style={{ width: '500px', height: '200px' }}
    />
  )
}

function last(arry: any[], count: number): any[] {
  return arry.filter((_, index) => {
    return arry.length - index <= count
  })
}

class AudioLevelDrawer {
  private ctx: CanvasRenderingContext2D
  private _volumes: Volume[] = []

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx
  }

  get volumes() {
    return this._volumes
  }

  public setVolumes(volumes: Volume[]): void {
    this._volumes = last(volumes, 1000)
  }

  public draw() {
    const { ctx } = this
    ctx.clearRect(0, 0, 1000, 400)
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 1

    this._volumes.forEach((volume, index) => {
      // 中心線を描画する
      ctx.beginPath()
      ctx.moveTo(index, 400 / 2)
      ctx.lineTo(1, 200)
      ctx.closePath()
      ctx.stroke()

      // 上下の線を描画する
      ctx.beginPath()
      ctx.moveTo(index, 400 / 2 - volume)
      ctx.lineTo(index, 400 / 2 + volume)
      ctx.closePath()
      ctx.stroke()
    })
  }
}
