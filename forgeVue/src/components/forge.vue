<template>
  <div id="forgeViewer">
      <div id="customUI">
      ID of Items selected:
        <label>
        <input type="text" id="selectedId" :value="selectedId" size="5" @input="findElement"/>
        </label>
      </div>

    <div id="button">
      <button @click="load">load</button>
      <button @click="unload">unload</button>
    </div>

    <div id="select">
      <label for="sceneSelect">Choose Scene </label>
      <select id="sceneSelect" @change="changeScene">
      <option v-for="item in optionList" :value="item.id">{{item.id}}</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: "forge",
  data(){
    return{
      selectedId:null,
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
      this.loadScene(options)
    },
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

    changeScene(){
      let e = document.getElementById('sceneSelect').value
      this.optionList.forEach(value => {
        if (value.id === e){
          this.loadScene(value)
        }
      })
    },

    load(){
      this.setTransparency()
      // this.viewer.loadExtension('TemplateExtension')
    },

    unload(){
      this.viewer.unloadExtension('TemplateExtension')
      this.viewer.clearSelection()
    },

    getElementId(){
      let input = document.getElementById('selectedId').value
      this.viewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          ()=>{
            this.selectedId = String(this.viewer.getSelection())
            input = this.viewer.getSelection()
          }
      )
    },

    findElement(){
      let input = document.getElementById('selectedId').value;
      this.viewer.select(Number(input))

    },

    setTransparency(){
      let fragIds = [],
          fragList = this.viewer.model.getFragmentList(),
          sel = this.viewer.getSelection(),
          dbId = sel[0],
          it = this.viewer.model.getData().instanceTree;
      it.enumNodeFragments(dbId,(fragId)=>{
        fragIds.push(fragId)
      });

      fragIds.forEach((fragId)=>{
            let material = fragList.getMaterial(fragId);
             if(material){
               // material.opacity -= 0.1; //调节一种材料的透明度，所有相同材料构件的透明度都会调整
               material.transparent = true;
               material.needsUpdate = true;
             }
      })
      console.log(fragIds)

      this.viewer.impl.invalidate(true,true,true)
    }
  },
  mounted(){
    this.init(this.optionList[0])

    setTimeout(()=>{
      this.getElementId()

    },200)


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

#select {
  height: 24px;
  position: absolute;
  z-index: 2;
  right: 20px;
  top: 20px;
  color: #f4f4f4;
  background-color: rgba(34, 34, 34, 0.94);
  box-shadow: 1px 3px 10px 0 rgba(0, 0, 0, 0.3);
  outline: none;
  border-radius: 3px;

}

#button{
  position: absolute;
  z-index: 2;
  right: 20px;
  top: 150px;
}

#customUI{
  position: absolute;
  z-index: 2;
  right: 20px;
  top: 200px;
}
</style>