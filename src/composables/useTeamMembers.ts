import { ref, onMounted } from 'vue'
import type { TeamMember, SocialLink } from '@/types'

export const useTeamMembers = () => {
  const genesisTeam = ref<TeamMember[]>([])
  const teamMembers = ref<TeamMember[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const parseMarkdown = (markdown: string) => {
    const genesis: TeamMember[] = []
    const regular: TeamMember[] = []
    const lines = markdown.split('\n')
    
    let currentMember: Partial<TeamMember> | null = null
    let currentSection = 'genesis' // 默认为genesis团队
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // 检测团队分类（# 开头）
      if (trimmed.startsWith('# ') && !trimmed.startsWith('# Team Members')) {
        if (trimmed.includes('Genesis Team')) {
          currentSection = 'genesis'
        } else if (trimmed.includes('Team Members')) {
          currentSection = 'regular'
        }
        continue
      }
      
      // 检测新的团队成员（## 开头）
      if (trimmed.startsWith('## ')) {
        if (currentMember && currentMember.name) {
          if (currentSection === 'genesis') {
            genesis.push(currentMember as TeamMember)
          } else {
            regular.push(currentMember as TeamMember)
          }
        }
        currentMember = {
          id: trimmed.substring(3).toLowerCase().replace(/\s+/g, '-'),
          name: trimmed.substring(3),
          title: '',
          social: []
        }
      }
      
      // 解析属性
      if (currentMember && trimmed.startsWith('- **')) {
        const match = trimmed.match(/- \*\*(.*?)\*\*:\s*(.*)/)
        if (match) {
          const [, key, value] = match
          
          switch (key.toLowerCase()) {
            case 'avatar':
              currentMember.avatar = value
              break
            case 'bio':
              currentMember.title = value
              currentMember.bio = value
              break
            case 'x':
              currentMember.social!.push({ platform: 'x', url: value })
              break
            case 'github':
              currentMember.social!.push({ platform: 'github', url: value })
              break
            case 'linkedin':
              currentMember.social!.push({ platform: 'linkedin', url: value })
              break
          }
        }
      }
    }
    
    // 添加最后一个成员
    if (currentMember && currentMember.name) {
      if (currentSection === 'genesis') {
        genesis.push(currentMember as TeamMember)
      } else {
        regular.push(currentMember as TeamMember)
      }
    }
    
    return { genesis, regular }
  }

  const loadTeamMembers = async () => {
    try {
      loading.value = true
      const response = await fetch('/team-members.md')
      
      if (!response.ok) {
        throw new Error('Failed to load team members')
      }
      
      const markdown = await response.text()
      const { genesis, regular } = parseMarkdown(markdown)
      genesisTeam.value = genesis
      teamMembers.value = regular
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error loading team members:', err)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadTeamMembers()
  })

  return {
    genesisTeam,
    teamMembers,
    loading,
    error,
    loadTeamMembers
  }
}