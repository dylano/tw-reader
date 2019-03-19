<template>
  <div id="app">
    <Header class="header"/>
    <router-view/>
  </div>
</template>

<script>
import Header from "./components/Header.vue";

export default {
  name: "app",
  components: {
    Header
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}

* {
  margin: 10px;
}

body {
  display: flex;
  flex-direction: column;
}

.main {
  display: flex;
  flex-direction: row;
}
</style>
