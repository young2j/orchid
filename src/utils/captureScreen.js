import { desktopCapturer, remote } from 'electron'

const { id, size } = remote.screen.getPrimaryDisplay() //workAreaSize >= size,前者包含屏幕左右的黑边框
export const captureScreen = () => {
  document.body.style.cursor = 'none' //先隐藏光标
  if (process.platform === 'win32') {
    desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
      if (error) throw error
      for (let i = 0; i < sources.length; ++i) {
        if (sources[i].id === id) {
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: sources[i].id,
                minWidth: size.width,
                maxWidth: size.width,
                minHeight: size.height,
                maxHeight: size.height
              }
            }
          })
            .then((stream) => handleStream(stream))
            .catch(err => console.log(err.name + ": " + err.message))
        }
      }
    })
  } else {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          // chromeMediaSourceId: `screen:${id}`, //要了这行会出现NotReadableError,去掉
          minWidth: size.width,
          maxWidth: size.width,
          minHeight: size.height,
          maxHeight: size.height,
        },
        cursor:'never'
      }
    })
      .then((stream) => handleStream(stream))
      .catch(err => console.log(err.name + ": " + err.message))
  }
}

const handleStream = (stream) => {
  const video = document.getElementById('video')
  video.srcObject = stream
  video.onloadedmetadata = () => {
    video.play()
    
    const canvas = document.getElementById('desktop-canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    // ctx.drawImage(video,0,0)
    createImageBitmap(video).then(bmp => { //转为bitmap，可以提高性能，降低canvas渲染延迟
        ctx.drawImage(bmp, 0, 0) //startX,startY,width,height  in canvas
        stream.getTracks()[0].stop() //关闭视频流，序号是反向的，此处只有一个所以是0

        //移除video元素
        document.getElementById('app').removeChild(video)
      }
    )
    // stream.getTracks()[0].stop() //关闭视频流，序号是反向的，此处只有一个所以是0

    //移除video元素
    // document.getElementById('app').removeChild(video)
  }
}
