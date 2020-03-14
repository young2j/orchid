<template>
  <div id="app" ref='app'>
    <div id='mask' ref='mask'
      @mousedown="onMouseDown" 
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    ></div>
    <ToolBar 
      :initSelect="initSelect" 
      v-position="{startX,startY,width,height}" 
      v-show="completeSelectRegion"
    />
    <video id='video' style="position:absolute;top:0px;"></video>
    <canvas id="canvas" style="position:absolute;top:320px;zIndex:999;border:1px solid" width="600" height="250"></canvas>
  </div>
</template>

<script>
import ToolBar from './components/ToolBar'
import moveElement from './utils/moveElement'
import { captureScreen } from './utils/captureScreen'

export default {
  name: 'App',
  components: {
    ToolBar,
  },
  mounted:function(){
    captureScreen()
  },
  data(){
    return {
      id:"captureRegion",
      startX:0, 
      startY:0,
      width:0, 
      height:0, 
      startCapture:false,
      completeSelectRegion:false,
      isCapture:false
    }
  },
  methods:{
    initSelect(){ //每次选择区域前清理前一次选区进行初始化状态,也就是"取消"工具按钮作用
      const div = document.getElementById(this.id)
      if(div){
        this.$refs.app.removeChild(div)
      }
      this.completeSelectRegion = false
      this.isCapture = false
    },
    onMouseDown(e){ //鼠标按下创建初始选区

      this.initSelect()
      this.startCapture = true
      this.startX = e.clientX 
      this.startY = e.clientY
      
      const div = document.createElement("div")
      div.id = this.id
      div.style.position = 'absolute' 
      div.style.left = this.startX + "px"
      div.style.top = this.startY + "px"
      div.style.cursor = 'move'
      div.zIndex = 999
      div.draggable = false
      this.$refs.app.appendChild(div)
    },
    onMouseMove(e){ //鼠标移动更新选区

      if(this.startCapture){
        const width = e.clientX - this.startX //可能反向选区,就为负数
        const height = e.clientY - this.startY
        
        // 判断是否是在截图，而不是存萃点击操作等,或许是误操作
        this.isCapture = width > 10 //width<0是反向选区，但反向选区时出现mouseup事件丢失，尚未解决
        
        if (this.isCapture){ //是在截图进行选区
          this.width = width
          this.height = height

          const div = document.getElementById(this.id)
          div.style.left = this.startX +'px'
          div.style.top =  this.startY +'px'

          div.style.width = this.width + "px"
          div.style.height =this.height + "px"

          div.style.border = '2px rgba(255,255,255,0.7) solid'
          div.style.boxShadow = "0px 0px 2px 2px rgba(85, 80, 80, 0.3)"
        } 
      }     
    },
    onMouseUp(){ //放开鼠标，生成选区
      this.startCapture = false
      this.completeSelectRegion = this.isCapture

      if(this.completeSelectRegion){
        const div = document.getElementById(this.id)
        moveElement(div,this)
      }
    }
  },
  directives:{
    position: function(el,binding){ //bind + update

      const {startX,startY,width,height} = binding.value
      const {clientWidth,clientHeight} = document.body
      const toolbarLength = 542
      const toolbarHeight = 40
      const isBeyondLeft = (toolbarLength-width)/2 >startX //左边碰壁了
      const isBeyondRight = (toolbarLength-width)/2 >(clientWidth-startX-width) //右边碰壁了
      const isBeyondBottom = toolbarHeight + 20 > (clientHeight-startY - height) //下边碰壁了
      
      el.style.position = 'absolute'
      el.style.zIndex = 999
      el.style.left = isBeyondLeft? '10px': (
              isBeyondRight? clientWidth-toolbarLength-20 + 'px':(startX+width/2)-toolbarLength/2 + 'px'
            )
      el.style.top = isBeyondBottom? startY-60+'px': startY+height + 20 + 'px'
      }
    },
  /**
   * 此处watch功能使用自定义指令v-positon取代了
   */
  // watch:{
  //   completeSelectRegion(){
  //     //实时改变工具条出现的位置
  //     const {clientWidth,clientHeight} = document.body
  //     const toolbarLength = 542
  //     const toolbarHeight = 40
  //     const isBeyondLeft = (toolbarLength-this.width)/2 >this.startX //左边碰壁了
  //     const isBeyondRight = (toolbarLength-this.width)/2 >(clientWidth-this.startX-this.width) //右边碰壁了
  //     const isBeyondBottom = toolbarHeight + 20 > (clientHeight-this.startY - this.height) //下边碰壁了
      
  //     this.styleObj = {
  //       position:'absolute',
  //       left: isBeyondLeft? '10px': (
  //             isBeyondRight? clientWidth-toolbarLength-20 + 'px':(this.startX+this.width/2)-toolbarLength/2 + 'px'
  //           ),
  //       top: isBeyondBottom? this.startY-60+'px': this.startY+this.height + 20 + 'px'
  //     }
  //   },
  // },
  
}
</script>

<style lang="less">

html,body{
  width:100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  overflow: hidden;
}
#app{
  width:100%;
  height: 100%;
}
#mask{
  background: rgba(0,0,0,0.3);
  width:100%;
  height: 100%;
}
</style>
