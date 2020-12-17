<template>
  <div>
    <button @click="openUI">编辑材质</button>
    <div v-show="showUI">

    </div>
  </div>
</template>

<script>
export default {
  name: "materialEdit",
  props:{
    viewer:null
  },
  data(){
    return{
      showUI:false //是否显示材质编辑
    }
  },
  methods:{
    openUI(){
      if (this.viewer.getSelection().length === 0){
        alert('请选择一个有效的构件')
        this.showUI = false
      }
      else {
        this.showUI = !this.showUI
      }
    },
  }

}
</script>

<style scoped>

</style>