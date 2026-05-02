import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useContentStore } from '@/stores/content'
import type { TeamMember } from '@/types'

export const useTeamMembers = () => {
  const contentStore = useContentStore()
  const { team } = storeToRefs(contentStore)

  const teamMembers = computed<TeamMember[]>(() => {
    return team.value.map((member) => ({
      ...member,
      role: member.title || member.role,
      bio: member.title || '',
    }))
  })

  return {
    teamMembers,
    loading: false,
    error: null,
  }
}
