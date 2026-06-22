<script setup lang="ts">

import {propTypes} from "@/common/utils/propTypes";

defineOptions({name: 'Icon'})


const props = defineProps({
  // icon name
  icon: propTypes.string,
  // icon color
  color: propTypes.string,
  // icon size
  size: propTypes.number.def(20),
  // icon svg class
  svgClass: propTypes.string.def('')
})


const symbolId = computed(() => {
  return `#icon-${props.icon}`
})


</script>

<template>
  <svg
      class="icon v-icon"
      :style="{ width: size + 'px', height: size + 'px', color: color}"
      aria-hidden="true"
  >
    <use :xlink:href="symbolId"/>
  </svg>


</template>

<style lang="scss" scoped>
//background:color,padding: '0.1em',borderRadius: '0.8'

.icon {
  fill: currentColor;
  overflow: hidden;
}

.v-icon {
  //FE8F66  50DFB2  ac7fe4 FF4D4F B3B4B6 5D87FF 5147FF
  //color: #FF4D4F;
  //color: #FF4D4F;
  cursor: pointer;
  // color: white;
  // --tw-text-opacity: 1;
  // color: rgb(169 183 198 / var(--tw-text-opacity, 1));
  

}


</style>