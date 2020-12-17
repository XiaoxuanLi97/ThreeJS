<template>

  <div id="forgeViewer">
    <div class="customUI">
      <div class="select">
        <label for="sceneSelect">选择场景 </label>
        <select id="sceneSelect" @change="changeScene">
        <option v-for="item in optionList" :value="item.id">{{item.id}}</option>
        </select>
      </div>
      <showID :viewer="viewer"/>
      <positionEdit :viewer="viewer"/>
      <materialEdit :viewer="viewer"/>
    </div>
  </div>
</template>

<script>
import showID from "./extension/showID";
import positionEdit from "./extension/positionEdit";
import materialEdit from "./extension/materialEdit";
export default {
  name: "forge",
  components:{
    showID,
    positionEdit,
    materialEdit
  },
  data(){
    return{
      viewer:null, //初始化viewer
      optionList:[
       {
         id:'1',
         env:'Local',
         model_src: "http://bim.ndwp.net:8876/forgescene/liuzaojiangzhazhan_20190905/3d.svf"
       },
       {
         id:'2',
         env: "Local",
         model_src:
             "http://bim.ndwp.net:8876/forgescene/wuzaojiangzha_1/3d.svf"
       },
       {
         id:'3',
         env: "Local",
         model_src:
             "http://bim.ndwp.net:8888/forgeviewer/liuzaojiangzhazhan/svf/3d.svf"
       }
       ]
    }
  },
  methods:{
    //初始化查看器
    init(options){
      Autodesk.Viewing.Initializer(options,()=>{
        let htmlDiv = document.getElementById('forgeViewer');
        this.viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv,{});
        let startedCode = this.viewer.start();
        if (startedCode > 0){
          console.error('Fail to create a Viewer:WebGL not supported');
          return;
        }
        console.log('Initialization complete, loading a model next...');
      });
      this.loadScene(options)
    },

    //加载场景
    loadScene(options) {
      let htmlDiv = document.getElementById('forgeViewer');
      let config = {
        extensions:['TemplateExtension']
      }
      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(htmlDiv, config);
      Autodesk.Viewing.Initializer(options, () => {
        this.viewer.initialize(); //创建DOM和canvas元素，设置WebGL
        this.viewer.loadModel(options.model_src); //加载模型到查看器中
      })
    },

    //切换场景
    changeScene(){
      let e = document.getElementById('sceneSelect').value
      this.optionList.forEach(value => {
        if (value.id === e){
          this.loadScene(value)
          setTimeout(()=>{
            this.getElementId()
          },200)
        }
      })
    },
  },
  mounted(){
    this.init(this.optionList[0])
  }
}
</script>

<style scoped>
body{
  margin: 0;
}
#forgeViewer{
  width: 100%;
  height: 100%;
  margin: 0;
  backgroud-color:#F0F8FF;
  font-weight: bold;
  font-family:Verdana,serif;
}

.select {
  position: center;
  width: 100px;
  color: #f4f4f4;
  background-color: rgba(34, 34, 34, 0.94);
  box-shadow: 1px 3px 10px 0 rgba(0, 0, 0, 0.3);
  outline: none;
  border-radius: 3px;

}

.customUI{
  position: absolute;
  z-index: 2;
  left: 20px;
  top: 20px;
  line-height: 24px;
}


</style>