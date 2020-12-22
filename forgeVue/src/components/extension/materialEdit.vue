<template>
  <div>
    <button @click="openUI">编辑材质</button>
    <div v-show="showUI" class="positionEdit">
      <table>
        <tbody>
        <tr>
          <td><label for="type">材质类型</label></td>
          <td><input id="type" type="text" disabled="disabled" v-model="property.type"></td>
        </tr>

        <tr>
          <td><label for="id">材质ID</label></td>
          <td><input id="id" type="text" disabled="disabled" v-model="property.ID"></td>
        </tr>

        <tr>
          <td><label for="visibility">是否可见</label></td>
          <td><input id="visibility" type="checkbox" checked="checked" @change="materialEdit"></td>
        </tr>

        <tr>
          <td><label for="opacity">透明度</label></td>
          <td>0<input id="opacity" type="range" min="0" max="1" step="0.01" v-model="property.opacity" @change="materialEdit"/>1</td>
        </tr>

        <tr>
          <td><label for="shininess">高光亮度</label></td>
          <td>0<input id="shininess" type="range" min="0" max="1" step="0.01" v-model="property.shininess" @change="materialEdit"/>1</td>
        </tr>


        <tr>
          <td colspan="2">
           <label for="colorEdit">颜色编辑对象</label>
           <select name="" id="colorEdit" @change="switchRBG">
             <option value="1">材料色</option>
             <option value="2">高光色</option>
           </select>
          </td>
        </tr>

        <tr v-show="showColor">
          <td><label for="colorR">Red</label></td>
          <td>0<input id="colorR" type="range" min="0" max="1" step="0.01" v-model="property.color.r" @change="materialEdit"/>1</td>
        </tr>

        <tr v-show="showColor">
          <td><label for="colorG">Green</label></td>
          <td>0<input id="colorG" type="range" min="0" max="1" step="0.01" v-model="property.color.g" @change="materialEdit"/>1</td>
        </tr>

        <tr v-show="showColor">
          <td><label for="colorB">Blue</label></td>
          <td>0<input id="colorB" type="range" min="0" max="1" step="0.01" v-model="property.color.b" @change="materialEdit"/>1</td>
        </tr>

        <tr v-show="showSpecular">
          <td><label for="specularR">Red</label></td>
          <td>0<input id="specularR" type="range" min="0" max="1" step="0.01" v-model="property.specular.r" @change="materialEdit"/>1</td>
        </tr>

        <tr v-show="showSpecular">
          <td><label for="specularG">Green</label></td>
          <td>0<input id="specularG" type="range" min="0" max="1" step="0.01" v-model="property.specular.g" @change="materialEdit"/>1</td>
        </tr>

        <tr v-show="showSpecular">
          <td><label for="specularB">Blue</label></td>
          <td>0<input id="specularB" type="range" min="0" max="1" step="0.01" v-model="property.specular.b" @change="materialEdit"/>1</td>
        </tr>
        </tbody>
      </table>

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
      showColor:true, //是否显示材料颜色编辑
      showSpecular:false, //是否显示高光颜色编辑
      showUI:false, //是否显示材质编辑
      property:{ //需要编辑的材质属性
        type:null,
        ID:null,
        opacity:1,
        color:{
          r:1,
          g:1,
          b:1
        },
        specular:{
          r:0,
          g:0,
          b:0
        },
        shininess:0,
        shading:0,
      },
    }
  },
  methods:{

    //打开关闭材质编辑界面
    openUI(){
      if (this.viewer.getSelection().length === 0){
        alert('请选择一个有效的构件')
        this.showUI = false
      }
      else {
        this.showUI = !this.showUI
        this.getMaterial()
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

    //编辑材料
    materialEdit(){
      let fragList = this.viewer.model.getFragmentList(),
          transparency = Number(this.property.opacity),
          shininess = Number(this.property.shininess),
          colorR = this.property.color.r,
          colorG = this.property.color.g,
          colorB = this.property.color.b,
          specularR =this.property.specular.r,
          specularG =this.property.specular.g,
          specularB =this.property.specular.b,
          visible = document.getElementById('visibility').checked,
          fragIds = this.getFragId();

      fragIds.forEach((fragId) => {
        let material = fragList.getMaterial(fragId);
        if (material.type === 'MeshPhongMaterial') {
          material.opacity = transparency; //调节一种材料的透明度，所有相同材料构件的透明度都会调整
          material.color = {r:colorR,g:colorG,b:colorB};
          material.specular = {r:specularR,g:specularG,b:specularB};
          material.shininess = shininess * 100;
          material.visible = visible;
          material.transparent = true;
          material.needsUpdate = true;
        }
      })
      this.viewer.impl.invalidate(true, true, true)
    },


    //获取材料信息显示在编辑UI上
    getMaterial(){
      let fragList = this.viewer.model.getFragmentList(),
          fragIds = this.getFragId();

      fragIds.forEach((fragId) => {
        let material = fragList.getMaterial(fragId);
        if (material.type === 'MeshPhongMaterial') {
          this.property.type = 'MeshPhongMaterial'
          this.property.ID = material.id
          this.property.opacity = material.opacity
          this.property.color = material.color
          this.property.specular = material.specular
          this.property.shininess = material.shininess / 100
          this.property.wireframe = material.wireframe
        }
      })
    },

    //颜色下拉选择切换
    switchRBG(){
      let val = document.getElementById('colorEdit').value
      switch (val){
        case '1':
          this.showColor = true
          this.showSpecular = false
          break
        case '2':
          this.showColor = false
          this.showSpecular = true
          break
      }
    }
  },
  mounted() {
    setTimeout(()=>{
      this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          ()=>{this.getMaterial()
      })
    },200)

  }

}
</script>

<style scoped>
.positionEdit{
  background: lightgrey;
}

table{
  background: lightgrey;
  border: 1px solid black;
  border-collapse: collapse;
  border-spacing: 0;
}

th,td{
  border: 1px solid #e9e9e9;
  text-align: center;
}

th{
  background-color: cornflowerblue;
  color: black;
  font-weight:600;
}
</style>