<template>
  <div id="app">
    <div id="mask" @mousedown="onSelectRegion" :style="{cursor: completeSelectRegion? 'default':'crosshair'}"></div>
    <div id="captureRegion" :style="captureRegionStyle" v-show="isCapture" >
      <div class="drag-circle" data-direction="nw" v-show="canDrag">🌸</div>
      <div class="drag-circle" data-direction="sw" v-show="canDrag">🌸</div>
      <div class="drag-circle" data-direction="ne" v-show="canDrag">🌸</div>
      <div class="drag-circle" data-direction="se" v-show="canDrag">🌸</div>
      <div class="drag-circle" data-direction="n" v-show="canDrag">🌸</div>
      <div class="drag-circle" data-direction="s" v-show="canDrag">🌸</div>
      <div class="drag-circle" data-direction="e" v-show="canDrag">🌸</div>
      <div class="drag-circle" data-direction="w" v-show="canDrag">🌸</div>
    </div>
    <canvas id='capture-canvas' ref='capture' :width="width" :height="height" :style="[captureRegionStyle,{left:canvasX,top:canvasY,width:canvasWidth,height:canvasHeight}]" @mousedown="onDrag"></canvas>
    <ToolBar
      @initSelect="initSelect"
      @closeDrag="canDrag=false"
      v-position="{x,y,width,height}"
      v-show="completeSelectRegion"
      :toolbarBottom="toolbarBottom"
      :canvasProps="{canvasX,canvasY,canvasWidth,canvasHeight}"
    />
    <video id="video"></video>
    <canvas id="desktop-canvas" ref='desktop'></canvas>
  </div>
</template>

<script>
import ToolBar from "./components/ToolBar";
import { captureScreen } from "./utils/captureScreen";

