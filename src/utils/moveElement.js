/**
 * 元素拖拽移动功能
 */

export default (el,component) => {
  /** 
    :params el 拖拽的元素
    :params component 组件this作为参数传入，用于实时改变组件data
  */
  el.onmousedown = e => {
    component.completeSelectRegion = false //移动时意味着重新选区，未完成选区隐藏工具条

    // 鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器
    // 最左边的距离-物体左边框相对于浏览器最左边的距离，纵向同理
    const leftWidth = e.clientX - el.offsetLeft;
    const topHeight = e.clientY - el.offsetTop;
    

    el.onmousemove = e => {

      let posX = e.clientX - leftWidth;
      let posY = e.clientY - topHeight;
      

      // 控制拖拽物体的范围只能在浏览器视窗内，不允许出现滚动条或拖出可视区域
      if (posX < 0) {
        posX = 0
      } else if (posX > document.documentElement.clientWidth - el.offsetWidth) {
        posX = document.documentElement.clientWidth - el.offsetWidth;
      }

      if (posY < 0) {
        posY = 0
      } else if (posY > document.documentElement.clientHeight - el.offsetHeight) {
        posY = document.documentElement.clientHeight - el.offsetHeight;
      }

      // 移动时重新得到物体的距离，解决拖动时出现晃动现象  
      el.style.top = posY + "px"
      el.style.left = posX + "px"

      component.startX = posX
      component.startY = posY

      el.onmouseup = ()=> {  // 鼠标抬起时不再移动  
        // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
        // el.onmousedown = el.onmousemove = null;
        el.onmousemove = null
        component.completeSelectRegion = true //重新选取完成，显示工具条
      }
    }
  }
}