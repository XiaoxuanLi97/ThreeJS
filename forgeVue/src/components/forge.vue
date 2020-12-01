<template>
  <div id="forgeViewer"></div>
</template>

<script>
export default {
  name: "forge",
  data(){
    return{
     viewer:[],
     options:{
        env:'Local',
        model_src: "http://bim.ndwp.net:8876/forgescene/liuzaojiangzhazhan_20190905/3d.svf"
      }
    }
  },
  methods:{
    init(){
      Autodesk.Viewing.Initializer(this.options,()=>{
        let htmlDiv = document.getElementById('forgeViewer');
        this.viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv,{});
        let startedCode = this.viewer.start();
        if (startedCode > 0){
          console.error('Fail to create a Viewer:WebGL not supported');
          return;
        }
        console.log('Initialization complete, loading a model next...');
      });


      this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(document.getElementById('forgeViewer'),{});
      Autodesk.Viewing.Initializer(this.options, () => {
        this.viewer.initialize(); //创建DOM和canvas元素，设置WebGL
        this.viewer.loadModel(this.options.model_src); //加载模型到查看器中
      })
    }
  },
  mounted(){
    this.init();
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
</style>