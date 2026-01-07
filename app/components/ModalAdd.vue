<template>
    <UModal v-model:open="open" title="Tambah Lokasi" description="Tambahkan lokasi fiber coverage.">
        <UButton
            icon="i-lucide-plus"
            size="lg"
            class="w-12 h-12 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-full hover:bg-gray-100 hover:text-gray-800 transition"
            variant="solid"
        />
        <template #body>
        <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
        >
            <UFormField label="Nama" name="name">
                <UInput v-model="state.name" class="w-full" placeholder="Nama" />
            </UFormField>
            <UFormField label="Alamat" name="address">
                <UTextarea v-model="state.address" class="w-full" placeholder="Alamat" />
            </UFormField>
            <div class="grid grid-cols-2 gap-2">
                <UFormField label="Longitude" name="longitude" required>
                    <UInput v-model="state.longitude" type="number" class="w-full" placeholder="Longitude" />
                </UFormField>
                <UFormField label="Latitude" name="latitude" required>
                    <UInput v-model="state.latitude" type="number" class="w-full" placeholder="Latitude" />
                </UFormField>
            </div>
            <UFormField label="Type" name="type" required>
                <USelect v-model="state.type" class="w-full" :items="items"  />
            </UFormField>
            <div class="grid grid-cols-2 gap-2">
                <UFormField label="Homepass ID" name="homepassId">
                    <UInput v-model="state.homepassId" class="w-full" placeholder="Homepass ID" />
                </UFormField>
                <UFormField label="Splitter ID" name="splitterId">
                    <UInput v-model="state.splitterId" class="w-full" placeholder="Splitter ID" />
                </UFormField>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <UFormField label="Customer ID" name="customerId">
                    <UInput v-model="state.customerId" class="w-full" placeholder="Customer ID" />
                </UFormField>
                <UFormField label="Service ID" name="serviceId">
                    <UInput v-model="state.serviceId" class="w-full" placeholder="Service ID" />
                </UFormField>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-2">
                <UButton
                    label="Batal"
                    color="neutral"
                    variant="subtle"
                    :disabled="saving"
                    @click="open = false"
                />
                <UButton
                    label="Simpan"
                    color="primary"
                    variant="solid"
                    type="submit"
                    :loading="saving"
                />
            </div>
        </UForm>
        </template>
    </UModal>
</template>
<script setup>
import { z } from 'zod'
import { coverageService } from '~/services/coverageService'
import { additionalService } from '~/services/additionalService'

const schema = z.object({
    name: z.string().nullish(),
    address: z.string().nullish(),
    homepassId: z.string().nullish(),
    splitterId: z.string().nullish(),
    customerId: z.string().nullish(),
    serviceId: z.string().nullish(),

    longitude: z.number(),
    latitude: z.number(),
    type: z.string().min(1, 'Type wajib diisi'),
})

const emit = defineEmits(['created'])
const open = ref(false)
const saving = ref(false)

const toast = useToast()

const items = ref([])
const loadingTypes = ref(false)

onMounted(async () => {
    loadingTypes.value = true
    try {
        const response = await additionalService.getCoverageTypes()
        if (response.success) {
            items.value = response.data.map(item => item.value)
        }
    } catch (error) {
        console.error('Failed to fetch coverage types:', error)
        toast.add({
            title: 'Gagal',
            description: 'Gagal memuat tipe coverage',
            color: 'red'
        })
    } finally {
        loadingTypes.value = false
    }
})

const state = reactive({
    name: null,
    address: null,
    homepassId: null,
    splitterId: null,
    customerId: null,
    serviceId: null,
    longitude: null,
    latitude: null,
    type: '',
})

function resetForm() {
    state.name = null
    state.address = null
    state.homepassId = null
    state.splitterId = null
    state.customerId = null
    state.serviceId = null
    state.longitude = null
    state.latitude = null
    state.type = ''
}

async function onSubmit(event) {
    saving.value = true

    try {
        await coverageService.createCoverage(event.data)
        toast.add({
            title: 'Berhasil',
            description: 'Data coverage berhasil ditambahkan pada koordinat ' + event.data.latitude + ', ' + event.data.longitude,
        })
        emit('created')
        open.value = false
        resetForm()
    } finally {
        saving.value = false
    }
}
</script>
