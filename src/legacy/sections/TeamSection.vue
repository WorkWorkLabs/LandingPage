<script setup lang="ts">
import { useTeamMembers } from '@/composables/useTeamMembers'
import TeamMemberCard from './TeamMemberCard.vue'

const { teamMembers } = useTeamMembers()
</script>

<template>
  <div>
    <h3 class="text-2xl font-bold text-default-900 mb-6">
      我们的团队
    </h3>

    <div class="grid grid-cols-2 gap-4">
      <TeamMemberCard
        v-for="(member, index) in teamMembers"
        :key="member.name"
        :member="member"
        :index="index"
      />
    </div>
  </div>
</template>
