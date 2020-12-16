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
        <label for="selectedId">构件ID:</label>
        <input type="text" id="selectedId" :value="selectedId" size="5" @input="findElement"/>

        <div v-show="showUI" class="editTable">
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
              <td><label><input id="xMove" size="5" value=0 @change="move(1)"></label></td>
              <td><label><input id="xRotate" size="5" value=0 @change="rotate(1)"></label></td>
              <td><label><input id="xMagnify" size="5" value=1 @change="magnify"></label></td>
            </tr>
            <tr>
              <td>y</td>
              <td><label><input id="yMove" size="5" value=0 @change="move(1)"></label></td>
              <td><label><input id="yRotate" size="5" value=0 @change="rotate(2)"></label></td>
              <td><label><input id="yMagnify" size="5" value=1 @change="magnify"></label></td>
            </tr>
            <tr>
              <td>z</td>
              <td><label><input id="zMove" size="5" value=0 @change="move(1)"></label></td>
              <td><label><input id="zRotate" size="5" value=0 @change="rotate(3)"></label></td>
              <td><label><input id="zMagnify" size="5" value=1 @change="magnify"></label></td>
            </tr>

            <tr>
              <td colspan="2">透明度</td>
              <td colspan="2">
                <label for="myRange"></label>
                <input id="myRange" type="range" min="0" max="1" step="0.01" @change="setTransparency" value=1 />
              </td>
            </tr>

            <tr>
              <td colspan="4"><button @click="expandCusRotate">自定义旋转</button></td>
            </tr>
            <tr v-show="showCusRotate">
              <td>旋转原点</td>
              <td><label for="cusRotateX0">x </label><input size="5" value=0 id="cusRotateX0" @change=""></td>
              <td><label for="cusRotateY0">y </label><input size="5" value=-7.12 id="cusRotateY0" @change=""></td>
              <td><label for="cusRotateZ0">z </label><input size="5" value=-7.65 id="cusRotateZ0" @change=""></td>
            </tr>

            <tr v-show="showCusRotate">
              <td>旋转方向</td>
              <td><label for="cusRotateX">x </label><input size="5" value=1 id="cusRotateX"></td>
              <td><label for="cusRotateY">y </label><input size="5" value=0 id="cusRotateY"></td>
              <td><label for="cusRotateZ">z </label><input size="5" value=0 id="cusRotateZ"></td>
            </tr>

            <tr v-show="showCusRotate">
              <td>旋转角度</td>
              <td colspan="3"><label for="cusRotate"></label><input size="5" value=0 id="cusRotate" @change="cusRotate"></td>
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
      preRotate:{ //记录上一次的旋转角度
        x:0,
        y:0,
        z:0,
        c:0
      },
      preMove:{ //记录上一次平移的大小
        x:0,
        y:0,
        z:0,
      },
      showCusRotate:false, //自定义旋转UI是否显示
      showUI:false, //构件编辑UI是否显示
      selectedId:null, //当前选中的构件ID
      viewer:null, //初始化viewer
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
             "http://bim.ndwp.net:8888/forgeviewer/liuzaojiangzhazhan/svf/3d.svf"
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

    //打开编辑界面
    openUI(){
      if (this.viewer.getSelection().length === 0){
        this.restore();
        this.EndEdit();
      }
      else
        this.StartEdit();
    },

    StartEdit(){
      let n = document.getElementById('selectedId').value.length
      this.showUI = n !== 0;
        this.getFragId()
        this.viewer.loadExtension('TemplateExtension')

    },

    EndEdit(){
      this.showUI = false
      this.viewer.unloadExtension('TemplateExtension')
      this.viewer.clearSelection()
      this.restore()
    },


    //显示选中构件的ID
    getElementId(){
      let input = document.getElementById('selectedId').value
      this.viewer.addEventListener(
          Autodesk.Viewing.SELECTION_CHANGED_EVENT,
          ()=>{
            this.selectedId = String(this.viewer.getSelection())
            input = this.viewer.getSelection()
            this.restore()
            console.log(input)
            // console.log(" >LJason< 日志：点击位置",this.viewer.clientToWorld(Event.offsetX,Event.offsetY,false).intersectPoint);
          }
      )
    },

    //根据ID找到构件
    findElement(){
      let input = document.getElementById('selectedId').value;
      this.viewer.select(Number(input))
      this.openUI()
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

    //xyz方向旋转
    move(){
      let x = Number(document.getElementById('xMove').value),
          y = Number(document.getElementById('yMove').value),
          z = Number(document.getElementById('zMove').value);
      this.moveBasic(x,y,z)
    },

    //根据输入的xyz移动构件
    moveBasic(x,y,z){
      const fragIdList = this.getFragId();
      //计算平移
      let X = x - this.preMove.x,
          Y = y - this.preMove.y,
          Z = z - this.preMove.z;

      //更新上一次平移
      this.preMove.x = x
      this.preMove.y = y
      this.preMove.z = z

      fragIdList.forEach((fragId)=> {
        const center = new THREE.Vector3(X,Y,Z);
        const model = this.viewer.model;
        const fragProxy = this.viewer.impl.getFragmentProxy(model, fragId)
        fragProxy.getAnimTransform();
        fragProxy.position = new THREE.Vector3(
            fragProxy.position.x - center.x,
            fragProxy.position.y - center.y,
            fragProxy.position.z - center.z,
        );
        console.log(fragProxy)
        fragProxy.updateAnimTransform();
        this.viewer.impl.sceneUpdated(true);
      })
    },

    //角度转弧度
    radius(d) {
      return d * (Math.PI / 180)
    },

    //xyz旋转构件
    rotate(n) {
      //获取输入的旋转角度
      let x = Number(document.getElementById('xRotate').value),
          y = Number(document.getElementById('yRotate').value),
          z = Number(document.getElementById('zRotate').value),

      //模型旋转的角度为输入的旋转角度和上一次旋转角度的差值
          X = this.radius(x - this.preRotate.x),
          Y = this.radius(y - this.preRotate.y),
          Z = this.radius(z - this.preRotate.z);

      //更新新的上一次旋转角度
      this.preRotate.x = x
      this.preRotate.y = y
      this.preRotate.z = z


      //获取碎片开始旋转
      const fragList = this.getFragId();
      const quaternion = new THREE.Quaternion();

      //判断旋转轴
      if (n === 1){
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), X)
      }
      else if (n === 2){
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Y)
      }
      else if (n === 3){
        quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Z)
      }

      fragList.forEach((fragId)=>{
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
        // if (index === 0 ){
        //   const euler = new THREE.Euler();
        //   euler.setFromQuaternion (fragProxy.quaternion , 0);
        // }
        fragProxy.updateAnimTransform();
        console.log(fragProxy.quaternion)
      })
      this.viewer.impl.sceneUpdated(true);

    },

    //自定义旋转
    cusRotate(){
     //获取旋转原点和角度
      let x = Number(document.getElementById('cusRotateX0').value),
          y = Number(document.getElementById('cusRotateY0').value),
          z = Number(document.getElementById('cusRotateZ0').value),
          c = Number(document.getElementById('cusRotate').value),

      //自定义旋转轴方向
          xCus = Number(document.getElementById('cusRotateX').value),
          yCus = Number(document.getElementById('cusRotateY').value),
          zCus = Number(document.getElementById('cusRotateZ').value);

      //将自定义旋转轴归一化
      const m = Math.sqrt(xCus*xCus + yCus*yCus + zCus*zCus),
          xC = xCus/m,
          yC = yCus/m,
          zC = zCus/m;

      //计算角度
      let C = this.radius(c);

      const fragIdList = this.getFragId()

      fragIdList.forEach((fragId)=> {
        const center = new THREE.Vector3(x,y,z);
        const model = this.viewer.model;
        const fragProxy = this.viewer.impl.getFragmentProxy(model, fragId)
        fragProxy.getAnimTransform();

        //每次旋转前初始化位置与旋转四元数
        fragProxy.position = new THREE.Vector3(0,0,0);
        fragProxy.quaternion = new THREE.Quaternion(0,0,0,1)

        //应用平移
        const position = new THREE.Vector3(
            fragProxy.position.x - center.x,
            fragProxy.position.y - center.y,
            fragProxy.position.z - center.z,
        );

        //设置旋转四元数
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(new THREE.Vector3(xC,yC,zC),C)
        //应用旋转
        position.applyQuaternion(quaternion)
        //复原平移
        position.add(center)
        //讲配置好的矩阵应用在构件位置矩阵上
        fragProxy.position = position
        fragProxy.quaternion.multiplyQuaternions(quaternion,fragProxy.quaternion)

        fragProxy.updateAnimTransform()
        // console.log(fragProxy.position,fragProxy.quaternion)
      })
      this.viewer.impl.sceneUpdated(true);
    },

    //放大构件
    magnify(){
      const fragIdList = this.getFragId();
      let x = Number(document.getElementById('xMagnify').value),
          y = Number(document.getElementById('yMagnify').value),
          z = Number(document.getElementById('zMagnify').value);

      fragIdList.forEach((fragId)=> {
        const model = this.viewer.model;
        const fragProxy = this.viewer.impl.getFragmentProxy(model, fragId)
        fragProxy.getAnimTransform();
        fragProxy.scale.x = x;
        fragProxy.scale.y = y;
        fragProxy.scale.z = z;
        fragProxy.updateAnimTransform();
      })

      this.viewer.impl.sceneUpdated(true);

    },

    //复原参数
    restore(){
      this.preRotate.x = 0
      this.preRotate.y = 0
      this.preRotate.z = 0
      this.preRotate.c = 0
      this.preMove.x = 0
      this.preMove.y = 0
      this.preMove.z = 0
      document.getElementById('xMove').value = 0
      document.getElementById('yMove').value = 0
      document.getElementById('zMove').value = 0
      document.getElementById('xRotate').value = 0
      document.getElementById('yRotate').value = 0
      document.getElementById('zRotate').value = 0
      document.getElementById('xMagnify').value = 1
      document.getElementById('yMagnify').value = 1
      document.getElementById('zMagnify').value = 1
      document.getElementById('cusRotateX').value = 0
      document.getElementById('cusRotateY').value = 0
      document.getElementById('cusRotateZ').value = 0
    },

    //展开自定义旋转界面
    expandCusRotate(){
      this.showCusRotate = !this.showCusRotate
    },

  },
  mounted(){
    this.init(this.optionList[0])

    document.addEventListener('click',()=>{
      this.openUI()
    })

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