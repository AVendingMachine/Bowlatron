<script setup lang="ts">
import Topbar from "./components/Topbar.vue";
import {RouterView} from "vue-router";


</script>

<template>
  <body>
  <header>
    <Topbar/>
  </header>
  <main>
    <RouterView/>
  </main>
  </body>
</template>

<style>
</style>



