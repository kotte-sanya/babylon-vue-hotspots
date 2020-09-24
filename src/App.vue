<template>
  <div id="app" data-app>
    <Hotspots3D :json="jsonContent" @showModal="modalShow"/>
    <!-- <GLGrid1/> -->
    <!-- <GLGrid2/> -->
    <v-row justify="center">
      <v-dialog v-model="dialogShow" persistent max-width="290">
        <v-card>
          <v-card-title class="headline">Use Google's location service?</v-card-title>
          <v-card-text>Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-1" text @click="dialogShow = false">Disagree</v-btn>
            <v-btn color="green darken-1" text @click="dialogShow = false">Agree</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Hotspots3D from './components/Hotspots3D.vue'
  // import GLGrid1 from '@/components/GlGrid1.vue'
  // import GLGrid2 from '@/components/GLGrid2.vue'

export default {
  name: 'App',
  components: {
    Hotspots3D,
    // GLGrid1,
    // GLGrid2,
  },
  data(){
    return {
      dialogShow: false,
      jsonContent: {
        "location": "./",
        "fileName": "VirtualBooth-8-NoPlants.gltf",
        "background": "09.jpg",
        "hotspots": [
            {
              "image": ".//MapPin.png",
              "type": "video",
              "x": 5.126, 
              "y": 2.819,
              "z": -0.7,
              "width": 0.5,
              "height": 0.5,                
            },
            {
              "image": "./MapPin.png",
              "type": "video",
              "x": 4.126, 
              "y": 2.819,
              "z": -0.7,
              "width": 0.5,
              "height": 0.5,  
            },
            {
              "image": "./MapPin.png",
              "type": "video",
              "x": 3.126, 
              "y": 2.819,
              "z": -0.7,
              "width": 0.5,
              "height": 0.5,  
            }
        ]
      },
      
    }
  },
  methods:{
    modalShow(msg){
      this.dialogShow = true;
    }
  }
}
</script>

<style>
  @import "../node_modules/ag-grid-community/dist/styles/ag-grid.css";
  @import "../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";
  html, body {
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
