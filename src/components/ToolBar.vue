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
        <ul>
          <li>
            <div :style="selectLineStyle"></div>
            <p class='line-width'>{{config.lineWidth+'px'}}</p>
          </li>
          <li><hr/></li>
          <li @click='changeLineShape' data-shape='radius'><div class='radius-line'></div></li>
          <li @click='changeLineShape' data-shape='radius50'><div class='radius50-line'></div></li>
          <li @click='changeLineShape' data-shape='solid'><div class='solid-line'></div></li>
          <li @click='changeLineShape' data-shape='dashed'><div class='dash-line'></div></li>
       </ul>
        <b-form-input
          class="range-input"
          type="range"
          min="0"
          max="40"
          size='sm'
          v-model="config.lineWidth"
        ></b-form-input>
       </div>
      </b-button>

      <b-tooltip triggers='focus' target='color-button' title='颜色' custom-class='tooltip'></b-tooltip>
      <b-button id='color-button'>
        <span @click="clickColor"><b-icon icon="pen"></b-icon></span>
        <ColorPicker id='colorpicker'
          v-show="showColorPicker"
          :style="{top:toolbarBottom>380? 40+'px':-378+'px'}"
          :color="config.lineColor"
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
// import picker from '../assets/picker.svg'

import ColorPicker from '@caohenghu/vue-colorpicker'
import arrowCoordinate from '../utils/arrowCoordinate'