export default {
  name: "App",
  components: {
    ToolBar,
  },
  data() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,

      isCapture: false,
      completeSelectRegion: false,
      canDrag: true,

      captureRegionStyle: {
        position: "absolute",
        // zIndex: 999,
        cursor: 'move',
        draggable: false,
        borderWidth:'2px',
        borderColor:'rgba(255,100,0,0.7)',
        borderStyle:'solid',
        boxShadow: "0px 0px 2px 2px rgba(85, 80, 80, 0.3)",
        left: 0, // =this.x
        top: 0, // = this.y
        width: "0px", //this.width
        height: "0px" //this.height
      },
    };
  },
  mounted: function() {
    captureScreen()
  },
  computed:{
    toolbarBottom(){ //传给子组件，给colorpicker定位
      return  this.$root.$data.screenHeight - (this.y+this.height+60+40)
    },
    canvasX(){
      return this.x+parseFloat(this.captureRegionStyle.borderWidth)
    },
    canvasY(){
      return this.y+parseFloat(this.captureRegionStyle.borderWidth)
    },
    canvasWidth(){
      return this.width - 2*parseFloat(this.captureRegionStyle.borderWidth)
    },
    canvasHeight(){
      return this.height - 2*parseFloat(this.captureRegionStyle.borderWidth)
    }
  },
  methods: {
    clipDesktop(){
      let desktop = this.$refs.desktop,
      ctx = this.$refs.capture.getContext('2d')
      ctx.clearRect(0,0,this.canvasWidth,this.canvasHeight)

      ctx.drawImage(
        desktop,
        this.canvasX,this.canvasY,this.canvasWidth,this.canvasHeight,
        0,0,this.canvasWidth,this.canvasHeight
        )
    },
    initSelect() {
      //每次选择区域前初始化选区状态,也就是"取消"工具按钮作用
      this.completeSelectRegion = false;
      this.isCapture = false;
      this.canDrag = false;
      this.captureRegionStyle.left = 0;
      this.captureRegionStyle.top = 0;
      this.captureRegionStyle.width = 0;
      this.captureRegionStyle.height = 0;
    },
    onSelectRegion(e) {
      //鼠标按下开始截图
      if (this.completeSelectRegion) {
        return false;
      } //选区成功后，不可再点击，除非点击"取消"重新选
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
        //----
        this.clipDesktop()
      }
    },

    onDrag(e) {
      if (this.completeSelectRegion && this.canDrag) {
        // 鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器
        // 最左边的距离-物体左边框相对于浏览器最左边的距离，纵向同理
        const mouseDownX = e.clientX;
        const mouseDownY = e.clientY;
        const leftWidth = e.clientX - this.x;
        const topHeight = e.clientY - this.y;
        const direction = e.target.dataset.direction;

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

          //判断移动方向，更新宽高，位置
          const disX = e.clientX - mouseDownX;
          const disY = e.clientY - mouseDownY;

          if (direction === "n") {
            //上拉伸，高度增加或减少
            this.height = this.height - disY;
            this.y = this.y + disY;

            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.top = this.y + "px";
          } else if (direction === "w") {
            //左拉伸
            this.width = this.width - disX;
            this.x = this.x + disX;
            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.left = this.x + "px";
          } else if (direction === "e") {
            //右拉伸
            this.width = this.width + disX;
            this.captureRegionStyle.width = this.width + "px";
          } else if (direction === "s") {
            //下拉伸
            this.height = this.height + disY;
            this.captureRegionStyle.height = this.height + "px";
          } else if (direction === "nw") {
            //左上拉伸
            this.width = this.width - disX;
            this.height = this.height - disY;
            this.x = this.x + disX;
            this.y = this.y + disY;

            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.left = this.x + "px";
            this.captureRegionStyle.top = this.y + "px";
          } else if (direction === "ne") {
            //右上拉伸
            this.width = this.width + disX;
            this.height = this.height - disY;
            this.y = this.y + disY;

            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.top = this.y + "px";
          } else if (direction === "sw") {
            //左下拉伸

            this.width = this.width - disX;
            this.height = this.height + disY;
            this.x = this.x + disX;

            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.left = this.x + "px";
          } else if (direction === "se") {
            //右下拉伸
            this.width = this.width + disX;
            this.height = this.height + disY;

            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.height = this.height + "px";
          } else {
            //拖动
            this.x = posX;
            this.y = posY;
            this.captureRegionStyle.left = this.x + "px";
            this.captureRegionStyle.top = this.y + "px";
          }
        };

        document.onmouseup = () => {
          // 鼠标抬起时不再移动
          // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
          document.onmousemove = null;
          this.completeSelectRegion = true; //重新选取完成，显示工具条

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
  background: transparent;
}
#app {
  width: 100%;
  height: 100%;
  z-index: 1;
}
#mask {
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  height: 100%;
  z-index: 99;
}

#captureRegion{
  .drag-circle {
    position: absolute;
    width: 15px;
    height: 15px;
    font-size: 10px;
    overflow: hidden;
    z-index: 999;
    &:nth-child(1) {
      left: -8px;
      top: -9px;
      cursor: nwse-resize;
    }
    &:nth-child(2) {
      left: -8px;
      bottom: -8px;
      cursor: nesw-resize;
    }
    &:nth-child(3) {
      right: -9px;
      top: -9px;
      cursor: nesw-resize;
    }
    &:nth-child(4) {
      right: -10px;
      bottom: -8px;
      cursor: nwse-resize;
    }
    &:nth-child(5) {
      top: -10px;
      left: 50%;
      cursor: ns-resize;
    }
    &:nth-child(6) {
      bottom: -8px;
      left: 50%;
      cursor: ns-resize;
    }
    &:nth-child(7) {
      right: -10px;
      top: 50%;
      cursor: ew-resize;
    }
    &:nth-child(8) {
      left: -9px;
      top: 50%;
      cursor: ew-resize;
    }
  }
  #capture-canvas{
    position: absolute;
    left:0px;
    top: 0px;
  }
}
#capture-canvas{
  position: absolute;
  left:0px;
  top: 0px;
  z-index: 9999;
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
  // visibility: hidden;
}
</style>
