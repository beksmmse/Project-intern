
<template>
    <div>
      <h2> ลำดับที่ : {{ name }}</h2>
      <div v-if="data">
        <pre>{{ data }}</pre>
      </div>
    </div>
  </template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const name = route.query.name
const data = ref(null)

function fetchData() {
  fetch(`/api/info/${name}`)
    .then(res => res.json())
    .then(json => {
      data.value = json
    })
}

onMounted(fetchData)
</script>

