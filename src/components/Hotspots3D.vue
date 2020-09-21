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
    fileLocation: String,
    fileName: String,
    coordHotspot: Object,
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
      let horizontalRotationalLimit = 60; 
      let verticalRotationalLimit = 5;
      let debug = true;


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

        /****SKYBOX SETUP****/
      let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
      let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
      skyboxMaterial.backFaceCulling = false;
      skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
      skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
      skyboxMaterial.diffuseColor = BABYLON.Color3.Black();
      skyboxMaterial.specularColor = BABYLON.Color3.Black();
      skybox.material = skyboxMaterial;

      /****HITBOX SETUP - TEST CUBE - 1****/
      let hitboxTest = BABYLON.MeshBuilder.CreateBox("hb1", {height: 1, width: 1, depth: 0.25}, scene);
      hitboxTest.position = new BABYLON.Vector3(0, 1.75, 1.5);
      let hitboxTestMat = new BABYLON.StandardMaterial("testMaterial", scene);
      hitboxTestMat.emissiveColor = BABYLON.Color3.Red();
      hitboxTest.material = hitboxTestMat;
      if(!debug){
          hitboxTestMat.alpha = 0;
      }
      hitboxTest.setEnabled(false);

      /****SETUP FOR ANIMATED PINS****/
      var pinPlane1 = BABYLON.MeshBuilder.CreatePlane("pinPlane1", {width:0.5, height:0.5}, scene);
      pinPlane1.position = new BABYLON.Vector3(this.coordHotspot.x, this.coordHotspot.y, this.coordHotspot.z);
      var pinPlane1Mat = new BABYLON.StandardMaterial("pinPlane1Mat", scene);
      pinPlane1Mat.emissiveColor = BABYLON.Color3.White();
      pinPlane1Mat.diffuseTexture = new BABYLON.Texture(this.coordHotspot.url, scene);
      pinPlane1.material = pinPlane1Mat;
      pinPlane1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      pinPlane1Mat.diffuseTexture.hasAlpha = true; 
      pinPlane1.setEnabled(false);

      /****ADD ANIMATION TO PIN****/
      var animationPin = new BABYLON.Animation("pinAnimation", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      var pinKeys = [];
      pinKeys.push({ frame: 0, value: 2.819});
      pinKeys.push({ frame: 30, value: 3});
      pinKeys.push({ frame: 60, value: 2.819});
      animationPin.setKeys(pinKeys);
      pinPlane1.animations.push(animationPin);
      scene.beginAnimation(pinPlane1, 0, 60, true);

      /****ADD ANIMATION TO HOVERPLANE****/
      var animationHover = new BABYLON.Animation("hoverAnimation", "material.alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
      var hoverKeys = [];// Animation keys
      hoverKeys.push({ frame: 0, value: 0});
      hoverKeys.push({ frame: 15, value: 0.2});
      animationHover.setKeys(hoverKeys);

      /****TRIGGER HOVER ANIMATION ON HOVER AND OUT ON NON-HOVER****/
      let actionManager = new BABYLON.ActionManager(scene);
      pinPlane1.actionManager = actionManager;
      actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){
          scene.beginAnimation(pinPlane1, 0, 15, false);
          console.log("Hover On");
      }));
      //if hover is over remove highlight of the mesh
      actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
          scene.beginAnimation(pinPlane1, 15, 0, false);
          console.log("Hover Off");
      }));
      
      actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (ev)=>{
          this.$emit('showModal', 'hotspots clicked !');
      }));

      /****ASSET IMPORTS****/
      BABYLON.SceneLoader.ImportMesh("", this.fileLocation, this.fileName, scene, ()=> {
        console.log("onSuccess");
        pinPlane1.setEnabled(true);
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
