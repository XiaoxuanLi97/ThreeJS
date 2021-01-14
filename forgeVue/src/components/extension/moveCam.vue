<template>
  <div>
    <button @click="move">移动相机</button>
  </div>
</template>

<script>
  export default {
    name: "moveCam",
    props:{
      viewer:null
    },
    methods:{
      move() {
        const nav = this.viewer.navigation
        const up = new THREE.Vector3(0, 0, 1)
        // const pos = this.viewer.navigation.getPosition()
        // const newPos = new THREE.Vector3(pos.x - 0.01, pos.y, pos.z)
        // nav.setCameraUpVector(up)
        // nav.setPosition(newPos)
        // requestAnimationFrame(this.move)

        const p1 = new THREE.Vector3( 90.55735165910825, -122.06692902760328, 61.713300659900575)
        const p2 = new THREE.Vector3( 90.16651500447352, -175.68117109274402, 77.7238006141242)
        const curve = this.addLines(p1, p2).curve
        const points = curve.getPoints(100)
        let index = 0

        nav.setPosition(p1)
        nav.setView(p1, p2)
        nav.setCameraUpVector(up)
        console.log(nav.getPosition())

        // let a=setInterval(function () {
        //   let current = new THREE.Vector3(points[index].x,points[index].y,points[index].z)
        //   let next = new THREE.Vector3(points[index+1].x,points[index+1].y,points[index+1].z)
        //   nav.setPosition(current);
        //   console.log(index);
        //   nav.setView(current, next)
        //   index++;
        //   if(index>50){
        //     clearInterval(a);
        //   }
        // },50);

      },
      addLines(v0, v3) {
        // 计算向量夹角
        let angle = v0.angleTo(v3) * 270 / Math.PI / 10; // 0 ~ Math.PI
        let aLen = angle * 50,
            hLen = angle * angle * 120;
        let p0 = new THREE.Vector3(0, 0, 0);

        // 开始，结束点
        // let v0 = groupDots.children[0].position;
        // let v3 = groupDots.children[1].position;

        // 法线向量
        let rayLine = new THREE.Ray(p0, this.getVCenter(v0.clone(), v3.clone()));

        // 顶点坐标
        let vtop = rayLine.at(hLen / rayLine.at(1).distanceTo(p0));

        // 控制点坐标
        let v1 = this.getLenVector(v0.clone(), vtop, aLen);
        let v2 = this.getLenVector(v3.clone(), vtop, aLen);

        // 绘制贝塞尔曲线
        let curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3);
        let geo = new THREE.Geometry();
        geo.vertices = curve.getPoints(50);
        let mat = new THREE.LineBasicMaterial({color: 0xff0000});

        return {
          curve: curve,
          lineMesh: new THREE.Line(geo, mat)
        };
      },
      getVCenter(v1, v2) {
        let v = v1.add(v2);
        return v.divideScalar(2);
      },
      // 计算V1，V2向量固定长度的点
      getLenVector(v1, v2, len) {
        let v1v2Len = v1.distanceTo(v2);
        return v1.lerp(v2, len / v1v2Len);
      }
    }
  }
</script>

<style scoped>

</style>
