<template>
  <div id="toolbar">
    <!-- //点击工具按钮后，选区不可再移动 -->
    <b-button-group @click="$emit('closeDrag')">

      <b-tooltip triggers='focus' target='orchid-button' title="拖动"></b-tooltip>
      <b-button id='orchid-button'>
        <span>🌸</span>
      </b-button>

      <b-tooltip triggers='focus' target='undo-button' title="撤销"></b-tooltip>
      <b-button id='undo-button' @click="clickUndo">
        <span><b-icon icon="reply-fill" flip-h></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='redo-button' title='恢复'></b-tooltip>
      <b-button id='redo-button' @click="clickRedo">
        <span><b-icon icon="reply-fill"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='square-button' title='矩形'></b-tooltip>
      <b-button id='square-button' @click="clickSquare">
        <span><b-icon icon="square"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='circle-button' title='圆形'></b-tooltip>
      <b-button id='circle-button' @click="clickCircle">
        <span><b-icon icon="circle"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='arrow-button' title='箭头'></b-tooltip>
      <b-button id='arrow-button' @click="clickArrow">
        <span><b-icon icon="arrow-right"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='line-button' title='直线'></b-tooltip>
      <b-button id='line-button' @click="clickLine">
        <span><b-icon icon="dash"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='text-button' title='文本'></b-tooltip>
      <b-button id='text-button' @click="clickText">
        <span><b-icon icon="fonts"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='brush-button' title='涂鸦'></b-tooltip>
      <b-button id='brush-button' @click="clickBrush">
        <span><b-icon icon="brush"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='lineshape-button' title='线型'></b-tooltip>
      <!-- 框架的<b-dropdown/>组件存在无法更改背景色的bug，这里用原生写一个。 -->
      <b-button id="lineshape-button">
        <span @click="clickLineShape"><b-icon icon="list"></b-icon></span>
        <div class='lineshape-content'
          v-show="showLineShape"
          :style="{top:toolbarBottom>160? 40+'px':-143+'px'}"
        >
        <ul @click='changeLineShape'>
          <li>
            <div :style="selectLineStyle"></div>
            <p class='line-width'>{{linewidth+'px'}}</p>
          </li>
          <li><hr/></li>
          <li data-shape='radius'><div class='radius-line'></div></li>
          <li data-shape='radius50'><div class='radius50-line'></div></li>
          <li data-shape='solid'><div class='solid-line'></div></li>
          <li data-shape='dotted'><div class='dot-line'></div></li>
          <li data-shape='dashed'><div class='dash-line'></div></li>
       </ul>
        <b-form-input
          class="range-input"
          type="range"
          min="0"
          max="20"
          size='sm'
          v-model="linewidth"
        ></b-form-input>
       </div>
      </b-button>

      <b-tooltip triggers='focus' target='color-button' title='颜色' custom-class='tooltip'></b-tooltip>
      <b-button id='color-button'>
        <span @click="clickColor"><b-icon icon="pen"></b-icon></span>
        <ColorPicker id='colorpicker'
          v-show="showColorPicker"
          :style="{top:toolbarBottom>380? 40+'px':-378+'px'}"
          :color="color"
          @changeColor="changeColor"
        />
      </b-button>

      <b-tooltip triggers='focus' target='recognition-button' title='识别'></b-tooltip>
      <b-button id='recognition-button' @click="clickRecognition">
        <span><b-icon icon="camera"></b-icon></span>
      </b-button>

      <!-- <b-tooltip triggers='focus' target='-button' title='历史'></b-tooltip> -->
      <!-- <b-button id='">-button' @click="click">
        <span><b-icon icon="images"></b-icon></span>
      </b-button> -->
      <b-tooltip triggers='focus' target='no-button' title='取消'></b-tooltip>
      <b-button id='no-button' @click="clickNo">
        <span><b-icon icon="x"></b-icon></span>
      </b-button>

      <b-tooltip triggers='focus' target='yes-button' title='确定'></b-tooltip>
      <b-button id='yes-button' @click="clickYes">
        <span><b-icon icon="check"></b-icon></span>
      </b-button>

    </b-button-group>
  </div>

</template>

<script>
import brush from '../assets/brush.svg'
import feather from '../assets/feather.svg'
import picker from '../assets/picker.svg'

// import Observer from '../utils/observer'
import ColorPicker from '@caohenghu/vue-colorpicker'

import html2canvas from 'html2canvas'

