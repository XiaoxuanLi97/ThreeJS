<template>
  <div>
    <button @click="openUI">编辑材质</button>
    <div v-show="showUI" class="positionEdit">
      <label for="myRange">透明度：</label>
      <input id="myRange" type="range" min="0" max="1" step="0.01" @change="setTransparency" value=1 />
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
      showUI:false, //是否显示材质编辑
      meshMaterial: new THREE.MeshBasicMaterial({
        color: 0x7777ff,
        name: 'material-1',
        opacity: 1,
        transparent: true
      })
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

    //找到选择构件的碎片ID
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

    //设置透明度
    setTransparency() {
      let fragList = this.viewer.model.getFragmentList(),
          transparency = document.getElementById('myRange').value,
          fragIds = this.getFragId();
      fragIds.forEach((fragId) => {
        // fragList.setMaterial(fragId,this.meshMaterial)
        let material = fragList.getMaterial(fragId);
        if (material) {
          material.opacity = transparency; //调节一种材料的透明度，所有相同材料构件的透明度都会调整
          material.transparent = true;
          material.needsUpdate = true;
        }
        console.log(material)
      })
      this.viewer.impl.invalidate(true, true, true)
    },
  }

}
</script>

<style scoped>
.positionEdit{
  background: lightgrey;
}
</style>