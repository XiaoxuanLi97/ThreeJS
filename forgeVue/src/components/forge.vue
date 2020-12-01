<template>
  <div id="forgeViewer">
    <div id="select">
      <label for="sceneSelect">选择场景 </label>
      <select id="sceneSelect" @change="changeScene">
      <option v-for="item in optionList" :value="item.id">场景{{item.id}}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: "forge",
  data(){
    return{
      viewer:null,
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
             "http://bim.ndwp.net:8876/forgescene/kongpuzhazhan/svf/3d.svf"
       }
       ]
    }
  },
  methods:{
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
      this.load(options)
    },
    load(options) {
      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(document.getElementById('forgeViewer'), {});
      Autodesk.Viewing.Initializer(options, () => {
        this.viewer.initialize(); //创建DOM和canvas元素，设置WebGL
        this.viewer.loadModel(options.model_src); //加载模型到查看器中
      })
    },

    changeScene(){
      let e = document.getElementById('sceneSelect').value
      this.optionList.forEach(value => {
        if (value.id === e){
          this.load(value)
        }
      })
    }
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
}

#select {
  position: absolute;
  z-index: 2;
  right: 20px;
  top: 20px;
  color: #f4f4f4;
  background-color: rgba(34, 34, 34, 0.94);
  box-shadow: 1px 3px 10px 0 rgba(0, 0, 0, 0.3);
  outline: none;
  border-radius: 3px;
  font-weight: bold;
  font-family:Verdana,serif;
}
</style>