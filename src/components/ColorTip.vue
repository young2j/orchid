<template>
  <div id='colortip'>
    <div id="tipboard" :style="tipboardStyle">
      <ul>
        <li>
          <span>x :</span>{{left}}
          <span style="padding-left:20px">y :</span>{{top}}
        </li>
        <li >
          <span :style="{textDecoration:switchColor? 'none':'underline #fff'}">hex :</span>
          <span :style='{color:hex}'>{{hex}}</span>
        </li>
        <li>
          <span :style="{textDecoration:switchColor? 'underline #fff':'none'}">rgba:</span>
          <span :style="{color:'rgba'+ rgba}">{{rgba}}</span>
        </li>
        <li>
          <span>按c复制 shift切换</span>
          <span v-show="hasCopy">已复制</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import RGB2HEX from '../utils/RGB2HEX'

export default {
  data(){
    return {
      left:0,
      top:0,
      hex:'#000000',
      rgba:'(0,0,0,0)',
      switchColor:false,
      hasCopy:false
    }
  },
  computed:{
    tipboardStyle(){
      let top,left
      if(this.left>180){
        top = this.top - 50 + 'px'
        left = this.left - 220 + 'px'
      }else{
        left = this.left + 30 + 'px'
        top = this.top-50 +'px'
      }
      return {
        position:'absolute',
        border: `2px ${this.hex} dashed`,
        left,
        top
      }
    }
  },
  mounted(){
    //获得实时像素
    const mask = document.getElementById('mask')
    const desktopCanvas = document.getElementById('desktop-canvas')
    let desktopCtx = desktopCanvas.getContext('2d')

    mask.onmousemove = e =>{
      this.left = e.clientX
      this.top = e.clientY
      let pixel = desktopCtx.getImageData(this.left,this.top,1,1)
      let r = pixel.data[0],
          g = pixel.data[1],
          b = pixel.data[2],
          a = pixel.data[3]
      this.rgba = `(${r},${g},${b},${a})`
      this.hex = RGB2HEX('rgba'+this.rgba)
    }

    //绑定复制颜色事件
    document.onkeydown = e => {
      if(this.isCapture){
        return false
      }
      if(e.keyCode===16){
        this.switchColor = !this.switchColor
      }
      if(e.keyCode===67){ //按C复制
        this.hasCopy = true
        let copyColor = this.switchColor? 'rgba'+this.rgba:this.hex
        navigator.clipboard.writeText(copyColor)

        setTimeout(() => {
          if(this.hasCopy){
            this.hasCopy = false
          }
        }, 2000);
      }
    }
  }
}
</script>

<style lang='less' scoped>
#colortip{
  pointer-events: none;
  #tipboard{
    z-index: 1;
    background:#6c757d;
    color: #fff;
    border:1px #fff dashed;
    ul{
      list-style: none;
      padding: 5px;
      margin: 0px;
      z-index: 0;
      li{
        span:nth-child(1){
          padding-right: 5px;
          font-weight: bold;
        }
      }
      li:last-child{
        font-size:11px;
        padding-top: 5px;
        span:nth-child(2){
          font-weight: bold;
          color:greenyellow;
          padding-left:10px
        }
      }
    }
  }
}
</style>