export default {
  props:{
    toolbarBottom: Number,
    canvasProps:Object,
    clipDesktop:Function
  },
  components:{
    ColorPicker
  },
  data() {
    return {
      showColorPicker:false,
      showLineShape:false,
      inputText:false,
      fontSize:16,

      featherCursor:`url(${feather}) 0 30,default`,
      brushCursor: `url(${brush}) 0 30,default`,
      // pickerCursor:`url(${picker}) 0 30,default`,

      config:{
        lineWidth:2,
        lineColor:"#6EFF2A",
        lineCap:'round',
        lineDash:[0,0],
        shadowBlur:2,
        lineRadius50:false,
        //选项显示用
        lineShape:'solid',
        radius:'0px'
      },

      recordsQueue:[0],
    }
  },
  computed:{
    selectLineStyle(){
      return {
        width:'100px',
        height:'0px',
        border: 'none',
        borderBottom:this.config.lineWidth+'px ' + this.config.lineColor + ' ' + this.config.lineShape,
        borderRadius:this.config.radius
      }
    },
    canvasX(){
      return this.canvasProps.canvasX
    },
    canvasY(){
      return this.canvasProps.canvasY
    },
    canvasWidth(){
      return this.canvasProps.canvasWidth
    },
    canvasHeight(){
      return this.canvasProps.canvasHeight
    },
  },
  mounted(){
    this.displayRef = document.getElementById('display-canvas')
    this.displayCtx = this.displayRef.getContext('2d')

    this.assistRef = document.getElementById('assist-canvas')
    this.assistCtx = this.assistRef.getContext('2d')
  },
  methods: {
    changeColor(color) {
      const { r, g, b, a } = color.rgba
      this.config.lineColor = `rgba(${r}, ${g}, ${b}, ${a})`
    },
    changeLineShape(e){
      this.config.lineRadius50 = false
      let shape = e.target.dataset.shape

      switch(shape){
        case 'solid':
          this.config.lineCap='butt'
          this.config.lineShape = 'solid'
          this.config.radius = '0px'
          this.config.lineDash = [0,0]
          break
        case 'radius':
          this.config.lineCap = 'round'
          this.config.lineShape = 'solid'
          this.config.radius = this.config.lineWidth/2+'px'
          this.config.lineDash = [0,0]
          break
        case 'radius50':
          this.config.lineRadius50 = true
          this.config.lineShape = 'solid'
          this.config.radius = '50%'
          this.config.lineDash = [0,0]
          this.clickLine()
          break
        case 'dashed':
          this.config.lineDash = [12,10]
          this.config.lineShape = 'dashed'
          this.config.radius = '0px'
          break
      }
    },
    colseDropDown(){
      this.showColorPicker = this.showLineShape = false
    },
    clickUndo(){
      this.colseDropDown()
      let currentData = this.recordsQueue.pop()
      if(currentData){
        this.recordsQueue.unshift(currentData)
        let preData = this.recordsQueue[this.recordsQueue.length-1]
        if(preData){ //!=0
          this.displayCtx.putImageData(preData,0,0) //恢复前一次状态
        } else { //===0
          this.clipDesktop()
        }
      }else{
        this.recordsQueue.push(currentData) //0
      }
    },
    clickRedo(){
      this.colseDropDown()

      let nextData = this.recordsQueue.shift()
      if(nextData){
        this.displayCtx.putImageData(nextData,0,0)
        this.recordsQueue.push(nextData)
      }else{
        this.recordsQueue.unshift(nextData) //0
      }
    },
    recordAndClearEvents(){
      let currentData = this.displayCtx.getImageData(0,0,this.canvasWidth,this.canvasHeight)
      this.recordsQueue.push(currentData)

      document.onmousemove = null
      document.onmouseup = null
    },
    setStyle(){
      this.displayCtx.lineWidth = this.config.lineWidth
      this.displayCtx.strokeStyle = this.config.lineColor
      this.displayCtx.shadowColor = this.config.lineColor
      this.displayCtx.shadowBlur = this.config.shadowBlur
      this.displayCtx.lineCap = this.config.lineCap
      this.displayCtx.setLineDash(this.config.lineDash)

      this.assistCtx.lineWidth = this.config.lineWidth
      this.assistCtx.strokeStyle = this.config.lineColor
      this.assistCtx.shadowColor = this.config.lineColor
      this.assistCtx.shadowBlur = this.config.shadowBlur
      this.assistCtx.lineCap = this.config.lineCap
      this.assistCtx.setLineDash(this.config.lineDash)
    },
    clickSquare(){
      this.colseDropDown()
      this.assistRef.style.cursor = "crosshair"

      this.assistRef.onmousedown = e => {
        let x1 = e.clientX,
            y1 = e.clientY,
            left = this.canvasX,
            top = this.canvasY,
            X = x1-left, //相对于画布，起点X
            Y = y1-top //相对于画布，起点Y
        //设置样式
        this.setStyle()
        //开始绘制
        // this.assistCtx.beginPath()
        this.assistCtx.moveTo(X,Y)

        //bind mousemove
        let x2,y2
        document.onmousemove = e => {
          x2 = e.clientX
          y2 = e.clientY

          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight)
          this.assistCtx.beginPath()
          this.assistCtx.rect(X,Y,x2-x1,y2-y1)
          this.assistCtx.stroke()
        }

        document.onmouseup = () => {
          //清空辅助画布并绘制到显示画布
          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight)
          this.displayCtx.strokeRect(X,Y,x2-x1,y2-y1)
          //记录当前的状态并清理事件
          this.recordAndClearEvents()
          //------
        }
      }
    },
    clickCircle(){ //椭圆也可以用贝赛尔曲线绘制
      this.colseDropDown()
      this.assistRef.style.cursor = this.config.lineRadius50 ? this.featherCursor:'crosshair'

      this.assistRef.onmousedown = e => {
        let x1 = e.clientX,
            y1 = e.clientY,
            left = this.canvasX,
            top = this.canvasY,
            X = x1-left, //相对于画布，起点X
            Y = y1-top //相对于画布，起点Y
        //设置样式
        this.setStyle()
        //开始绘制
        // this.assistCtx.beginPath()
        this.assistCtx.moveTo(X,Y)

        //bind mousemove
        let w,h
        document.onmousemove = e => {
          w = e.clientX - x1
          h = e.clientY - y1

          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight)
          this.assistCtx.beginPath()
          if(this.config.lineRadius50){//模拟radius50%直线
            this.assistCtx.ellipse(X+w/2,Y+h/2,Math.abs(w/2),this.config.lineWidth/2,0, 0, 2 * Math.PI)
          }else{
            this.assistCtx.ellipse(X+w/2,Y+h/2,Math.abs(w/2),Math.abs(h/2),0, 0, 2 * Math.PI) //centerx,centery,long radius,short radius,start angle,end angle
          }
          this.assistCtx.stroke()
        }

        document.onmouseup = () => {
          //清空辅助画布，绘制到显示画布
          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight)

          this.displayCtx.beginPath()
          if(this.config.lineRadius50){ //模拟radius50%直线
            this.displayCtx.ellipse(X+w/2,Y+h/2,Math.abs(w/2),this.config.lineWidth/2,0, 0, 2 * Math.PI)
          }else{
            this.displayCtx.ellipse(X+w/2,Y+h/2,Math.abs(w/2),Math.abs(h/2),0, 0, 2 * Math.PI)
          }
          this.displayCtx.stroke()

          //记录当前的状态并清理事件
          this.recordAndClearEvents()
          //------
        }
      }
    },
    clickArrow(){
      this.colseDropDown()
      this.assistRef.style.cursor = this.featherCursor

      this.assistRef.onmousedown = e =>{
        let x1 = e.clientX,
            y1 = e.clientY,
            left = this.canvasX,
            top = this.canvasY,
            X = x1-left,
            Y = y1-top
        //设置样式
        this.setStyle()

        //绘制过程
        let X2,Y2,a1,b1,a2,b2,a3,b3
        document.onmousemove = e => {
          X2 = e.clientX - left;
          Y2 = e.clientY - top;

          //获得箭头的坐标点
          [a1,b1,a2,b2,a3,b3] = arrowCoordinate(X,Y,X2,Y2)
          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight) //这行不要可以绘制散射线
          this.assistCtx.beginPath()
          this.assistCtx.moveTo(X,Y)
          this.assistCtx.lineTo(X2,Y2)
          this.assistCtx.moveTo(a2,b2)
          this.assistCtx.lineTo(a1,b1)
          this.assistCtx.lineTo(X2,Y2)
          this.assistCtx.lineTo(a3,b3)
          this.assistCtx.lineTo(a2,b2)
          this.assistCtx.stroke()
        }
        document.onmouseup = () => {
          //清空辅助画布并绘制到显示画布
          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight)
          this.displayCtx.beginPath()
          this.displayCtx.moveTo(X,Y)
          this.displayCtx.lineTo(X2,Y2)
          this.displayCtx.moveTo(a2,b2)
          this.displayCtx.lineTo(a1,b1)
          this.displayCtx.lineTo(X2,Y2)
          this.displayCtx.lineTo(a3,b3)
          this.displayCtx.lineTo(a2,b2)
          this.displayCtx.stroke()

          //记录当前的状态并清理事件
          this.recordAndClearEvents()
          //------
        }
      }
    },
    clickLine(){
      this.colseDropDown()
      this.assistRef.style.cursor = this.featherCursor
      if(this.config.lineRadius50){
        this.clickCircle()
        return
      }
      this.assistRef.onmousedown = e =>{
        let x1 = e.clientX,
            y1 = e.clientY,
            left = this.canvasX,
            top = this.canvasY,
            X = x1-left,
            Y = y1-top
        //设置样式
        this.setStyle()

        //绘制过程
        let X2,Y2
        document.onmousemove = e => {
          X2 = e.clientX - left
          Y2 = e.clientY - top

          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight) //这行不要可以绘制散射线
          this.assistCtx.beginPath()
          this.assistCtx.moveTo(X,Y)
          this.assistCtx.lineTo(X2,Y2)
          this.assistCtx.stroke()
        }
        document.onmouseup = () => {
          //清空辅助画布并绘制到显示画布
          this.assistCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight)
          this.displayCtx.beginPath()
          this.displayCtx.moveTo(X,Y)
          this.displayCtx.lineTo(X2,Y2)
          this.displayCtx.stroke()

          //记录当前的状态并清理事件
          this.recordAndClearEvents()
          //------
        }
      }
    },
    clickText(){
      this.colseDropDown()
      this.assistRef.style.cursor = "text"
      this.inputText = true

      this.assistRef.onmousedown = (e) => {
        let x = e.clientX,y=e.clientY
        const textInput = document.createElement('div')
        textInput.className = 'textInput'
        textInput.contentEditable = true
        textInput.style.position = 'absolute'
        textInput.style.left = x + 'px'
        textInput.style.top = y + 'px'
        textInput.style.zIndex = 9999
        textInput.style.color = this.config.lineColor
        textInput.style.padding = '5px'
        textInput.style.lineHeight = this.fontSize + 'px'
        textInput.style.fontSize = this.fontSize + 'px'
        textInput.style.fontFamily = 'Microsoft YaHei,Sans Serif,System UI'
        textInput.style.cursor = 'text'
        textInput.onblur = this.textInputBlur
        textInput.onkeydown = this.textInputKeyDown
        this.$root.$el.appendChild(textInput)

        document.onmousemove = e => {
            textInput.style.width =  e.clientX - x + "px";
            textInput.style.height =  e.clientY - y + "px";
        }
        document.onmouseup = () => {
          textInput.focus()
          document.onmousemove = null;
          this.assistRef.onmousedown = null
        }
      }
    },
    clickBrush(){
      this.colseDropDown()
      this.assistRef.style.cursor = this.brushCursor

      this.assistRef.onmousedown = e =>{
        let x1 = e.clientX,
            y1 = e.clientY,
            left = this.canvasX,
            top = this.canvasY,
            X = x1-left,
            Y = y1-top
        //设置样式
        this.setStyle()
        //开始绘制
        // this.displayCtx.beginPath()
        this.displayCtx.moveTo(X,Y)
        //绘制过程
        document.onmousemove = e => {
          let x2 = e.clientX,
              y2 = e.clientY,
              X2 = x2 - left,
              Y2 = y2 - top
          this.displayCtx.lineTo(X2,Y2)
          this.displayCtx.stroke()
        }
      document.onmouseup = () => {
        //记录当前的状态
        let currentData = this.displayCtx.getImageData(0,0,this.canvasWidth,this.canvasHeight)
        this.recordsQueue.push(currentData)

        //记录当前的状态并清理事件
        this.recordAndClearEvents()
        //------
      }
      }
    },
    clickLineShape(){
      this.showColorPicker = false
      this.showLineShape = !this.showLineShape
    },
    clickColor(){
      this.showLineShape = false
      this.showColorPicker = !this.showColorPicker
    },
    clickRecognition(){
      this.colseDropDown()
    },
    clickNo() {
      //关闭下拉框
      this.colseDropDown()
      //初始化选择区域状态
      this.$emit('initSelect')
      //改变为适合的cursor
      this.assistRef.style.cursor = 'move'
      //清空画布
      this.recordsQueue = []
      this.displayCtx.clearRect(0,0,this.canvasWidth,this.canvasHeight)
      //清空文本框
      const textInputs = document.getElementsByClassName('textInput')
      textInputs.forEach(div=>this.$root.$el.removeChild(div))
    },
    clickYes(){
      this.colseDropDown()
      let url = this.displayRef.toDataURL('image/png')
      let img = new Image()
      img.src = url
      img.style.cssText = 'position:absolute;left:0px;top:0px'
      document.body.appendChild(img)
      navigator.clipboard.writeText(this.displayRef)
      //....
    },
    textInputBlur(e){
      if(!e.target.textContent) return

      //暂未实现改变字体大小,用文本编辑器又没多大必要
      let x = parseInt(e.target.style.left)-this.canvasX + 5  // padding 5px
      let y = parseInt(e.target.style.top)-this.canvasY + 5  //
      let divWidth = parseInt(e.target.style.width)
      let text = e.target.innerHTML  //like: 'afaf<div><br></div><div>gagdfgsdfg</div><div>hdfhh</div>'

      let rows = []
      text.split('<div>').forEach(row => (
        rows.push(row.replace(/<\/div>/g,'').replace(/<br>/g,'').replace(/&nbsp;/g,''))
        )
      )

      let totalLength = this.displayCtx.measureText(rows[0]).width //第一行
      let n = Math.ceil(totalLength/divWidth) //回车之前的文字行数
      let words = Math.floor((divWidth-10-4)/(this.fontSize+4)) //一行大约多少字符,width:padding 5 border 2 / 字体宽度+间距

      this.displayCtx.font = `${this.fontSize}px Microsoft YaHei,Sans Serif,System UI`
      this.displayCtx.strokeStyle = this.config.lineColor
      let lineGap = 2
      rows.forEach((row,index)=>{
        if(index===0){
          for(let i=1;i<=n;i++){
            let txt = ''
            for(let j in row){
              if(j< i*words && j>=(i-1)*words){
                txt+=row[j]
              }
            }
            this.displayCtx.strokeText(txt,x,y+(this.fontSize+lineGap)*i)
            txt = ''
          }
        }else{
          this.displayCtx.strokeText(row,x,y+(this.fontSize+lineGap)*(n+index))
        }
      })

      //移除dom元素
      this.$root.$el.removeChild(e.target)
      //记录当前状态
      let currentData = this.displayCtx.getImageData(0,0,this.canvasWidth,this.canvasHeight)
      this.recordsQueue.push(currentData)
    },
    textInputKeyDown(e){
      if((e.target.innerHTML==='' && e.keyCode===8)){
        this.$root.$el.removeChild(e.target)
      }
      if(e.keyCode===46){
        e.target.innerHTML = ''
        this.$root.$el.removeChild(e.target)
      }
    }
  },
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
        padding: 16px 10px 6px 10px;
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
      top:48%;
      left:55%;
      width:65%;
    }
  }
}

</style>
