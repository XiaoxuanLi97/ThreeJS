<template>
  <div>
    <button @click="openUI">编辑位置</button>
    <div v-show="showUI">
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
          <td colspan="4"><button @click="showRotateUI">自定义旋转</button></td>
        </tr>
        <tr v-show="showCusRotate">
          <td><button @click="getXYZ(1)">端点1</button></td>
          <td><label for="cusRotateX1">x </label><input size="5" value=0 id="cusRotateX1"></td>
          <td><label for="cusRotateY1">y </label><input size="5" value=0 id="cusRotateY1"></td>
          <td><label for="cusRotateZ1">z </label><input size="5" value=0 id="cusRotateZ1"></td>
        </tr>

        <tr v-show="showCusRotate">
          <td>
            <button @click="getXYZ(2)">端点2</button>
          </td>
          <td><label for="cusRotateX2">x </label><input maxlength="5" size="5" value=0 id="cusRotateX2"></td>
          <td><label for="cusRotateY2">y </label><input maxlength="5" size="5" value=0 id="cusRotateY2"></td>
          <td><label for="cusRotateZ2">z </label><input maxlength="5" size="5" value=0 id="cusRotateZ2"></td>
        </tr>

        <tr v-show="showCusRotate">
          <td colspan="2">旋转角度</td>
          <td colspan="2"><label for="cusRotate"></label><input size="5" value=0 id="cusRotate" @change="cusRotate"></td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "positionEdit",
  props:{
    viewer:null
  },
  data(){
    return{
      hitPoint:{ //存储点击坐标
        x:0,
        y:0,
        z:0
      },
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
    }
  },
  methods:{
    //控制编辑界面的开关
    openUI(){
      if (this.viewer.getSelection().length === 0){
        alert('请选择一个有效的构件')
        this.restore()
        this.showUI = false
        // this.viewer.unloadExtension('TemplateExtension')
      }
      else {
        this.showUI = !this.showUI
        // this.viewer.loadExtension('TemplateExtension')
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

    //根据输入的xyz移动构件
    move(){
      const fragIdList = this.getFragId();
      //计算平移
      let x = Number(document.getElementById('xMove').value),
          y = Number(document.getElementById('yMove').value),
          z = Number(document.getElementById('zMove').value),

          X = x - this.preMove.x,
          Y = y - this.preMove.y,
          Z = z - this.preMove.z;

      //更新上一次平移
      this.preMove.x = x
      this.preMove.y = y
      this.preMove.z = z

      //配置移动
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

    //xyz轴旋转构件
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

      //配置旋转
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
        fragProxy.updateAnimTransform();
        console.log(fragProxy.quaternion)
      })
      this.viewer.impl.sceneUpdated(true);
    },

    //自定义旋转
    cusRotate(){
      //获取旋转原点和角度
      const x1 = Number(document.getElementById('cusRotateX1').value),
          y1 = Number(document.getElementById('cusRotateY1').value),
          z1 = Number(document.getElementById('cusRotateZ1').value),
          x2 = Number(document.getElementById('cusRotateX2').value),
          y2 = Number(document.getElementById('cusRotateY2').value),
          z2 = Number(document.getElementById('cusRotateZ2').value),
          c = Number(document.getElementById('cusRotate').value);

      //计算自定义旋转轴方向向量
      const x = x2 - x1,
          y = y2 - y1,
          z = z2 - z1;

      //将自定义旋转轴归一化
      let m = Math.sqrt(x*x + y*y + z*z),
          xN = x/m,
          yN = y/m,
          zN = z/m;

      //计算角度
      let C = this.radius(c);

      const fragIdList = this.getFragId()
      fragIdList.forEach((fragId)=> {
        const center = new THREE.Vector3(x1,y1,z1);
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
        quaternion.setFromAxisAngle(new THREE.Vector3(xN,yN,zN),C)
        //应用旋转
        position.applyQuaternion(quaternion)
        //复原平移
        position.add(center)
        //将配置好的矩阵应用在构件位置矩阵上
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
    },

    //获取鼠标点击在模型的坐标
    getHitPoint(e){
      let screenPoint = {
        x:e.offsetX,
        y:e.offsetY
      }

      let viewport = this.viewer.navigation.getScreenViewport();

      let n = {
            x: (screenPoint.x - viewport.left) / viewport.width,
            y: (screenPoint.y - viewport.top) / viewport.height
          },

          point = this.viewer.utilities.getHitPoint(n.x, n.y);

      if (point === null){
        // console.log('鼠标点击不在模型构件上')
      }
      else{
        this.hitPoint.x = point.x.toFixed(2)
        this.hitPoint.y = point.y.toFixed(2)
        this.hitPoint.z = point.z.toFixed(2)
        // console.log(point)
      }
    },

    //传入端点坐标
    getXYZ(n){
      if (n === 1){
        document.getElementById('cusRotateX1').value = this.hitPoint.x
        document.getElementById('cusRotateY1').value = this.hitPoint.y
        document.getElementById('cusRotateZ1').value = this.hitPoint.z
      }
      else if (n === 2){
        document.getElementById('cusRotateX2').value = this.hitPoint.x
        document.getElementById('cusRotateY2').value = this.hitPoint.y
        document.getElementById('cusRotateZ2').value = this.hitPoint.z
      }
    },

    showRotateUI(){
      this.showCusRotate = !this.showCusRotate
      if(this.showCusRotate) {
        alert('获取坐标方式：<1>点击目标位置获取坐标 <2>按端点1或2上传')
      }
    }
  },
  mounted() {
    document.addEventListener('click',(e)=>{
      this.getHitPoint(e)
    })
  }

}
</script>

<style scoped>

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