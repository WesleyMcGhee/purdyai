"use client"

import { useState, useEffect } from "react"
import { Project, PRD, LLMConfig, View } from "@/lib/types"
import { parseStoredState } from "@/lib/storage"
import { InterviewChat } from "@/components/interview-chat"
import { PRDEditor } from "@/components/prd-editor"
import { SettingsModal } from "@/components/settings-modal"
import { ShareDialog, RenameDialog, ItemMenu } from "@/components/share-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  FileText,
  ChevronLeft,
  Loader2,
  FolderOpen,
  Users,
  Clock,
  Search,
  LayoutGrid,
  List,
} from "lucide-react"

const STORAGE_KEY = "purdy_state"

function createProject(name: string): Project {
  return {
    id: crypto.randomUUID(),
    name,
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    prds: [],
    sharedWith: [],
  }
}

function createPRD(projectId: string, name: string) {
  return {
    id: crypto.randomUUID(),
    projectId,
    name,
    interview: {
      conversation: [],
      currentPhase: "intro" as const,
      answers: {},
      isComplete: false,
    },
    executiveSummary: "",
    userStories: [],
    functionalRequirements: [],
    nonFunctionalRequirements: [],
    successMetrics: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({ provider: "openai" })
  const [view, setView] = useState<View>("projects")
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentPRD, setCurrentPRD] = useState<PRD | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newPRDName, setNewPRDName] = useState("")

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const state = JSON.parse(saved)
      const parsed = parseStoredState(state)
      setProjects(parsed.projects)
      setLlmConfig(state.llmConfig || { provider: "openai" })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, llmConfig }))
  }, [projects, llmConfig])

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const project = createProject(newProjectName.trim())
      setProjects((prev) => [...prev, project])
      setNewProjectName("")
      setIsCreating(false)
      setCurrentProject(project)
      setView("project-detail")
    }
  }

  const handleRenameProject = (projectId: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, name: newName, updatedAt: new Date() } : p
      )
    )
    if (currentProject?.id === projectId) {
      setCurrentProject((prev) =>
        prev ? { ...prev, name: newName, updatedAt: new Date() } : null
      )
    }
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
      setView("projects")
    }
  }

  const handleShareProject = (
    projectId: string,
    email: string,
    role: "viewer" | "editor"
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            sharedWith: [
              ...p.sharedWith,
              {
                id: crypto.randomUUID(),
                email,
                role,
                addedAt: new Date(),
              },
            ],
            updatedAt: new Date(),
          }
        }
        return p
      })
    )
    if (currentProject?.id === projectId) {
      setCurrentProject((prev) => {
        if (!prev) return null
        return {
          ...prev,
          sharedWith: [
            ...prev.sharedWith,
            {
              id: crypto.randomUUID(),
              email,
              role,
              addedAt: new Date(),
            },
          ],
          updatedAt: new Date(),
        }
      })
    }
  }

  const handleRemoveUser = (projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            sharedWith: p.sharedWith.filter((u) => u.id !== userId),
            updatedAt: new Date(),
          }
        }
        return p
      })
    )
    if (currentProject?.id === projectId) {
      setCurrentProject((prev) => {
        if (!prev) return null
        return {
          ...prev,
          sharedWith: prev.sharedWith.filter((u) => u.id !== userId),
          updatedAt: new Date(),
        }
      })
    }
  }

  const handleCreatePRD = () => {
    if (!currentProject || !newPRDName.trim()) return

    const prd = createPRD(currentProject.id, newPRDName.trim())
    const updatedProject = {
      ...currentProject,
      prds: [...currentProject.prds, prd],
      updatedAt: new Date(),
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === currentProject.id ? updatedProject : p))
    )
    setCurrentProject(updatedProject)
    setNewPRDName("")
    setIsCreating(false)
    setCurrentPRD(prd)
    setView("prd")
  }

  const handleRenamePRD = (prdId: string, newName: string) => {
    if (!currentProject) return

    const updatedProject = {
      ...currentProject,
      prds: currentProject.prds.map((p) =>
        p.id === prdId ? { ...p, name: newName, updatedAt: new Date() } : p
      ),
      updatedAt: new Date(),
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === currentProject.id ? updatedProject : p))
    )
    setCurrentProject(updatedProject)
    if (currentPRD?.id === prdId) {
      setCurrentPRD((prev) => (prev ? { ...prev, name: newName } : null))
    }
  }

  const handleDeletePRD = (prdId: string) => {
    if (!currentProject) return

    const updatedProject = {
      ...currentProject,
      prds: currentProject.prds.filter((p) => p.id !== prdId),
      updatedAt: new Date(),
    }
    setProjects((prev) =>
      prev.map((p) => (p.id === currentProject.id ? updatedProject : p))
    )
    setCurrentProject(updatedProject)
    if (currentPRD?.id === prdId) {
      setCurrentPRD(null)
      setView("project-detail")
    }
  }

  const handleInterviewComplete = async (answers: Record<string, string>) => {
    if (!currentProject || !currentPRD) return

    setIsGenerating(true)

    try {
      const { generatePRD } = await import("@/lib/api")
      const prd = await generatePRD(
        currentProject.id,
        currentPRD.name,
        { ...currentPRD.interview, answers, isComplete: true },
        llmConfig
      )

      const updatedProject = {
        ...currentProject,
        prds: currentProject.prds.map((p) =>
          p.id === currentPRD.id ? prd : p
        ),
        updatedAt: new Date(),
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
      )
      setCurrentProject(updatedProject)
      setCurrentPRD(prd)
      setView("prd")
    } catch (error) {
      console.error("Failed to generate PRD:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {view !== "projects" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (view === "prd" && currentProject) {
                    setCurrentPRD(null)
                    setView("project-detail")
                  } else {
                    setCurrentProject(null)
                    setCurrentPRD(null)
                    setView("projects")
                  }
                }}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                setCurrentProject(null)
                setCurrentPRD(null)
                setView("projects")
              }}
            >
              <div className="flex items-center gap-2">
                <img src="/purdy-logo.svg" alt="purdy.ai" className="h-8 w-8" />
                <span className="text-xl font-bold">purdy.ai</span>
              </div>
            </Button>
          </div>
          <SettingsModal config={llmConfig} onSave={setLlmConfig} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {view === "projects" && (
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="mt-1 text-muted-foreground">
                  Create and manage your product requirements documents
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>

            {isCreating && (
              <Card className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateProject()
                    }
                    autoFocus
                  />
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                  >
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setNewProjectName("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1 rounded-lg border p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <Card className="p-12 text-center">
                <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">No projects yet</h3>
                <p className="mb-4 text-muted-foreground">
                  {searchQuery
                    ? "No projects match your search"
                    : "Create your first project to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                )}
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-2"
                }
              >
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className={`cursor-pointer p-4 transition-colors hover:bg-muted/50 ${
                      viewMode === "list"
                        ? "flex items-center justify-between"
                        : ""
                    }`}
                    onClick={() => {
                      setCurrentProject(project)
                      setView("project-detail")
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-medium">
                            {project.name}
                          </h3>
                          <ItemMenu
                            type="project"
                            onRename={() =>
                              handleRenameProject(project.id, project.name)
                            }
                            onDelete={() => handleDeleteProject(project.id)}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project.prds.length} document
                          {project.prds.length !== 1 ? "s" : ""}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(project.updatedAt)}
                          </span>
                          {project.sharedWith.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {project.sharedWith.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "project-detail" && currentProject && (
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{currentProject.name}</h1>
                  <RenameDialog
                    currentName={currentProject.name}
                    type="project"
                    onRename={(name) =>
                      handleRenameProject(currentProject.id, name)
                    }
                    trigger={
                      <Button variant="ghost" size="sm">
                        Rename
                      </Button>
                    }
                  />
                </div>
                <ShareDialog
                  project={currentProject}
                  onShare={(email, role) =>
                    handleShareProject(currentProject.id, email, role)
                  }
                  onRemoveUser={(userId) =>
                    handleRemoveUser(currentProject.id, userId)
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {currentProject.prds.length} document
                {currentProject.prds.length !== 1 ? "s" : ""} • Created{" "}
                {formatDate(currentProject.createdAt)}
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Documents</h2>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>

            {isCreating && (
              <Card className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={newPRDName}
                    onChange={(e) => setNewPRDName(e.target.value)}
                    placeholder="Document name"
                    onKeyDown={(e) => e.key === "Enter" && handleCreatePRD()}
                    autoFocus
                  />
                  <Button
                    onClick={handleCreatePRD}
                    disabled={!newPRDName.trim()}
                  >
                    Create
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false)
                      setNewPRDName("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {currentProject.prds.length === 0 && !isCreating ? (
              <Card className="p-8 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <h3 className="mb-1 font-medium">No documents yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Create a document to start your product discovery interview
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Document
                </Button>
              </Card>
            ) : (
              <div className="space-y-2">
                {currentProject.prds.map((prd) => (
                  <Card
                    key={prd.id}
                    className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
                    onClick={() => {
                      setCurrentPRD(prd)
                      setView("prd")
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 ${prd.executiveSummary ? "bg-green-500/10" : "bg-muted"}`}
                        >
                          <FileText
                            className={`h-5 w-5 ${prd.executiveSummary ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{prd.name}</h3>
                            {prd.executiveSummary && (
                              <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                                Generated
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {prd.executiveSummary
                              ? `${prd.userStories.length} user stories • ${prd.functionalRequirements.length} requirements`
                              : "Not started"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(prd.updatedAt)}
                        </span>
                        <ItemMenu
                          type="prd"
                          onRename={() => handleRenamePRD(prd.id, prd.name)}
                          onDelete={() => handleDeletePRD(prd.id)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "prd" && currentProject && currentPRD && (
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold">{currentPRD.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentProject.name} • Updated{" "}
                    {formatDate(currentPRD.updatedAt)}
                  </p>
                </div>
                <RenameDialog
                  currentName={currentPRD.name}
                  type="prd"
                  onRename={(name) => handleRenamePRD(currentPRD.id, name)}
                  trigger={
                    <Button variant="ghost" size="sm">
                      Rename
                    </Button>
                  }
                />
              </div>
            </div>

            <Separator />

            {!currentPRD.executiveSummary ? (
              <div className="h-[calc(100vh-16rem)]">
                {isGenerating ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="space-y-4 text-center">
                      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                      <p className="text-lg font-medium">
                        Generating your PRD...
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This may take a moment while AI analyzes your answers
                      </p>
                    </div>
                  </div>
                ) : (
                  <InterviewChat
                    onComplete={handleInterviewComplete}
                    llmConfig={llmConfig}
                  />
                )}
              </div>
            ) : (
              <PRDEditor prd={currentPRD} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
