<script lang="ts" setup>
defineOptions({name: 'AppView'})

</script>

<template>
  <section>
    <router-view>
      <template #default="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
      </template>
    </router-view>
  </section>
</template>
