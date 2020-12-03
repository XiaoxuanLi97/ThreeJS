<template>
  <div id="forgeViewer">
      <div id="customUI">
        <div id="select">
          <label for="sceneSelect">Choose Scene </label>
          <select id="sceneSelect" @change="changeScene">
            <option v-for="item in optionList" :value="item.id">{{item.id}}</option>
          </select>
        </div>

        <span>---Type ID or choose in model---</span><br>
        <label for="selectedId">ID of component selected:</label>
        <input type="text" id="selectedId" :value="selectedId" size="5" @input="findElement"/>

        <div id="button">
        <button @click="StartEdit">StartEdit</button>
        <button @click="EndEdit">EndEdit</button>
        </div>

        <div v-show="show">
        <label for="myRange">Transparency: </label>
        <input id="myRange" type="range" min="0" max="1" step="0.01" @change="setTransparency" value=0 />
        </div>
      </div>


  </div>
</template>

<script>
export default {
  name: "forge",
  data(){
    return{
      show:false,
      currentOpacity:0,
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
          setTimeout(()=>{
            this.getElementId()

          },200)

        }
      })
    },

    StartEdit(){
      this.show = true
      this.getFragId()
      this.viewer.loadExtension('TemplateExtension')
    },

    EndEdit(){
      this.show = false
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

    getFragId() {
      let fragIds = [],
          sel = this.viewer.getSelection(),
          dbId = sel[0],
          it = this.viewer.model.getData().instanceTree;
      it.enumNodeFragments(dbId, (fragId) => {
        fragIds.push(fragId)
      });
      return fragIds
    },

    setTransparency() {
      let fragList = this.viewer.model.getFragmentList(),
          transparency = document.getElementById('myRange').value,
          fragIds = this.getFragId();
      fragIds.forEach((fragId) => {
        let material = fragList.getMaterial(fragId);
        if (material) {
          // this.currentOpacity = material.opacity
          material.opacity = transparency; //调节一种材料的透明度，所有相同材料构件的透明度都会调整
          material.transparent = true;
          material.needsUpdate = true;
        }
        console.log(material)

      })
      this.viewer.impl.invalidate(true, true, true)
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
  width: 165px;
  color: #f4f4f4;
  background-color: rgba(34, 34, 34, 0.94);
  box-shadow: 1px 3px 10px 0 rgba(0, 0, 0, 0.3);
  outline: none;
  border-radius: 3px;

}

#customUI{
  position: absolute;
  z-index: 2;
  right: 20px;
  top: 150px;
  line-height: 24px;
}

</style>