export default {
  props:{
    toolbarBottom: Number
  },
  components:{
    ColorPicker
  },
  data() {
    return {
      isDrawLine:false,
      square:{
        startX:0,
        startY:0,
        width:0,
        height:0,
        drawing:false,
        index:0,
      },
      // observer: null,
      drawRegion:null,
      captureRegion:null,

      showColorPicker:false,

      color:'#d63200', //border-color
      linewidth: 2, //border-width
      lineshape:'solid', //boder-style
      radius:'0px',
      showLineShape:false,

      featherCursor:`url(${feather}) 0 30,default`,
      brushCursor: `url(${brush}) 0 30,default`,
      pickerCursor:`url(${picker}) 0 30,default`,

    }
  },
  computed:{
    selectLineStyle(){
      return {
        width:'100px',
        height:'0px',
        border: 'none',
        borderBottom:this.linewidth+'px ' + this.color + ' ' + this.lineshape + ' ',
        borderRadius:this.radius
        }
    }
  },
  methods: {
    changeColor(color) {
      const { r, g, b, a } = color.rgba
      this.color = `rgba(${r}, ${g}, ${b}, ${a})`
    },
    changeLineShape(e){
      let shape = e.target.dataset.shape || 'solid'
      if(shape==='radius'){
        this.radius = this.linewidth/2 + 'px'
        this.lineshape = 'solid'
      }else if(shape==='radius50'){
        this.radius = '50%'
        this.lineshape = 'solid'
      }else{
        this.radius = 0
        this.lineshape = shape
      }
    },
    colseDropDown(){
      this.showColorPicker = this.showLineShape = false
    },
    clickUndo(){
      this.colseDropDown()
      // this.observer.undo()
    },
    clickRedo(){
      this.colseDropDown()
      // this.observer.redo()
    },
    clickSquare(){
      this.colseDropDown()
      this.captureRegion.style.cursor = "crosshair"
      this.captureRegion.onmousedown = e => {
        this.square.drawing = true;
        this.square.startX = e.clientX;
        this.square.startY = e.clientY;
        const square = document.createElement('div')
        square.className = 'orchid square'
        square.id = `square-${this.square.index}`
        square.style.position = 'absolute'
        square.style.border = this.selectLineStyle.borderBottom
        square.style.borderRadius = this.selectLineStyle.borderRadius
        square.style.zIndex = 99
        this.drawRegion.appendChild(square)

        document.onmousemove = e => {
          // this.observer.disconnect() //不要记录移动过程中的样式变化
          if (this.square.drawing) {
            const width = e.clientX - this.square.startX; //可能反向选区,就为负数
            const height = e.clientY - this.square.startY;
            this.square.width = width
            this.square.height = height
            square.style.width = this.square.width + "px";
            square.style.height = this.isDrawLine? '0px': this.square.height + "px";
            square.style.left = this.square.startX + "px";
            square.style.top = this.square.startY + "px";
          }
        }
        document.onmouseup = () => {
          document.onmousemove = null
          this.square.drawing = false
          this.square.index += 1
          this.isDrawLine = false
          // this.observer.observe() //继续记录DOM变更
        }
      }
    },
    clickCircle(){
      this.colseDropDown()
      this.captureRegion.style.cursor = "crosshair"
      this.radius = '50%'
    },
    clickArrow(){
      this.colseDropDown()
      this.captureRegion.style.cursor = this.featherCursor
    },
    clickLine(){
      this.colseDropDown()
      this.captureRegion.style.cursor = this.featherCursor
      this.isDrawLine = true
    },
    clickText(){
      this.colseDropDown()
      this.captureRegion.style.cursor = "text"
    },
    clickBrush(){
      this.colseDropDown()
      this.captureRegion.style.cursor = this.brushCursor
    },
    clickLineShape(){
      this.showColorPicker = false
      this.showLineShape = !this.showLineShape
    },
    clickColor(){
      this.showLineShape = false
      this.showColorPicker = !this.showColorPicker
      const mask = document.getElementById('mask')
      mask.style.cursor = this.showColorPicker? this.pickerCursor:'default'
    },
    clickRecognition(){
      this.colseDropDown()
    },
    clickNo() {
      this.colseDropDown()
      this.$emit('initSelect')
      this.captureRegion.style.cursor = 'move'
      this.drawRegion.innerHTML = ''
    },
    clickYes(){
      this.colseDropDown()
      html2canvas(this.drawRegion).then(
        canvas=>{
          document.body.appendChild(canvas)
        }
      )
    },
  },
  mounted(){
    this.captureRegion = document.getElementById('captureRegion')
    this.drawRegion = document.getElementById('drawRegion')

    //监视绘画区变更记录
    // const observer = new Observer(this.drawRegion)
    // observer.observe()
    // this.observer = observer
  },
  // beforeDestroy(){
  //   this.observer.takeRecords()
  // }
}
</script>

<style lang='less' scoped>
#toolbar{
  z-index: 999;
  .btn-group {
    button {
      padding: 5px 10px 8px 10px;
      span {
        display: inline-block;
        transform: scale(1.5);
        &:hover{
          transform: scale(1.8);
          transition: all 0.3s;
        }
      }
    }
  }
}

#colorpicker{
  z-index: 9999;
  position: absolute;
  left:-55px;
  background: #6c757d;
  width: 220px !important;
}

.tooltip{
  z-index: -1;
}

#lineshape-button{
  .lineshape-content{
    position:absolute;
    // top:40px;
    left:-30px;
    ul{
      background: #6c757d;
      list-style: none;
      padding: 0px;
      width:150px;
      height: 10%;
      min-height: 140px;
      li{
        padding: 11px 10px;
        &:nth-child(1){
          padding-top: 20px;
        }
        &:nth-child(2){
          padding: 0px;
          hr{
            margin: 0px;
            width:75%;
          }
        }
      }
      .radius-line{
        width:100px;
        height: 0px;
        border:none;
        border-bottom:6px #fff solid;
        border-radius: 3px;
      }
      .radius50-line{
        width:100px;
        height: 0px;
        border:none;
        border-bottom:6px #fff solid;
        border-radius: 50%;
      }
      .solid-line{
        width:100px;
        height: 0px;
        border: none;
        border-bottom:6px #fff solid;
      }
      .dot-line{
        width:100px;
        height: 0px;
        border:none;
        border-bottom:3px #fff dotted;
      }
      .dash-line{
        width:100px;
        height: 0px;
        border:none;
        border-bottom:3px #fff dashed;
      }
    }


    //
    .line-width{
      position: absolute;
      top:6%;
      right:2%;
      font-size: 14px;
    }
    .range-input{
      position: absolute;
      transform: rotate(90deg);
      top:50%;
      left:48%;
      width:80%;
    }
  }
}

</style>
