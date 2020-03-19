/* eslint-disable no-case-declarations */
/**
 * 基于MutationObserver实现一个简单的DOM变更记录、停止记录以及撤销、恢复功能。
 */

export default  class Observer {
  constructor(targetNode,config){
    this.targetNode = targetNode
    this.config = {
      attributes: true,
      childList: true ,
      subtree:true,
      attributeOldValue:true,
      ...config
    }
    this.undoAttr = false //标志是否在撤销style

    this.mutationRecords = []
    const callback = (mutationsList) => {
      for(let mutation of mutationsList) {
        console.log(this.mutationRecords);
        console.log(mutation);

        let { type ,target,addedNodes,removedNodes,attributeName,oldValue} = mutation

        switch (type) {
          case "childList": // attributeName:null
            if (addedNodes.length!==0){
              addedNodes.forEach(node=>{
                this.mutationRecords.push({
                  type,
                  node,
                  operation:'add',
                  status:'canUndo'
                })
              })
            }
            if(removedNodes.length!==0){
              removedNodes.forEach(node=>{
                this.mutationRecords.unshift({
                  type,
                  node,
                  operation:'remove',
                  status:'canRedo'
                })
              })
            }
            break;

          case "attributes":
            //撤销style的时候，不要自动记录撤销记录,撤销的对象通过unshift到左边去
            if(attributeName==='style' && !this.undoAttr){
              this.mutationRecords.push({
                  type,
                  node:target,
                  oldValue,
                  status:'canUndo'
              })
            }
            this.undoAttr = false
            break;

          default:
              break;
        }
      }
    }
    this.observer = new MutationObserver(callback)
  }

  observe(){
    this.observer.observe(this.targetNode,this.config)
  }
  disconnect(){
    this.observer.disconnect()
  }

  undo(){
    if(this.mutationRecords.length===0) return false

    let {status} = this.mutationRecords[this.mutationRecords.length-1]

    if(status==='canUndo'){
      let { type,operation, node,oldValue } = this.mutationRecords.pop()
      switch (type) {
        case 'childList':
          operation==='add'?
          this.targetNode.removeChild(node) : this.targetNode.appendChild(node) //取pop项的反操作
          break;

        case 'attributes':
          this.undoAttr = true
          this.mutationRecords.unshift({type,node,newValue:node.style.cssText,status:'canRedo'}) // pop出来的样式放在左边，以备恢复用
          node.style = oldValue //注意不能和上行代码交换位置，不然style无法恢复
          break;

        default:
          break;
      }
    }
  }

  redo(){
    if(this.mutationRecords.length===0) return false

    let {status} = this.mutationRecords[0]

    if(status==='canRedo'){
      let {type,operation,node,newValue } = this.mutationRecords.shift()
      switch (type) {
        case 'childList':
          operation==='remove'?
          this.targetNode.appendChild(node) : this.targetNode.removeChild(node)
          break;

        case 'attributes':
          node.style = newValue
          break

        default:
          break;
      }
    }
  }
  takeRecords(){
    this.mutationRecords = []
    this.observer.takeRecords()
  }
}
