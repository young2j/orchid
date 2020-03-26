<template>
  <div id="layout">
    <div id="mask"
      @mousedown="onSelectRegion"
      :style="{cursor: completeSelectRegion? 'default':'crosshair'}">
    </div>

<!-- caputure region -->
    <div id="captureRegion"
      :style="captureRegionStyle"
      v-show="isCapture">
    </div>

<!-- 两个canvas，一个主显示，一个主辅助 -->
      <!-- canvas: mouseup时设置 -->
      <!-- :width="canvasWidth"
      :height="canvasHeight" -->
      <!-- style: mouseup时设置 -->
      <!-- width:canvasWidth+'px',
      height:canvasHeight+'px', -->
    <canvas id='display-canvas'
      ref='display'
      v-show="completeSelectRegion"
      :style="{
        position:'absolute',
        left:canvasX+'px',
        top:canvasY+'px',
        zIndex:999,
        pointerEvents:'none'}"
      >
    </canvas>

    <!-- width/height：同上 -->
    <canvas id='assist-canvas'
      ref='assist'
      v-show="completeSelectRegion"
      :style="{
        position:'absolute',
        left:canvasX+'px',
        top:canvasY+'px',
        zIndex:999,
        cursor:'move'}"
      @mousedown="onDrag">
    </canvas>


<!-- 工具条 -->
    <ToolBar
      @initSelect="initSelect()"
      @closeDrag="canDrag=false"
      v-position="{x,y,width,height}"
      v-show="completeSelectRegion"
      :toolbarBottom="toolbarBottom"
      :canvasProps="{canvasX,canvasY,canvasWidth,canvasHeight}"
      :clipDesktop="clipDesktop"
    />
<!-- 颜色、位置提示框 -->
    <ColorTip v-show="!isCapture" v-if="showColorTip"/>
<!-- 桌面捕获 -->
    <video id="video"></video>
    <canvas id="desktop-canvas" ref='desktop'></canvas>
  </div>
</template>


<script>
import ToolBar from "./components/ToolBar";
import ColorTip from './components/ColorTip'
import { captureScreen,setCanvas} from "./utils/captureScreen";
import {ipcRenderer} from 'electron'

ipcRenderer.on('flushDesktopCapture',()=>captureScreen()) //F1

