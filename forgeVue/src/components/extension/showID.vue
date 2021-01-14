<template>
  <div id="showID">
    <span>---输入ID/在模型中选择---</span><br>
    <label for="selectedId">构件ID:</label>
    <input type="text" id="selectedId" :value="selectedId" size="5" @input="findElement"/>
  </div>

</template>

<script>
export default {
  name: "showID",
  props:{
    viewer:null
  },
  data(){
    return{
      selectedId:null, //当前选中的构件ID
    }
  },
  methods:{
    //显示选中构件的ID
    getElementId(){
      let input = document.getElementById('selectedId').value;
      this.viewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          ()=>{
            //显示ID
            this.selectedId = String(this.viewer.getSelection());
            input = this.viewer.getSelection();
            // this.getProperty()
          }
      )
    },
    getProperty(){

      // 遍历dbid
      function getAllDbid(model) {
        let instanceTree = model.getData().instanceTree
        return Object.keys(instanceTree.nodeAccess.dbIdToIndex)
      }

      let model = this.viewer.impl.modelQueue().getModels();

      model.map(model=>{
        console.log(getAllDbid(model))
      })

      // 修改单独构件颜色
      // let sel = this.viewer.getSelection();
      // const color = new THREE.Vector4(1, 0, 0, 1);
      // this.viewer.setThemingColor(sel[0], color)
      // console.log(sel)
    },
    //根据ID找到构件
    findElement(){
      let input = document.getElementById('selectedId').value;
      this.viewer.select(Number(input))
    },

  },
  mounted() {
    setTimeout(()=>{
      this.getElementId()
    },20)

  }
}
</script>

<style scoped>

</style>
