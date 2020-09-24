import Vue from 'vue';
import vuetify from '@/plugins/Vuetify';
// import 'ag-grid-enterprise';
import App from './App.vue';


Vue.config.productionTip = false

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app')
