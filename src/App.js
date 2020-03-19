import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { remote } from 'electron'

Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

Vue.config.productionTip = false

const {width:screenWidth,height:screenHeight} = remote.screen.getPrimaryDisplay().size

new Vue({
  data(){
    return{
      screenWidth,
      screenHeight
    }
  },
  render: h => h(App),
}).$mount('#app')
