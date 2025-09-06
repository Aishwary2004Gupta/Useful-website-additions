print({
  canvas: document.getElementById('ascii'),
  image: 'https://images.unsplash.com/photo-1755380749576-c2372cc487a7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  fontSize: 10,
  spaceing: 8
})

const map = (s, a1, a2, b1, b2) => b1 + (s - a1) * (b2 - b1) / (a2 - a1)

function print(config) {
  let original = new Image()
  original.crossOrigin = 'Anonymous'
  original.onload = function() {
    let dataCtx = document.createElement('canvas').getContext('2d')
    config.canvas.width = dataCtx.canvas.width = this.width
    config.canvas.height = dataCtx.canvas.height = this.height

    dataCtx.drawImage(this, 0, 0, this.width / config.spaceing, this.height / config.spaceing)
    let data = dataCtx.getImageData(0, 0, original.width, original.height).data

    let ctx = config.canvas.getContext('2d')
    ctx.fillStyle = '#fff'

    let represenation = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^'. "

    for (let i = 0, ii = 0; i < data.length; i += 4, ii++) {

      let x = ii % this.width
      let y = ii / this.width | 0
      let grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3 | 0
      let char = represenation[map(grayscale, 255, 0, 0, represenation.length - 1) | 0]

      ctx.fillStyle = `rgb(${grayscale},${grayscale},${grayscale})`
      ctx.font = `${config.fontSize}px Courier New`
      ctx.fillText(char, x * config.spaceing, y * config.spaceing)

    }

  }

  original.src = config.image

}