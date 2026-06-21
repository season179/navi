import { useMemo, useState } from 'react'
import type { ProjectMeta } from '../../shared/flue'
import { useNaviList } from '../flue/NaviChatContext'
import { useSettings } from '../settings'
import {
  SidebarProjectsSection,
  type SidebarWorkspaceGroup,
} from '../components/SidebarProjectsSection'

const DEFAULT_PROJECT_ID = 'navi-default'

function projectWorkspacePath(project: ProjectMeta): string {
  return project.path || project.name
}

export function SidebarProjects() {
  const {
    projects,
    conversations,
    currentId,
    createProject,
    selectProject,
    selectConversation,
    deleteConversation,
    deleteProject,
  } = useNaviList()
  const { closeSettings } = useSettings()

  const [searchQuery, setSearchQuery] = useState('')

  const handleSelectConversation = (id: string) => {
    closeSettings()
    void selectConversation(id)
  }

  const handleCreateProject = () => {
    closeSettings()
    void createProject()
  }

  const handleProjectClick = (projectId: string) => {
    closeSettings()
    void selectProject(projectId)
  }

  const handleNewThreadInProject = (projectId: string) => {
    closeSettings()
    void selectProject(projectId)
  }

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return
    const msg =
      `Delete project "${project.name}"?\n\n` +
      'All conversations in this project will be permanently deleted.\n\n' +
      'This project gave the agent full read/write/shell access on your computer — ' +
      'not confined to the folder. Only delete if you trust that access is no longer needed.'
    if (!confirm(msg)) return
    void deleteProject(projectId)
  }

  const conversationsByProject = useMemo(() => {
    const map = new Map<string, typeof conversations>()
    for (const c of conversations) {
      const pid = projects.some((p) => p.id === c.projectId) ? c.projectId : DEFAULT_PROJECT_ID
      const arr = map.get(pid) ?? []
      arr.push(c)
      map.set(pid, arr)
    }
    return map
  }, [conversations, projects])

  const query = searchQuery.trim().toLowerCase()

  const groups = useMemo((): SidebarWorkspaceGroup[] => {
    const filteredProjects = !query
      ? projects
      : projects.filter((p) => {
          if (p.name.toLowerCase().includes(query) || p.label.toLowerCase().includes(query)) {
            return true
          }
          const convs = conversationsByProject.get(p.id) ?? []
          return convs.some((c) => c.title.toLowerCase().includes(query))
        })

    return filteredProjects.map((project) => {
      const convs = conversationsByProject.get(project.id) ?? []
      const visibleConversations = !query
        ? convs
        : convs.filter((c) => c.title.toLowerCase().includes(query))

      return {
        projectId: project.id,
        workspacePath: projectWorkspacePath(project),
        threads: visibleConversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: new Date(c.updatedAt).toISOString(),
        })),
      }
    })
  }, [projects, conversationsByProject, query])

  const deletableProjectIds = useMemo(
    () => new Set(projects.filter((p) => p.id !== DEFAULT_PROJECT_ID).map((p) => p.id)),
    [projects],
  )

  return (
    <SidebarProjectsSection
      groups={groups}
      activeThreadId={currentId}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      runtimeReady
      hasWorkspace={projects.length > 0}
      onCreateProject={handleCreateProject}
      onProjectClick={handleProjectClick}
      onDeleteProject={handleDeleteProject}
      onSelectThread={handleSelectConversation}
      onDeleteThread={(id) => void deleteConversation(id)}
      onNewThreadInProject={handleNewThreadInProject}
      deletableProjectIds={deletableProjectIds}
    />
  )
}
