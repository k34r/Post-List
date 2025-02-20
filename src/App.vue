<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>

    <nav>
      <RouterLink to="/"></RouterLink>
      <RouterLink to="/post"></RouterLink>
      <!-- <RouterLink to="/form">Form</RouterLink> -->
    </nav>

  </header>

  <RouterView />
</template>

<style scoped></style>
