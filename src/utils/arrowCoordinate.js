/**
 * 计算箭头坐标，需要鼠标mousedown坐标点(x1，y1）、鼠标移动坐标点(x2,y2)
 * 假设箭头(对称的一半)与直线夹角15*c，夹角两边长分别为l1=20,l2=10
 */

 export default (x1,y1,x2,y2)=>{
   const  l1 = 20,l2=12,angle=Math.PI/12
   //计算移动点与点击点之间的角度
   const rotate = Math.atan2(y2-y1,x2-x1)
   //计算箭头三个点的坐标，第四个点为鼠标移动点
   const a1 = x2 - l1*Math.sin(Math.PI/2-rotate-angle)
   const b1 = y2 - l1*Math.cos(Math.PI/2-rotate-angle)

   const a2 = x2 - l2*Math.cos(rotate)
   const b2 = y2 - l2*Math.sin(rotate)

   const a3 = x2 - l1*Math.cos(rotate-angle)
   const b3 = y2 - l1*Math.sin(rotate-angle)

   return [a1,b1,a2,b2,a3,b3]
 }
