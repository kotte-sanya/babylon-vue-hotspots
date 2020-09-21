<template>
  <div id="app" data-app>
    <Hotspots3D :fileLocation="glTFLocation" :fileName="glTFName" @showModal="modalShow" :coordHotspot="coord"/>
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

export default {
  name: 'App',
  components: {
    Hotspots3D,
  },
  data(){
    return {
      dialogShow: false,
      glTFLocation:"https://dl.dropbox.com/s/ubv6bxc6esm7e7p/",
      glTFName: "VirtualBooth-8-NoPlants.gltf",
      coord: {
        url: 'https://dl.dropbox.com/s/rbbzre5la44tfnc/MapPin.png',
        x: 5.126, 
        y: 2.819,
        z: -0.7
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
  html, body {
    overflow: hidden;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
