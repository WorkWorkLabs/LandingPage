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
      // #region agent log
      const logDataB1 = {location:'useTeamMembers.ts:97',message:'Loading team members started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logDataB1);
      fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataB1)}).catch(()=>{});
      // #endregion
      const response = await fetch('/team-members.md')
      
      if (!response.ok) {
        throw new Error('Failed to load team members')
      }
      
      const markdown = await response.text()
      // #region agent log
      const logDataB2 = {location:'useTeamMembers.ts:106',message:'Markdown loaded',data:{markdownLength:markdown.length,firstLines:markdown.split('\n').slice(0,5)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logDataB2);
      fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataB2)}).catch(()=>{});
      // #endregion
      const parsed = parseMarkdown(markdown)
      teamMembers.value = parsed
      // #region agent log
      const logDataB3 = {location:'useTeamMembers.ts:109',message:'Team members parsed',data:{count:parsed.length,memberNames:parsed.map((m:any)=>m.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logDataB3);
      fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataB3)}).catch(()=>{});
      // #endregion
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      // #region agent log
      const logDataB4 = {location:'useTeamMembers.ts:111',message:'Error loading team members',data:{error:error.value},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logDataB4);
      fetch('http://127.0.0.1:7242/ingest/353a4726-f634-4d1e-b9bb-65ed440c7233',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataB4)}).catch(()=>{});
      // #endregion
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