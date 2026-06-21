import { useMemo, useState } from 'react'
import {
  ChevronRight,
  ChevronDown,
  Search,
  FolderPlus,
  Folder,
  FolderOpen,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import type { ProjectMeta } from '../../shared/flue'
import { useNaviList } from '../flue/NaviChatContext'
import { useSettings } from '../settings'
import { formatRelativeTime } from '../lib/format-relative-time'

const DEFAULT_PROJECT_ID = 'navi-default'

export function SidebarProjects() {
  const {
    projects,
    conversations,
    currentId,
    currentProjectId,
    createProject,
    selectProject,
    selectConversation,
    deleteConversation,
    deleteProject,
  } = useNaviList()
  const { closeSettings } = useSettings()

  // Opening a conversation returns to the chat view if settings were showing
  // (mirrors Kun, where selecting a session flips route back to chat).
  const handleSelectConversation = (id: string) => {
    closeSettings()
    void selectConversation(id)
  }

  // Selecting or creating a project starts a fresh blank conversation
  // (selectProject → startBlank), so leave the settings view too — otherwise
  // the new chat is hidden behind the still-open providers panel.
  const handleCreateProject = () => {
    closeSettings()
    void createProject()
  }

  const [allCollapsed, setAllCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const locale = typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en'

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

  const filteredProjects = useMemo(() => {
    if (!query) return projects
    return projects.filter((p) => {
      if (p.name.toLowerCase().includes(query) || p.label.toLowerCase().includes(query)) return true
      const convs = conversationsByProject.get(p.id) ?? []
      return convs.some((c) => c.title.toLowerCase().includes(query))
    })
  }, [projects, query, conversationsByProject])

  const visibleConversations = (projectId: string) => {
    const convs = conversationsByProject.get(projectId) ?? []
    if (!query) return convs
    return convs.filter((c) => c.title.toLowerCase().includes(query))
  }

  const isExpanded = (id: string) => {
    if (allCollapsed) return false
    return expanded[id] !== false
  }

  const handleProjectClick = (id: string) => {
    // selectProject (below) resets to a fresh blank conversation, so return to
    // the chat view if settings were showing.
    closeSettings()
    if (allCollapsed) {
      // Leaving "collapse all" via a project click should open *that* project
      // and keep the rest collapsed — otherwise the click is a visual no-op
      // (the allCollapsed override would keep every folder shut).
      setExpanded(Object.fromEntries(projects.map((p) => [p.id, p.id === id])))
      setAllCollapsed(false)
    } else {
      setExpanded((prev) => ({ ...prev, [id]: !isExpanded(id) }))
    }
    void selectProject(id)
  }

  const handleDeleteProject = (p: ProjectMeta) => {
    const msg =
      `Delete project "${p.name}"?\n\n` +
      'All conversations in this project will be permanently deleted.\n\n' +
      'This project gave the agent full read/write/shell access on your computer — ' +
      'not confined to the folder. Only delete if you trust that access is no longer needed.'
    if (!confirm(msg)) return
    void deleteProject(p.id)
  }

  // Active project highlight follows the open conversation's project (set by
  // selectConversation), not merely the last project header clicked. Clicking a
  // project header selects it for the *next* new conversation only.

  return (
    <>
      <div className="sidebar-section-header">
        <button
          type="button"
          className="projects-title"
          onClick={() => setAllCollapsed((v) => !v)}
          aria-label={allCollapsed ? 'Expand all projects' : 'Collapse all projects'}
        >
          {allCollapsed ? <ChevronRight /> : <ChevronDown />}
          <span>Projects</span>
        </button>
        <div className="sidebar-section-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search projects"
            title="Search"
          >
            <Search />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={handleCreateProject}
            aria-label="New project"
            title="New project"
          >
            <FolderPlus />
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div className="sidebar-search">
          <Search />
          <input
            type="search"
            placeholder="Search projects and conversations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      ) : null}

      {query && filteredProjects.length === 0 ? (
        <div className="sidebar-empty">No matches</div>
      ) : (
        filteredProjects.map((p) => {
          const convs = visibleConversations(p.id)
          const open = isExpanded(p.id)
          return (
            <div key={p.id}>
              <div className="conv-item">
                <button
                  type="button"
                  className={
                    p.id === currentProjectId
                      ? 'cmd-row project-row is-active'
                      : 'cmd-row project-row'
                  }
                  onClick={() => handleProjectClick(p.id)}
                  title={p.path || p.name}
                  aria-expanded={open}
                >
                  {open ? <FolderOpen /> : <Folder />}
                  <span className="cmd-label">{p.name}</span>
                  {p.label ? <span className="project-context">{p.label}</span> : null}
                </button>
                {p.id !== DEFAULT_PROJECT_ID ? (
                  <button
                    type="button"
                    className="conv-delete"
                    onClick={() => handleDeleteProject(p)}
                    aria-label="Delete project"
                    title="Delete project"
                  >
                    <Trash2 />
                  </button>
                ) : null}
              </div>

              {open ? (
                <div className="project-children">
                  {convs.length === 0 ? (
                    <div className="sidebar-empty">No conversations</div>
                  ) : (
                    convs.map((c) => (
                      <div key={c.id} className="conv-item">
                        <button
                          type="button"
                          className={
                            c.id === currentId
                              ? 'cmd-row conv-open is-active'
                              : 'cmd-row conv-open'
                          }
                          onClick={() => handleSelectConversation(c.id)}
                          title={c.title}
                        >
                          <MessageSquare />
                          <span className="cmd-label">{c.title}</span>
                          <span className="conv-time">{formatRelativeTime(c.updatedAt, locale)}</span>
                        </button>
                        <button
                          type="button"
                          className="conv-delete"
                          onClick={() => void deleteConversation(c.id)}
                          aria-label="Delete conversation"
                          title="Delete conversation"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )
        })
      )}
    </>
  )
}
