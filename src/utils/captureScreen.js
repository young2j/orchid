import { remote } from 'electron'

const { size } = remote.screen.getPrimaryDisplay() //workAreaSize >= size,前者包含屏幕左右的黑边框


//解决canvas渲染模糊

 export const setCanvas = (canvas,width,height)=>{
   let ctx = canvas.getContext('2d')
  let backingStorePixelRatio = ctx.backingStorePixelRatio ||
  ctx.webkitBackingStorePixelRatio ||
  ctx.mozBackingStorePixelRatio ||
  ctx.msBackingStorePixelRatio ||
  ctx.oBackingStorePixelRatio ||
  ctx.backingStorePixelRatio || 1
  
  const pixelRatio = (window.devicePixelRatio || 1)/backingStorePixelRatio //获得屏幕像素比，进行缩放，否则绘制会出现模糊
  canvas.width = width * pixelRatio //相应缩放画布
  canvas.height = height * pixelRatio 
  ctx.scale(pixelRatio,pixelRatio)
  
  canvas.style.width = width + 'px'//实际按照屏幕大小绘制
  canvas.style.height = height +'px'
  
  return canvas
}



export const captureScreen = () => {
  document.body.style.cursor = 'none' //先隐藏光标  
  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        // chromeMediaSourceId: `screen:${id}`, //我的windows和linux要了这行都会出现NotReadableError,去掉
        minWidth: size.width,
        maxWidth: size.width,
        minHeight: size.height,
        maxHeight: size.height,
      },
      cursor:'never'
    }
  }).then( stream => handleStream(stream))
}


const handleStream = (stream) => {
  const video = document.getElementById('video')
  video.srcObject = stream
  
  video.onloadedmetadata = () => {
    video.play()
    
    let canvas = document.getElementById('desktop-canvas')
    canvas.width = size.width
    canvas.height = size.height
    canvas.style.width = size.width + 'px'//实际按照屏幕大小绘制
    canvas.style.height = size.height +'px'
    const ctx = canvas.getContext('2d')
    
    // ctx.drawImage(video,0, 0)
    createImageBitmap(video).then(bmp => { //转为bitmap，可以提高性能，降低canvas渲染延迟
      ctx.drawImage(bmp, 0, 0) //startX,startY,width,height  in canvas
      stream.getTracks()[0].stop() //关闭视频流，序号是反向的，此处只有一个所以是0
      
      // 移除video元素
      // document.getElementById('app').removeChild(video)
    }
    )
  }
}
