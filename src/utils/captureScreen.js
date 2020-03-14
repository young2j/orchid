import { desktopCapturer, remote } from 'electron'

export const captureScreen = () => {
  const { id, workAreaSize } = remote.screen.getPrimaryDisplay() //size>=workAreaSize 
  if (process.platform === 'win32'){
    desktopCapturer.getSources({ types: ['screen']}, (error, sources) => {
      if (error) throw error
      for (let i = 0; i < sources.length; ++i) {
      if (sources[i].id === id) {
        navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sources[i].id,
              minWidth: workAreaSize.width,
              maxWidth: workAreaSize.width,
              minHeight: workAreaSize.height,
              maxHeight: workAreaSize.height
          }
        }
      })
      .then((stream) => handleStream(stream))
      .catch(err => console.log(err.name + ": " + err.message))
      }}
    })
  } else {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                // chromeMediaSourceId: `screen:${id}`, //要了这行会出现NotReadableError
                minWidth: workAreaSize.width,
                maxWidth: workAreaSize.width,
                minHeight: workAreaSize.height,
                maxHeight: workAreaSize.height,
              },
              cursor:'never'
        }
    })
    .then((stream) => handleStream(stream))
    .catch(err => console.log(err.name + ": " + err.message))
  }
}


const handleStream = (stream)=> {
  const video = document.getElementById('video')
  
  video.srcObject = stream
  video.style.width = 600 + 'px'
  video.style.height = 300 + 'px'
  video.onloadedmetadata = () => {
      video.play()
      const ctx = document.getElementById('canvas').getContext('2d')
      createImageBitmap(video).then( bmp =>
        ctx.drawImage(bmp,0,0,600,300)
      )
      // ctx.drawImage(video,0,0)
      stream.getTracks()[0].stop() //关闭视频流，序号是反向的，此处只有一个所以是0
    }


}
