<template>
  <div class="toolbar">
    <b-button-group>
      <b-button @click="$emit('switchDrag')">
        <span>🌸</span>
      </b-button>
      <b-button v-for="(item,index) in items" :key="index" @click="clickButton(item)">
        <span>
          <b-icon :icon="item.icon" flip-h v-if="index===0"></b-icon>
          <b-icon :icon="item.icon" v-else></b-icon>
        </span>
      </b-button>
    </b-button-group>
  </div>
</template>

<script>
import brush from '../assets/brush.svg'
import feather from '../assets/feather.svg'
import picker from '../assets/picker.svg'

export default {
  data() {
    return {
      items: [
        {
          content: "撤销",
          icon: "reply-fill"
        },
        {
          content: "恢复",
          icon: "reply-fill"
        },
        {
          content: "矩形",
          icon: "square"
        },
        {
          content: "圆形",
          icon: "circle"
        },
        {
          content: "箭头",
          icon: "arrow-right"
        },
        {
          content: "直线",
          icon: "dash"
        },
        {
          content: "文本",
          icon: "fonts"
        },
        {
          content: "涂鸦",
          icon: "brush"
        },
        {
          content: "颜色",
          icon: "pen"
        },
        {
          content: "历史",
          icon: "images"
        },
        {
          content: "取消",
          icon: "x"
        },
        {
          content: "确定",
          icon: "check"
        }
      ],
      square:{
        startX:0,
        startY:0,
        width:0,
        height:0,
        drawing:false,
        color:'#d63200'
      },
      observer: null
    };
  },
  methods: {
    clickButton(item) {
      this.$emit('closeDrag') //点击工具按钮后，选区不可再移动
      const captureRegion = document.getElementById('captureRegion')
      if (item.content === "取消") {
        this.$emit('initSelect')
        captureRegion.style.cursor = 'move'

      } else if (item.content === "矩形") {
        captureRegion.style.cursor = "crosshair"
        captureRegion.onmousedown = e => {
          this.square.drawing = true;
          this.square.startX = e.clientX;
          this.square.startY = e.clientY;
          const square = document.createElement('div')
          square.style.position = 'absolute'
          square.style.border = `2px ${this.square.color} solid`
          square.style.zIndex = 99
          this.$root.$el.appendChild(square)

          document.onmousemove = e => {
            if (this.square.drawing) {
              const width = e.clientX - this.square.startX; //可能反向选区,就为负数
              const height = e.clientY - this.square.startY;
              this.square.width = width
              this.square.height = height
              square.style.width = this.square.width + "px";
              square.style.height = this.square.height + "px";
              square.style.left = this.square.startX + "px";
              square.style.top = this.square.startY + "px";
            }
          }
          document.onmouseup = () => {
            document.onmousemove = null;
            this.square.drawing = false;
          };
        }
      } else if (item.content === "圆形") {
        captureRegion.style.cursor = "crosshair"
      } else if (item.content === "箭头") {
        captureRegion.style.cursor = `url(${feather}),default`
      } else if (item.content === "直线") {
        captureRegion.style.cursor = `url(${feather}),default`
      } else if (item.content === "文本") {
        captureRegion.style.cursor = "text"
      } else if (item.content === "涂鸦") {
        captureRegion.style.cursor = `url(${brush}),default`
      } else if (item.content === "颜色") {
        captureRegion.style.cursor = `url(${picker}),default`
      } else if (item.content === "撤销") {
       return
      }
    }
  },
  mounted(){
    // Select the node that will be observed for mutations
    let targetNode = this.$root.$el

    // Options for the observer (which mutations to observe)
    let config = {
        attributes: true,
        childList: true,
        subtree: true
    };

    // Callback function to execute when mutations are observed
    const mutationCallback = (mutationsList) => {
        for(let mutation of mutationsList) {
            let type = mutation.type;
            switch (type) {
                case "childList":
                    console.log("A child node has been added or removed.");
                    break;
                case "attributes":
                    console.log(`The ${mutation.attributeName} attribute was modified.`);
                    break;
                case "subtree":
                    console.log(`The subtree was modified.`);
                    break;
                default:
                    break;
            }
        }
    };

    // Create an observer instance linked to the callback function
    let observer = new MutationObserver(mutationCallback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
    this.observer = observer
    // Later, you can stop observing
    // observer.disconnect();
  },
  watch:{
    square(){
      console.log('records:',this.observer.takeRecords());
    }
    
  }
};
</script>

<style lang='less' scoped>
.toolbar{
  z-index: 999;
  .btn-group {
    button {
      padding-bottom: 9px;
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
</style>