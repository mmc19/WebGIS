<template>
  <div class="view">
    <div id="container"></div>
    <div class="input-card" style="width: 12rem">
      <h4 style="text-align: center">推荐浏览路线</h4>
      <div class="input-item" style="padding: 0 26px 0 26px">
        <button class="btn" @click="startAnimation">开始动画</button>
      </div>
    </div>
    <div id="panel"></div>
  </div>
</template>

<script>
import AMapLoader from "@amap/amap-jsapi-loader";
import { getData, saveData, deleteData } from "../../api/geojson.js";
window._AMapSecurityConfig = {
  securityJsCode: "d52d364d6c0eab94febc450c8e7e82e5",
};
export default {
  name: "MapContainer",
  data() {
    return {
      map: null,
      marker: null,
      geojson: null,
    };
  },
  methods: {
    initMap() {
      AMapLoader.load({
        key: "	6a21bbfd9d30a0737c843b5f6227ed8c", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
          "AMap.ToolBar",
          "AMap.Scale",
          "AMap.ControlBar",
          "AMap.GeoJSON",
        ], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
      })
        .then((AMap) => {
          this.map = new AMap.Map("container", {
            //设置地图容器id
            viewMode: "3D", //是否为3D地图模式
            pitch: 0,
            zooms: [5, 18], //设置地图级别范围
            zoom: 13, //初始化地图级别
            center: [119.287137, 26.094633], //初始化地图中心点位置
          });
          this.map.addControl(
            new AMap.ToolBar({
              position: {
                top: "130px",
                right: "50px",
              },
            })
          );
          this.map.addControl(new AMap.Scale());
          this.map.addControl(
            new AMap.ControlBar({
              position: {
                top: "20px",
                right: "20px",
              },
            })
          );

          //   //定义一个全局变量，用来保存geojson
          this.geojson = new AMap.GeoJSON({
            geoJSON: null,
          });

          //判断localStorage是否存在数据，存在则把数据取出
          if (JSON.stringify(getData()) != "[]") {
            console.log("localStorage有数据");
            this.geojson.importData(getData()); //导入数据

            //恢复旧点的点击事件
            this.geojson.eachOverlay((item) => {
              item.on("click", () => {
                let ext = item.getExtData();
                ext._geoJsonProperties.click++;
                saveData(this.geojson.toGeoJSON());
                console.log(ext._geoJsonProperties.click);

                // if (confirm("是否要删除")) {
                //   this.map.remove(item);
                //   deleteData(this.geojson.toGeoJSON());
                // }
              });
            });
          } else {
            console.log("localStorage没有数据");
          }

          //把geojson数据添加到地图中
          this.map.add(this.geojson);

          //监听地图的点击事件
          this.map.on("click", (e) => {
            this.marker = new AMap.Marker({
              position: e.lnglat,
              extData: {
                _geoJsonProperties: {
                  gid: this.geojson.getOverlays().length + 1,
                  click: 0,
                },
              },
            });
            //给点击的点绑定点击事件
            this.marker.on("click", (e) => {
              let ext = this.marker.getExtData();
              ext._geoJsonProperties.click++;
              saveData(this.geojson.toGeoJSON());
              // console.log(click);
            });
            //通过geojson管理地图覆盖物
            this.geojson.addOverlay(this.marker);
            // console.log("geojson", this.geojson);

            //保存数据(将geojson对象转换为标准的GeoJSON格式对象)
            saveData(this.geojson.toGeoJSON());
            // console.log(e);
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },
    computeDistance() {
      var m1 = this.marker1.getPosition();
      var m2 = this.marker2.getPosition();
      var textPos = m1.divideBy(2).add(m2.divideBy(2));
      var distance = Math.round(m1.distance(m2));
      var path = [m1, m2];
      this.line.setPath(path);
      this.text.setText("两点相距" + distance + "米");
      this.text.setPosition(textPos);
    },
    startAnimation() {
      //实现路径规划
      AMap.plugin(["AMap.Driving", "AMap.MoveAnimation"], () => {
        let driving = new AMap.Driving({
          map: this.map,
          policy: AMap.DrivingPolicy.LIST_TIME, //驾车策略
          panel: "panel",
        });
        //设置起点和终点
        let start = new AMap.LngLat(119.320467, 26.114639);
        let end = new AMap.LngLat(119.390528, 25.986219);
        // console.log(start, "start");
        let opts = {
          waypoints: [], //设置途径点
        };
        this.geojson.eachOverlay((item) => {
          // console.log(item._position);
          opts.waypoints.push(item._position); //将途径点的经纬度存放到waypoints中
        });

        // console.log(opts, "opts");
        driving.search(start, end, opts, (status, result) => {
          if (status == "complete") {
            // console.log(result);
            let lineArr = [];
            result.routes[0].steps.forEach((item) => {
              lineArr.push(...item.path);
            });
            //创建小车动画实例对象
            let marker = new AMap.Marker({
              map: this.map,
              position: start,
              icon: "https://webapi.amap.com/images/car.png",
              offset: new AMap.Pixel(-26, -23),
              autoRotation: true,
              angle: -180,
            });
            let passedPolyline = new AMap.Polyline({
              map: this.map,
              strokeColor: "#AF5",
              strokeWeight: 6,
            });
            marker.on("moving", (e) => {
              passedPolyline.setPath(e.passedPath);
            });
            this.map.setFitView();
            marker.moveAlong(lineArr, {
              duration: 0,
              autoRotation: true,
            });
          } else {
            console.error("规划出错");
          }
        });
      });
    },
  },
  mounted() {
    this.initMap();
  },
};
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
.view {
  width: 100%;
  height: 90%;
}
#panel {
  position: fixed;
  background-color: white;
  max-height: 90%;
  overflow-y: auto;
  top: 10%;
  left: 10px;
  width: 280px;
}
#panel .amap-lib-driving {
  border-radius: 4px;
  overflow: hidden;
}
</style>