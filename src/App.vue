<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    ></v-app-bar>
    <v-main>
      <v-container>
        <BuildImage/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import BuildImage from './components/BuildImage';

export default {
  name: 'App',

  components: {
    BuildImage,
  },

  data: () => ({
    //
  }),
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
textarea { resize: vertical; }
</style>
