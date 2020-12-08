<template>
  <div id="forgeViewer">
    <div class="customUI">
      <div class="select">
        <label for="sceneSelect">选择场景 </label>
        <select id="sceneSelect" @change="changeScene">
          <option v-for="item in optionList" :value="item.id">{{item.id}}</option>
        </select>
      </div>

        <span>---输入ID/在模型中选择---</span><br>
        <label for="selectedId">选中的构件ID:</label>
        <input type="text" id="selectedId" :value="selectedId" size="5" @input="findElement"/>

      <div class="button">
        <button @click="StartEdit">开始编辑</button>
        <button @click="EndEdit">结束编辑</button>
      </div>

        <div v-show="show" class="editTable">
          <table>
            <thead>
            <tr>
              <th/>
              <th>平移(米)</th>
              <th>旋转(度)</th>
              <th>缩放(倍)</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>x</td>
              <td><label><input id="xMove" size="5" value=0 @change="move"></label></td>
              <td><label><input id="xRotate" size="5" value=0 @change="rotate"></label></td>
              <td><label><input id="xMagnify" size="5"></label></td>
            </tr>
            <tr>
              <td>y</td>
              <td><label><input id="yMove" size="5" value=0 @change="move"></label></td>
              <td><label><input id="yRotate" size="5" value=0 @change="rotate"></label></td>
              <td><label><input id="yMagnify" size="5"></label></td>
            </tr>
            <tr>
              <td>z</td>
              <td><label><input id="zMove" size="5" value=0 @change="move"></label></td>
              <td><label><input id="zRotate" size="5" value=0 @change="rotate"></label></td>
              <td><label><input id="zMagnify" size="5"></label></td>
            </tr>

            <tr>
              <td>复位</td>
              <td><button id="moveRestore" @click="moveRestore">平移</button></td>
              <td><button id="rotateRestore" @click="move">旋转</button></td>
              <td><button id="magnifyRestore" @click="move">缩放</button></td>
            </tr>

            <tr>
              <td colspan="2">透明度</td>
              <td colspan="2">
                <label for="myRange"></label>
                <input id="myRange" type="range" min="0" max="1" step="0.01" @change="setTransparency" value=0 />
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
  </div>
</template>

<script>
import transform from './extension/edit'
export default {
  name: "forge",
  data(){
    return{
      show:false, //透明度滑动条是否显示
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

    StartEdit(){
      let n = document.getElementById('selectedId').value.length
      if (n === 0 ){
        alert('请选择一个有效的构件')
        this.show = false
      }
      else
        this.show = true
        this.getFragId()
        this.viewer.loadExtension('TemplateExtension')

    },

    EndEdit(){
      this.show = false
      this.viewer.unloadExtension('TemplateExtension')
      this.viewer.clearSelection()
    },

    //显示选中构件的ID
    getElementId(){
      let input = document.getElementById('selectedId').value
      this.viewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          ()=>{
            this.selectedId = String(this.viewer.getSelection())
            input = this.viewer.getSelection()
            console.log(input)
          }
      )
    },

    //根据ID找到构件
    findElement(){
      let input = document.getElementById('selectedId').value;
      this.viewer.select(Number(input))

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
    },

    //根据输入的xyz移动构件
    move(x,y,z){
      const fragIdList = this.getFragId();
      x = Number(document.getElementById('xMove').value);
      y = Number(document.getElementById('yMove').value);
      z = Number(document.getElementById('zMove').value);

      fragIdList.forEach((fragId)=> {
        const center = new THREE.Vector3(x,y,z);
        const model = this.viewer.model;
        const fragProxy = this.viewer.impl.getFragmentProxy(model, fragId)
        fragProxy.getAnimTransform();
        fragProxy.position = new THREE.Vector3(
            center.x,
            center.y,
            center.z,
        );
        fragProxy.updateAnimTransform();
        console.log('position：'+fragProxy.position)
      })

      this.viewer.impl.sceneUpdated(true);
    },

    //复原移动
    moveRestore(){
      document.getElementById('xMove').value = 0;
      document.getElementById('yMove').value = 0;
      document.getElementById('zMove').value = 0;
      this.move()
    },

    rotate(x,y,z){
     function radius(d){
        return d*(Math.PI/180)
     }

      x = document.getElementById('xRotate').value
      y = document.getElementById('yRotate').value
      z = document.getElementById('zRotate').value

      x = radius(x)
      y = radius(y)
      z = radius(z)

      const fragList = this.getFragId();
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle( new THREE.Vector3(1,0,0), x)
      quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0), y)
      quaternion.setFromAxisAngle( new THREE.Vector3(0,0,1), z)

      fragList.forEach((fragId, index)=>{
        const fragProxy = this.viewer.impl.getFragmentProxy(this.viewer.model, fragId);
        fragProxy.getAnimTransform();
        const position = new THREE.Vector3(
             fragProxy.position.x,
             fragProxy.position.y,
             fragProxy.position.z
        );
        position.applyQuaternion(quaternion);
        fragProxy.position = position;
        fragProxy.quaternion.multiplyQuaternions(quaternion,fragProxy.quaternion);

        if (index === 0 ){
          const euler = new THREE.Euler();
          euler.setFromQuaternion (fragProxy.quaternion , 0);
        }
        fragProxy.updateAnimTransform();
      })
      this.viewer.impl.sceneUpdated(true);
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