export default {
  name: "app",
  components: {
    ToolBar,
    ColorTip
  },
  data() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      // pixelRatio:window.devicePixelRatio,

      isCapture: false,
      completeSelectRegion: false,
      canDrag: true,

      captureRegionStyle: {
        position: "absolute",
        zIndex: 99,
        // cursor:'move',
        background:'rgba(0,0,0,0)',
        draggable: false,
        borderWidth:'2px',
        borderColor:this.$root.$data.captureColor,
        borderStyle:'solid',
        boxShadow: "0px 0px 2px 2px rgba(85, 80, 80, 0.3)",
        left: "0px", // =this.x
        top: "0px", // = this.y
        width: "0px", //this.width
        height: "0px" //this.height
      },

      showColorTip: this.$root.$data.showColorTip
    };
  },
  mounted(){
    captureScreen()
  },
  computed:{
    toolbarBottom(){ //传给子组件，给colorpicker定位
      return  this.$root.$data.screenHeight - (this.y+this.height+60+40)
    },
    canvasX(){
      return this.x+parseInt(this.captureRegionStyle.borderWidth)
    },
    canvasY(){
      return this.y+parseInt(this.captureRegionStyle.borderWidth)
    },
    canvasWidth(){
      let width = this.width - 2*parseInt(this.captureRegionStyle.borderWidth)
      return width>0? width:0
    },
    canvasHeight(){
      let height = this.height - 2*parseInt(this.captureRegionStyle.borderWidth)
      return height>0? height:0
    }
  },
  methods: {
    clipDesktop(){
      let desktop = this.$refs.desktop
      const ctx = this.$refs.display.getContext('2d')
      ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight)
      ctx.drawImage(
        desktop,
        this.canvasX,this.canvasY,this.canvasWidth,this.canvasHeight,
        0,0,this.canvasWidth,this.canvasHeight
      )
      ctx.globalCompositeOperation = "source-over"
    },
    initSelect() {
      //每次选择区域前初始化选区状态,也就是"取消"工具按钮作用
      this.completeSelectRegion = false;
      this.isCapture = false;
      this.canDrag = true;
      this.captureRegionStyle.left = '0px';
      this.captureRegionStyle.top = '0px';
      this.captureRegionStyle.width = '0px';
      this.captureRegionStyle.height = '0px';
    },
    onSelectRegion(e) {
      //鼠标按下开始截图
      if (this.completeSelectRegion) {
        return false;
      } //选区成功后，不可再点击，除非点击"取消"重新选

      // if(this.showPixelCanvas){
      //   return false
      // } //像素查看时，不可进行截图选取

      this.initSelect();
      this.x = e.clientX;
      this.y = e.clientY;
      this.captureRegionStyle.left = this.x + "px";
      this.captureRegionStyle.top = this.y + "px";

      document.onmousemove = e => {

        const width = e.clientX - this.x; //可能反向选区,就为负数
        const height = e.clientY - this.y;

        // 判断是否是在截图，而不是纯粹点击鼠标等普通操作
        this.isCapture = width > 15; //width<0是反向选区，但反向选区遇到bug，尚未解决
        if (this.isCapture) {
          //是在截图进行选区,更新宽高
          this.width = width;
          this.height = height;
          this.captureRegionStyle.width = this.width + "px";
          this.captureRegionStyle.height = this.height + "px";
        }
      }
      document.onmouseup = () => { //BUG:偶尔丢失mouseup事件，我鼠标问题吗？
        //放开鼠标，清除移动事件，生成选区
        document.onmousemove = null;
        this.completeSelectRegion = this.canDrag = this.isCapture;

        //-------设置宽高、清空画布都会使canvas状态清空，所以在这里处理高dpi模糊问题
        setCanvas(this.$refs.display,this.canvasWidth,this.canvasHeight)
        setCanvas(this.$refs.assist,this.canvasWidth,this.canvasHeight)
        //-------
        this.clipDesktop()
      }
    },

    onDrag(e) {
      if (this.completeSelectRegion && this.canDrag) {
        // 鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器
        // 最左边的距离-物体左边框相对于浏览器最左边的距离，纵向同理
        const leftWidth = e.clientX - this.x;
        const topHeight = e.clientY - this.y;

        document.onmousemove = e => {
          this.completeSelectRegion = false; //移动时意味着重新选区，未完成选区隐藏工具条

          // 控制拖拽物体的范围只能在浏览器视窗内，不允许出现滚动条或拖出可视区域
          let posX = e.clientX - leftWidth;
          let posY = e.clientY - topHeight;

          if (posX < 0) {
            posX = 0;
          } else if (posX > document.body.clientWidth - this.width) {
            posX = document.body.clientWidth - this.width;
          }

          if (posY < 0) {
            posY = 0;
          } else if (posY > document.body.clientHeight - this.height) {
            posY = document.body.clientHeight - this.height;
          }

          //拖动
          this.x = posX;
          this.y = posY;
          this.captureRegionStyle.left = this.x + "px";
          this.captureRegionStyle.top = this.y + "px";
        }

        document.onmouseup = () => {
          // 鼠标抬起时不再移动
          // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
          document.onmousemove = null;
          this.completeSelectRegion = true; //重新选取完成，显示工具条

          //-------设置宽高、清空画布都会使canvas状态清空，所以在这里处理高dpi模糊问题
          setCanvas(this.$refs.display,this.canvasWidth,this.canvasHeight)
          setCanvas(this.$refs.assist,this.canvasWidth,this.canvasHeight)
          //------
          this.clipDesktop()
        };
      }
    }
  },
  directives: {
    position: function(el, binding) {
      //bind + update
      let { x, y, width, height } = binding.value;
      const { clientWidth, clientHeight } = document.body;
      const toolbarLength = 575;
      const toolbarHeight = 40;
      const isBeyondLeft = (toolbarLength - width) / 2 > x; //左边碰壁了
      const isBeyondRight =
        (toolbarLength - width) / 2 > clientWidth - x - width; //右边碰壁了
      const isBeyondBottom =
        toolbarHeight + 20 > clientHeight - y - height; //下边碰壁了

      el.style.position = "absolute";
      el.style.zIndex = 999;
      el.style.left = isBeyondLeft
        ? "10px"
        : isBeyondRight
        ? clientWidth - toolbarLength - 20 + "px"
        : x + width / 2 - toolbarLength / 2 + "px";
      el.style.top = isBeyondBottom
        ? y - 60 + "px"
        : y + height + 40 + "px";
    }
  }
};
</script>

<style lang="less">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3); //关键在这里，调试时发现是#fff
}
#app,#layout {
  width: 100%;
  height: 100%;
  z-index: 1;
  // background: rgba(0, 0, 0, 0.1);
}
#mask {
  // background: rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;
  z-index: 99;
}

#desktop-canvas,
#video {
  position: absolute;
  top: 0px;
  left: 0px;
  z-index: -999;
  width: 100%;
  height: 100%;
  pointer-events: none;
  visibility: hidden;
}
</style>
