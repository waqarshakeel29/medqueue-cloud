"use client"

import { useState } from "react"
import { ClinicRole } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Edit2, Trash2, Eye, X } from "lucide-react"

type Member = {
  id: string
  role: ClinicRole
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    cnic: string | null
  }
}

type MemberDetails = Member & {
  user: {
    id: string
    name: string | null
    email: string | null
    cnic: string | null
    createdAt: string
  }
  doctor?: {
    id: string
    speciality: string | null
    roomNumber: string | null
    isActive: boolean
  } | null
}

interface TeamClientProps {
  clinicId: string
  currentUserId: string
  initialMembers: Member[]
}

const roleLabels: Record<ClinicRole, string> = {
  ADMIN: "Admin",
  DOCTOR: "Doctor",
  RECEPTION: "Reception",
}

export function TeamClient({
  clinicId,
  currentUserId,
  initialMembers,
}: TeamClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    cnic: "",
    password: "",
    confirmPassword: "",
    role: ClinicRole.RECEPTION as ClinicRole,
    speciality: "",
    roomNumber: "",
  })
  const [editFormState, setEditFormState] = useState({
    name: "",
    email: "",
    cnic: "",
    password: "",
    confirmPassword: "",
    role: ClinicRole.RECEPTION as ClinicRole,
    speciality: "",
    roomNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [viewingMember, setViewingMember] = useState<MemberDetails | null>(null)
  const [deletingMember, setDeletingMember] = useState<Member | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const formatCNIC = (value: string): string => {
    const digits = value.replace(/\D/g, "")
    const limited = digits.slice(0, 13)
    if (limited.length <= 5) {
      return limited
    } else if (limited.length <= 12) {
      return `${limited.slice(0, 5)}-${limited.slice(5)}`
    } else {
      return `${limited.slice(0, 5)}-${limited.slice(5, 12)}-${limited.slice(12)}`
    }
  }

  const formatCNICForDisplay = (cnic: string | null): string => {
    if (!cnic) return ""
    const digits = cnic.replace(/[-\s]/g, "")
    if (digits.length === 13) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
    }
    return cnic
  }

  const handleCNICChange = (value: string, isEdit = false) => {
    const formatted = formatCNIC(value)
    if (isEdit) {
      setEditFormState((prev) => ({ ...prev, cnic: formatted }))
    } else {
      setFormState((prev) => ({ ...prev, cnic: formatted }))
    }
  }

  const handleViewDetails = async (member: Member) => {
    setDetailsLoading(true)
    try {
      const response = await fetch(`/api/clinic/${clinicId}/members/${member.id}`)
      if (!response.ok) throw new Error("Failed to fetch details")
      const data = await response.json()
      setViewingMember(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load details")
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setEditFormState({
      name: member.user.name || "",
      email: member.user.email || "",
      cnic: formatCNICForDisplay(member.user.cnic || ""),
      password: "",
      confirmPassword: "",
      role: member.role,
      speciality: "",
      roomNumber: "",
    })
    setError(null)
  }

  const handleUpdate = async () => {
    if (!editingMember) return

    setEditLoading(true)
    setError(null)

    if (editFormState.password && editFormState.password.length < 8) {
      setError("Password must be at least 8 characters long.")
      setEditLoading(false)
      return
    }

    if (editFormState.password !== editFormState.confirmPassword) {
      setError("Passwords do not match.")
      setEditLoading(false)
      return
    }

    try {
      const updateData: any = {
        name: editFormState.name,
        email: editFormState.email || "",
        cnic: editFormState.cnic,
        role: editFormState.role,
      }

      if (editFormState.password) {
        updateData.password = editFormState.password
      }

      if (editFormState.role === ClinicRole.DOCTOR) {
        updateData.speciality = editFormState.speciality
        updateData.roomNumber = editFormState.roomNumber
      }

      const response = await fetch(`/api/clinic/${clinicId}/members/${editingMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Unable to update team member")
      }

      const data = await response.json()
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? data.member : m))
      )

      setMessage("Team member updated successfully.")
      setEditingMember(null)
      setEditFormState({
        name: "",
        email: "",
        cnic: "",
        password: "",
        confirmPassword: "",
        role: ClinicRole.RECEPTION,
        speciality: "",
        roomNumber: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingMember) return

    setDeleteLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/clinic/${clinicId}/members/${deletingMember.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Unable to delete team member")
      }

      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id))
      setMessage("Team member removed successfully.")
      setDeletingMember(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (formState.password.length < 8) {
      setError("Password must be at least 8 characters long.")
      setLoading(false)
      return
    }

    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/clinic/${clinicId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Unable to add team member")
      }

      const data = await response.json()
      const newMember: Member = {
        ...data.member,
        createdAt: data.member.createdAt,
      }

      setMembers((prev) => {
        const exists = prev.some((member) => member.id === newMember.id)
        if (exists) {
          return prev.map((member) => (member.id === newMember.id ? newMember : member))
        }
        return [...prev, newMember]
      })

      setMessage("Team member added successfully. Share the password securely.")

      setFormState({
        name: "",
        email: "",
        cnic: "",
        password: "",
        confirmPassword: "",
        role: ClinicRole.RECEPTION,
        speciality: "",
        roomNumber: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team &amp; Permissions</h1>
        <p className="text-gray-600 mt-1">
          Add employees to your clinic and manage their roles.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Team</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No team members yet.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-semibold">
                      {member.user.name || member.user.cnic || member.user.email || "Unknown"}
                      {member.user.id === currentUserId && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.user.cnic && `CNIC: ${formatCNICForDisplay(member.user.cnic)}`}
                      {member.user.cnic && member.user.email && " • "}
                      {member.user.email && `Email: ${member.user.email}`}
                      {!member.user.cnic && !member.user.email && "No contact info"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium px-2 py-1 rounded bg-gray-100 text-gray-800">
                      {roleLabels[member.role]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(member)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(member)}
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {member.user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingMember(member)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  value={formState.cnic}
                  onChange={(e) => handleCNICChange(e.target.value)}
                  required
                  placeholder="12345-1234567-1"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, password: e.target.value }))
                  }
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formState.confirmPassword}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="border rounded px-3 py-2 text-sm w-full"
                value={formState.role}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, role: e.target.value as ClinicRole }))
                }
              >
                <option value={ClinicRole.ADMIN}>Admin</option>
                <option value={ClinicRole.DOCTOR}>Doctor</option>
                <option value={ClinicRole.RECEPTION}>Reception</option>
              </select>
            </div>

            {formState.role === ClinicRole.DOCTOR && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speciality">Speciality</Label>
                  <Input
                    id="speciality"
                    value={formState.speciality}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, speciality: e.target.value }))
                    }
                    placeholder="e.g., Cardiology"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={formState.roomNumber}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, roomNumber: e.target.value }))
                    }
                    placeholder="e.g., 12B"
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Team Member"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!viewingMember} onOpenChange={() => setViewingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>View detailed information about this team member</DialogDescription>
          </DialogHeader>
          {detailsLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : viewingMember ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Name</Label>
                <p className="mt-1">{viewingMember.user.name || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">CNIC</Label>
                <p className="mt-1">{formatCNICForDisplay(viewingMember.user.cnic) || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="mt-1">{viewingMember.user.email || "Not set"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Role</Label>
                <p className="mt-1">{roleLabels[viewingMember.role]}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Member Since</Label>
                <p className="mt-1">
                  {new Date(viewingMember.createdAt).toLocaleDateString()}
                </p>
              </div>
              {viewingMember.role === ClinicRole.DOCTOR && viewingMember.doctor && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Speciality</Label>
                    <p className="mt-1">{viewingMember.doctor.speciality || "Not set"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Room Number</Label>
                    <p className="mt-1">{viewingMember.doctor.roomNumber || "Not set"}</p>
                  </div>
                </>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingMember(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update team member information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormState.name}
                  onChange={(e) =>
                    setEditFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cnic">CNIC</Label>
                <Input
                  id="edit-cnic"
                  value={editFormState.cnic}
                  onChange={(e) => handleCNICChange(e.target.value, true)}
                  required
                  placeholder="12345-1234567-1"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (Optional)</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormState.email}
                onChange={(e) =>
                  setEditFormState((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="user@example.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (Leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editFormState.password}
                  onChange={(e) =>
                    setEditFormState((prev) => ({ ...prev, password: e.target.value }))
                  }
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  value={editFormState.confirmPassword}
                  onChange={(e) =>
                    setEditFormState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <select
                id="edit-role"
                className="border rounded px-3 py-2 text-sm w-full"
                value={editFormState.role}
                onChange={(e) =>
                  setEditFormState((prev) => ({ ...prev, role: e.target.value as ClinicRole }))
                }
              >
                <option value={ClinicRole.ADMIN}>Admin</option>
                <option value={ClinicRole.DOCTOR}>Doctor</option>
                <option value={ClinicRole.RECEPTION}>Reception</option>
              </select>
            </div>

            {editFormState.role === ClinicRole.DOCTOR && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-speciality">Speciality</Label>
                  <Input
                    id="edit-speciality"
                    value={editFormState.speciality}
                    onChange={(e) =>
                      setEditFormState((prev) => ({ ...prev, speciality: e.target.value }))
                    }
                    placeholder="e.g., Cardiology"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-roomNumber">Room Number</Label>
                  <Input
                    id="edit-roomNumber"
                    value={editFormState.roomNumber}
                    onChange={(e) =>
                      setEditFormState((prev) => ({ ...prev, roomNumber: e.target.value }))
                    }
                    placeholder="e.g., 12B"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={editLoading}>
              {editLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <strong>
                {deletingMember?.user.name ||
                  formatCNICForDisplay(deletingMember?.user.cnic || null) ||
                  deletingMember?.user.email ||
                  "this member"}
              </strong>
              ? This action cannot be undone. They will lose access to this clinic.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingMember(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
