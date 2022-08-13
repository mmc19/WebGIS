<template>
  <div id="app">
    <h3>福州一日游驾驶路线</h3>
    <MapContainer></MapContainer>
  </div>
</template>

<script>
import MapContainer from "./components/MapContainer.vue";

export default {
  name: "App",
  components: {
    MapContainer,
  },
};
</script>

<style scopde>
html,
body,
#app {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100vh;
}
h3 {
  width: 100%;
  height: 10%;
  display: inline-block;
  color: aliceblue;
  background-color: rgb(180, 235, 175);
  text-align: center;
  font-size: 3rem;
  margin: 0;
}
MapContainer {
  height: 90%;
}
</style>
