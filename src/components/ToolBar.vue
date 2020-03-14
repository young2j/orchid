<template>
<div>
    <b-button-group>
      <b-button><span>🌸</span></b-button>
      <b-button 
        v-for="(item,index) in items"
        :key="index"
        @click="cancel(item)"
      >
        <span>
          <b-icon :icon="item.icon" flip-h v-if="index===0"></b-icon>
          <b-icon :icon="item.icon" v-else></b-icon>
        </span>
      </b-button>
    </b-button-group>
  </div>

</template>

<script>
export default {
  props:{
    initSelect:Function,
    captureInfo:Object
  },
  data(){
    return {
      items:[
      {
        content:"撤销",
        icon:"reply-fill",
      },
      {
        content:"恢复",
        icon:"reply-fill",
      },
      {
        content:"矩形",
        icon:"square",
      },
      {
        content:"圆形",
        icon:"circle",
      },
      {
        content:"箭头",
        icon:"arrow-right",
      },
      {
        content:"直线",
        icon:"dash",
      },
      {
        content:"涂鸦",
        icon:"brush",
      },
      {
        content:"颜色",
        icon:"pen",
      },
      {
        content:"历史",
        icon:"images",
      },
      {
        content:"取消",
        icon:"x",
      },
      {
        content:"确定",
        icon:"check",
      }
      ]
    }
  },
  methods:{
    cancel(item){
      if(item.content==='取消'){
        this.initSelect()
        
      }
    },
  }
}
</script>

<style lang='less' scoped>
.btn-group{
  // margin-top: 60px;
  button{
    padding-bottom: 8px;
    span{
      display: inline-block;
      transform: scale(1.5);
    }
  }
}
</style>