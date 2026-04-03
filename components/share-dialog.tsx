"use client"

import { useState } from "react"
import { Project } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Share2, UserPlus, X, Pencil, Trash2 } from "lucide-react"

interface ShareDialogProps {
  project: Project
  onShare: (email: string, role: "viewer" | "editor") => void
  onRemoveUser: (userId: string) => void
}

export function ShareDialog({
  project,
  onShare,
  onRemoveUser,
}: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"viewer" | "editor">("viewer")

  const handleShare = () => {
    if (email.trim()) {
      onShare(email.trim(), role)
      setEmail("")
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "viewer" | "editor")}
              className="rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <Button onClick={handleShare} disabled={!email.trim()}>
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>

          {project.sharedWith.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Shared with ({project.sharedWith.length})
              </p>
              <div className="space-y-2">
                {project.sharedWith.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {user.name?.[0]?.toUpperCase() ||
                          user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveUser(user.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Sharing is simulated in this demo. In production, this would send
            email invitations and manage real-time collaboration.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface RenameDialogProps {
  currentName: string
  type: "project" | "prd"
  onRename: (newName: string) => void
  trigger: React.ReactNode
}

export function RenameDialog({
  currentName,
  type,
  onRename,
  trigger,
}: RenameDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)

  const handleRename = () => {
    if (name.trim() && name !== currentName) {
      onRename(name.trim())
      setOpen(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setName(currentName)
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Rename {type === "project" ? "Project" : "PRD"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${type} name`}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!name.trim() || name === currentName}
            >
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ItemMenuProps {
  onRename: () => void
  onDelete?: () => void
  type: "project" | "prd"
}

export function ItemMenu({ onRename, onDelete, type }: ItemMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="mr-2 h-4 w-4" />
          Rename {type === "project" ? "Project" : "Document"}
        </DropdownMenuItem>
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
