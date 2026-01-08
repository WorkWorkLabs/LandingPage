import { ref, onMounted } from 'vue'
import type { TeamMember, SocialLink } from '@/types'

export const useTeamMembers = () => {
  const teamMembers = ref<TeamMember[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const parseMarkdown = (markdown: string) => {
    const regular: TeamMember[] = []
    const lines = markdown.split('\n')
    
    let currentMember: Partial<TeamMember> | null = null
    let currentSection = 'regular'
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      
      // 检测团队分类（# 开头）
      if (trimmed.startsWith('# ')) {
        // 先保存当前成员（如果有的话）到当前分组
        if (currentMember && currentMember.name) {
          if (currentSection === 'regular') {
            regular.push(currentMember as TeamMember)
          }
          currentMember = null
        }
        
        // 然后切换分组
        if (trimmed === '# Team Members' && i > 2) {
          // 确保这不是文档开头的标题行
          currentSection = 'regular'
        }
        continue
      }
      
      // 检测新的团队成员（## 开头）
      if (trimmed.startsWith('## ')) {
        // 先保存之前的成员
        if (currentMember && currentMember.name) {
          if (currentSection === 'regular') {
            regular.push(currentMember as TeamMember)
          }
        }
        
        // 创建新成员
        const memberName = trimmed.substring(3)
        currentMember = {
          id: memberName.toLowerCase().replace(/\s+/g, '-'),
          name: memberName,
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
      if (currentSection === 'regular') {
        regular.push(currentMember as TeamMember)
      }
    }
    
    return regular
  }

  const loadTeamMembers = async () => {
    try {
      loading.value = true
      const response = await fetch('/team-members.md')
      
      if (!response.ok) {
        throw new Error('Failed to load team members')
      }
      
      const markdown = await response.text()
      teamMembers.value = parseMarkdown(markdown)
      
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
    teamMembers,
    loading,
    error,
    loadTeamMembers
  }
}