import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Chart from 'primevue/chart';

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

import '@fortawesome/fontawesome-free/css/all.min.css'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

const app = createApp(App)

app.use(PrimeVue, {
    unstyled: true
})

app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Button', Button)
app.component('Chart', Chart);

app.use(router)
app.mount('#app')