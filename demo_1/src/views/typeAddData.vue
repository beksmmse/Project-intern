<template>
    <div class="detail" id="#">
        <div class="detail-add">

        </div>
    </div>
</template>


<script>

</script>

<style>
 #body{
    padding: 0%;
    margin: 0;
 }
</style>


<!-- 
<form @submit.prevent="applyFilter" class="space-y-2 max-w-md">
    <input v-model="filters.organization_id" type="number" placeholder="Organization ID" class="border p-1 w-full" />
    <input v-model="filters.name" type="text" placeholder="Name" class="border p-1 w-full" />
    <input v-model="filters.description" type="text" placeholder="Description" class="border p-1 w-full" />
    
    <select v-model="filters.geometry_type" class="border p-1 w-full">
      <option value="">All Geometry Types</option>
      <option v-for="type in geometryTypes" :key="type" :value="type">{{ type }}</option>
    </select>

    <button type="submit" class="bg-black text-white px-4 py-1">Filter</button>
  </form> -->