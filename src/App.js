import Vue from 'vue'
import App from './App.vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { remote } from 'electron'
import Store from 'electron-store'


Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

Vue.config.productionTip = false

const store = new Store({name:'settings'})

const {
  width: screenWidth,
  height: screenHeight,
} = remote.screen.getPrimaryDisplay().size

new Vue({
  data() {
    return {
      screenWidth,
      screenHeight,
      theme:store.get('theme') || 'dark',
      showColorTip: store.get('showColorTip'),
      showMessage: store.get('showMessage'),
      savePath: store.get('savePath') || remote.app.getPath('pictures'),
      playSound: store.get('playSound'),
      captureColor: store.get('captureColor') || "#ffffff"
    }
  },
  render: h => h(App),
}).$mount('#app')
