<script setup lang="ts">
import Topbar from "./components/Topbar.vue";
import { RouterView } from "vue-router";


</script>

<template>
  <header>
    <Topbar/>
  </header>
  <body>
  <RouterLink to="/">HELP</RouterLink>
  <RouterLink to="/SecondView">gorp</RouterLink>
    <RouterView/>

  </body>
</template>

<style>
</style>



