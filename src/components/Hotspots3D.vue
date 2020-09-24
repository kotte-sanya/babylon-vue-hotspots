<template>
  <div>
    <canvas id="renderCanvas" ref="canvas"></canvas>
    <div id="customLoadingScreenDiv" v-if="isLoading">Loading...</div>
  </div>
</template>

<script>
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import * as GUI from 'babylonjs-gui';
import 'babylonjs-materials';

export default {
  name: 'Hotspots3D',
  props: {
    json: Object,
  },
  data(){
    return {
      canvas: null,
      engine: null,
      scene: null,
      sceneToRender: null,
      isLoading: true,
    }
  },
  methods:{
    createDefaultEngine(){
      return new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    },
    displayLoadingUI(){
      this.isLoading = true;
    },
    hideLoadingUI(){
      this.isLoading = false;
    },
    init(){
      try {
        this.engine = this.createDefaultEngine();
      } catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        this.engine = this.createDefaultEngine();
      }
      if (!this.engine) throw 'engine should not be null.';
      this.scene = this.delayCreateScene();
      this.sceneToRender = this.scene;

      this.engine.runRenderLoop( () => {
        if (this.sceneToRender) {
          this.sceneToRender.render();
        }
      });

      window.addEventListener("resize", () => {
        this.engine.resize();
      });
    },
    delayCreateScene() {
      this.displayLoadingUI();
      let scene = new BABYLON.Scene(this.engine);

      let heightOffset = 3; 
      let initialDistance = 5;
      let rotationalDistanceOffset = 5;
      let rotationalHeightOffset = 1;
      let horizontalRotationalLimit = 360; 
      let verticalRotationalLimit = 360;


      /****CAMERA SYSTEM SETUP****/
      let camera = new BABYLON.ArcRotateCamera("Camera", 0, 1, 5, new BABYLON.Vector3(0, rotationalHeightOffset, -rotationalDistanceOffset), scene);
      camera.setPosition(new BABYLON.Vector3(0, heightOffset, initialDistance+rotationalDistanceOffset));
      camera.wheelPrecision = 100;
      camera.allowUpsideDown = true;
      camera.attachControl(this.canvas, true);
      camera.inertia = 0.9;
      camera.lowerAlphaLimit = camera.alpha - BABYLON.Tools.ToRadians(horizontalRotationalLimit); 
      camera.upperAlphaLimit = camera.alpha + BABYLON.Tools.ToRadians(horizontalRotationalLimit);
      camera.lowerBetaLimit = camera.beta - BABYLON.Tools.ToRadians(verticalRotationalLimit);
      camera.upperBetaLimit = camera.beta + BABYLON.Tools.ToRadians(verticalRotationalLimit);
      camera.lowerRadiusLimit = initialDistance-4.5;
      camera.upperRadiusLimit = initialDistance+10;
      camera.useBouncingBehavior = true;

      var skydome = BABYLON.Mesh.CreateSphere('dome', 64, 620, scene);
      skydome.scaling = new BABYLON.Vector3(1.5, .5, 1.5);
      skydome.position.y = -30;
      var env_mat = new BABYLON.StandardMaterial("domemat", scene);
      var envtext = new BABYLON.Texture(this.json.background, scene);
      env_mat.diffuseTexture = envtext;
      env_mat.diffuseTexture.vScale = -1;
      env_mat.emissiveTexture = envtext;
      env_mat.emissiveColor = new BABYLON.Color3(1,1,1);
      env_mat.backFaceCulling = false;
      skydome.material = env_mat;

      let hotspotsArray = [];

      this.json.hotspots.forEach((item) => {

        /****SETUP FOR ANIMATED PINS****/
        let hotspot = BABYLON.MeshBuilder.CreateBox("hotspot", {width:item.width, height:item.height, depth: 0.00001}, scene);
        hotspot.position = new BABYLON.Vector3(item.x, item.y, item.z);
        let hotspotMat = new BABYLON.StandardMaterial("hotspotMat", scene);
        hotspotMat.emissiveColor = BABYLON.Color3.White();
        hotspotMat.diffuseTexture = new BABYLON.Texture(item.image, scene);
        hotspot.material = hotspotMat;
        hotspotMat.diffuseTexture.hasAlpha = true; 
        hotspot.setEnabled(false);

        /****ADD ANIMATION TO PIN****/
        let animationPin = new BABYLON.Animation("pinAnimation", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let pinKeys = [];
        pinKeys.push({ frame: 0, value: 2.819});
        pinKeys.push({ frame: 30, value: 3});
        pinKeys.push({ frame: 60, value: 2.819});
        animationPin.setKeys(pinKeys);
        hotspot.animations.push(animationPin);
        scene.beginAnimation(hotspot, 0, 60, true);

        /****ADD ANIMATION TO HOVERPLANE****/
        let animationHover = new BABYLON.Animation("hoverAnimation", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        let hoverKeys = [];// Animation keys
        hoverKeys.push({ frame: 0, value: 0});
        hoverKeys.push({ frame: 15, value: 0.2});
        animationHover.setKeys(hoverKeys);

        /****TRIGGER HOVER ANIMATION ON HOVER AND OUT ON NON-HOVER****/
        let actionManager = new BABYLON.ActionManager(scene);
        hotspot.actionManager = actionManager;
        actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){
            scene.beginAnimation(hotspot, 0, 15, false);
        }));
        //if hover is over remove highlight of the mesh
        actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            scene.beginAnimation(hotspot, 15, 0, false);
        }));
        
        actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (ev)=>{
            this.$emit('showModal', 'hotspots clicked !');
        }));

        hotspotsArray.push(hotspot);
      })

      /****ASSET IMPORTS****/
      BABYLON.SceneLoader.ImportMesh("", this.json.location, this.json.fileName, scene, ()=> {
        console.log("onSuccess");
        hotspotsArray.forEach((item) => {
          item.setEnabled(true);
        });
        this.hideLoadingUI();
      });

      return scene;
    }
  },
  mounted(){
    this.canvas = this.$refs.canvas;
    this.init();
  }
}
</script>

<style scoped>
  #renderCanvas {
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  #customLoadingScreenDiv{
    position: absolute;
    left: calc(50% - 102px);
    top: 0px;
    color: white;
    font-size:50px;
    text-align:center;
    padding-top: 20%;
  }
</style>
