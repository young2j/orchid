<template>
  <div id="app">
    <div id="mask" @mousedown="onMouseDown" 
        :style="{cursor: completeSelectRegion? 'default':'crosshair'}"
    ></div>
    <div id="captureRegion" :style="captureRegionStyle" v-show="isCapture" @mousedown="onDrag">
      <div class="drag-circle" data-direction="nw" v-show="completeSelectRegion">🌸</div>
      <div class="drag-circle" data-direction="sw" v-show="completeSelectRegion">🌸</div>
      <div class="drag-circle" data-direction="ne" v-show="completeSelectRegion">🌸</div>
      <div class="drag-circle" data-direction="se" v-show="completeSelectRegion">🌸</div>
      <div class="drag-circle" data-direction="n" v-show="completeSelectRegion">🌸</div>
      <div class="drag-circle" data-direction="s" v-show="completeSelectRegion">🌸</div>
      <div class="drag-circle" data-direction="e" v-show="completeSelectRegion">🌸</div>
      <div class="drag-circle" data-direction="w" v-show="completeSelectRegion">🌸</div>
    </div>

    <ToolBar
      @initSelect="initSelect"
      @switchDrag="canDrag=!canDrag"
      @closeDrag="canDrag=false"
      v-position="{startX,startY,width,height}"
      v-show="completeSelectRegion"
    />
    <video id="video"></video>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import ToolBar from "./components/ToolBar";
import { captureScreen } from "./utils/captureScreen";

export default {
  name: "App",
  components: {
    ToolBar
  },
  mounted: function() {
    captureScreen();
  },
  data() {
    return {
      startX: 0,
      startY: 0,
      width: 0,
      height: 0,
      startCapture: false,
      isCapture: false,
      completeSelectRegion: false,

      canDrag: true,

      captureRegionStyle: {
        position: "absolute",
        zIndex: 999,
        cursor: 'move',
        draggable: false,
        border: "2px rgba(255,255,255,0.7) solid",
        boxShadow: "0px 0px 2px 2px rgba(85, 80, 80, 0.3)",
        left: 0, // =this.startX
        top: 0, // = this.startY
        width: "0px", //this.width
        height: "0px" //this.height
      }
    };
  },
  methods: {
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
    onMouseDown(e) {
      //鼠标按下开始截图
      if (this.completeSelectRegion) {
        return false;
      } //选区成功后，不可再点击，除非点击"取消"重新选
      this.initSelect();
      this.startCapture = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.captureRegionStyle.left = this.startX + "px";
      this.captureRegionStyle.top = this.startY + "px";

      document.onmousemove = e => {
        if (this.startCapture) {
          const width = e.clientX - this.startX; //可能反向选区,就为负数
          const height = e.clientY - this.startY;

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
      };

      document.onmouseup = () => {
        //放开鼠标，清除移动事件，生成选区
        document.onmousemove = null;
        this.startCapture = false;
        this.completeSelectRegion = this.canDrag = this.isCapture;
      };
    },

    onDrag(e) {
      if (this.completeSelectRegion && this.canDrag) {
        // 鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器
        // 最左边的距离-物体左边框相对于浏览器最左边的距离，纵向同理
        const mouseDownX = e.clientX;
        const mouseDownY = e.clientY;
        const leftWidth = e.clientX - this.startX;
        const topHeight = e.clientY - this.startY;
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
            this.startY = this.startY + disY;

            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.top = this.startY + "px";
          } else if (direction === "w") {
            //左拉伸
            this.width = this.width - disX;
            this.startX = this.startX + disX;
            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.left = this.startX + "px";
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
            this.startX = this.startX + disX;
            this.startY = this.startY + disY;

            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.left = this.startX + "px";
            this.captureRegionStyle.top = this.startY + "px";
          } else if (direction === "ne") {
            //右上拉伸
            this.width = this.width + disX;
            this.height = this.height - disY;
            this.startY = this.startY + disY;

            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.top = this.startY + "px";
          } else if (direction === "sw") {
            //左下拉伸

            this.width = this.width - disX;
            this.height = this.height + disY;
            this.startX = this.startX + disX;

            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.height = this.height + "px";
            this.captureRegionStyle.left = this.startX + "px";
          } else if (direction === "se") {
            //右下拉伸
            this.width = this.width + disX;
            this.height = this.height + disY;

            this.captureRegionStyle.width = this.width + "px";
            this.captureRegionStyle.height = this.height + "px";
          } else {
            //拖动
            this.startX = posX;
            this.startY = posY;
            this.captureRegionStyle.left = this.startX + "px";
            this.captureRegionStyle.top = this.startY + "px";
          }
        };

        document.onmouseup = () => {
          // 鼠标抬起时不再移动
          // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
          document.onmousemove = null;
          this.completeSelectRegion = true; //重新选取完成，显示工具条
        };
      }
    }
  },
  directives: {
    position: function(el, binding) {
      //bind + update
      let { startX, startY, width, height } = binding.value;
      const { clientWidth, clientHeight } = document.body;
      const toolbarLength = 542;
      const toolbarHeight = 40;
      const isBeyondLeft = (toolbarLength - width) / 2 > startX; //左边碰壁了
      const isBeyondRight =
        (toolbarLength - width) / 2 > clientWidth - startX - width; //右边碰壁了
      const isBeyondBottom =
        toolbarHeight + 20 > clientHeight - startY - height; //下边碰壁了

      el.style.position = "absolute";
      el.style.zIndex = 999;
      el.style.left = isBeyondLeft
        ? "10px"
        : isBeyondRight
        ? clientWidth - toolbarLength - 20 + "px"
        : startX + width / 2 - toolbarLength / 2 + "px";
      el.style.top = isBeyondBottom
        ? startY - 60 + "px"
        : startY + height + 20 + "px";
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

.drag-circle {
  position: absolute;
  width: 15px;
  height: 15px;
  font-size: 10px;
  overflow: hidden;
  z-index: 9999;
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
#canvas,
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
