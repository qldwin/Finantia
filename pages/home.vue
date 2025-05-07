<template>
  <div class="rounded-2xl bg-blue-100 flex justify-center items-center h-70 mt-20 w-100 mr-auto ml-auto">
    <div class="flex flex-col">
      <label class="text-5xl">{{ balance }}€</label>
      <USelect placeholder="Type de transaction" :items="items" v-model="selectedType"/>
      <UInput placeholder="Montant" v-model="amount" class="w-25" type="number"></UInput>
      <UButton type="button" @click="applyTransaction">OK</UButton>
    </div>
  </div>
  <div class="rounded-2xl bg-gray-100 flex justify-center items-center h-70 mt-5 w-100 mr-auto ml-auto">
    <ul>
      <li >

      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import {ref} from 'vue';
import { PrismaClient } from '@prisma/client';
const Prisma = new PrismaClient();

const balance = ref(0);
const items = ref([{label: 'Débit', value: 'debit'}, {label: 'Crédit', value: 'credit'}]);
const amount = ref(0);
const selectedType = ref('debit');

const applyTransaction = () => {
  const numericAmount = amount.value;
    if (selectedType.value === 'debit') {
      balance.value -= numericAmount;
    } else if (selectedType.value === 'credit') {
      balance.value += numericAmount;
    }
}

Prisma.$connect()

</script>