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
      let input = document.getElementById('selectedId').value
      this.viewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          ()=>{
            //显示ID
            this.selectedId = String(this.viewer.getSelection())
            input = this.viewer.getSelection()
          }
      )
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
    },200)

  }
}
</script>

<style scoped>

</style>