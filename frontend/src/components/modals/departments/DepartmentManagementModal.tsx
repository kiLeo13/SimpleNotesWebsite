import { useEffect, useMemo, useState, type ChangeEvent, type JSX } from "react"
import { IoMdClose } from "react-icons/io"
import { MdDelete, MdDriveFileMove, MdSave } from "react-icons/md"

import { Button } from "@/components/ui/buttons/Button"
import { DepartmentIcon } from "@/components/departments/DepartmentIcon"
import { Permission } from "@/models/Permission"
import { departmentService } from "@/services/departmentService"
import { useDepartmentsStore } from "@/stores/useDepartmentsStore"
import { usePermission } from "@/hooks/usePermission"
import { useTranslation } from "react-i18next"
import { useUsersStore } from "@/stores/useUsersStore"
import { toasts } from "@/utils/toastUtils"

import styles from "./DepartmentManagementModal.module.css"

type DepartmentManagementModalProps = {
  onClose: () => void
}

export function DepartmentManagementModal({
  onClose
}: DepartmentManagementModalProps): JSX.Element {
  const { t } = useTranslation()
  const canManageUsers = usePermission(Permission.ManageUsers)

  const departments = useDepartmentsStore((state) => state.departments)
  const memberships = useDepartmentsStore((state) => state.memberships)
  const ensureDepartmentsLoaded = useDepartmentsStore((state) => state.ensureLoaded)
  const ensureMembershipsLoaded = useDepartmentsStore(
    (state) => state.ensureMembershipsLoaded
  )
  const addDepartment = useDepartmentsStore((state) => state.addDepartment)
  const updateDepartment = useDepartmentsStore((state) => state.updateDepartment)
  const removeDepartment = useDepartmentsStore((state) => state.removeDepartment)
  const addMembership = useDepartmentsStore((state) => state.addMembership)
  const removeMembership = useDepartmentsStore((state) => state.removeMembership)

  const users = useUsersStore((state) => state.users)
  const ensureUsersLoaded = useUsersStore((state) => state.ensureLoaded)

  const sortedDepartments = useMemo(
    () => [...departments].sort((a, b) => a.name.localeCompare(b.name)),
    [departments]
  )
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.username.localeCompare(b.username)),
    [users]
  )

  const [selectedDepartmentId, setSelectedDepartmentId] = useState("")
  const selectedDepartment =
    sortedDepartments.find((department) => department.id === selectedDepartmentId) ??
    sortedDepartments[0] ??
    null

  const [newName, setNewName] = useState("")
  const [newEmoji, setNewEmoji] = useState("🏷️")
  const [newIconFile, setNewIconFile] = useState<File | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmoji, setEditEmoji] = useState("")
  const [editIconFile, setEditIconFile] = useState<File | null>(null)
  const [bulkTargetId, setBulkTargetId] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    ensureDepartmentsLoaded()
    if (canManageUsers) {
      ensureUsersLoaded()
      ensureMembershipsLoaded()
    }
  }, [
    canManageUsers,
    ensureDepartmentsLoaded,
    ensureMembershipsLoaded,
    ensureUsersLoaded
  ])

  useEffect(() => {
    if (!selectedDepartment) return
    setSelectedDepartmentId(selectedDepartment.id)
    setEditName(selectedDepartment.name)
    setEditEmoji(
      selectedDepartment.icon_type === "EMOJI" ? selectedDepartment.icon_value : ""
    )
    setEditIconFile(null)
    setBulkTargetId("")
  }, [selectedDepartment?.id])

  const handleCreate = async () => {
    if (!newName.trim()) return

    setIsSaving(true)
    const resp = await departmentService.createDepartment(
      {
        name: newName.trim(),
        icon_type: newIconFile ? "IMAGE" : "EMOJI",
        icon_value: newIconFile ? undefined : newEmoji.trim()
      },
      newIconFile
    )
    setIsSaving(false)

    if (!resp.success) {
      toasts.apiError(t("departments.toasts.createError"), resp)
      return
    }

    addDepartment(resp.data)
    setSelectedDepartmentId(resp.data.id)
    setNewName("")
    setNewEmoji("🏷️")
    setNewIconFile(null)
    toasts.success(t("departments.toasts.createSuccess"))
  }

  const handleUpdate = async () => {
    if (!selectedDepartment || !editName.trim()) return

    setIsSaving(true)
    const payload = {
      name: editName.trim(),
      ...(editIconFile
        ? { icon_type: "IMAGE" as const }
        : editEmoji.trim()
          ? { icon_type: "EMOJI" as const, icon_value: editEmoji.trim() }
          : {})
    }
    const resp = await departmentService.updateDepartment(
      selectedDepartment.id,
      payload,
      editIconFile
    )
    setIsSaving(false)

    if (!resp.success) {
      toasts.apiError(t("departments.toasts.updateError"), resp)
      return
    }

    updateDepartment(resp.data)
    toasts.success(t("departments.toasts.updateSuccess"))
  }

  const handleDelete = async () => {
    if (!selectedDepartment) return
    if (!window.confirm(t("departments.confirm.delete", { name: selectedDepartment.name }))) {
      return
    }

    const resp = await departmentService.deleteDepartment(selectedDepartment.id)
    if (!resp.success) {
      if (resp.statusCode === 409) {
        toasts.warning(t("departments.toasts.deleteBlocked"))
      } else {
        toasts.apiError(t("departments.toasts.deleteError"), resp)
      }
      return
    }

    removeDepartment(selectedDepartment.id)
    setSelectedDepartmentId("")
    toasts.success(t("departments.toasts.deleteSuccess"))
  }

  const handleBulkMove = async () => {
    if (!selectedDepartment) return
    const targetDepartmentId = bulkTargetId || null
    if (!window.confirm(t("departments.confirm.bulkMove", { name: selectedDepartment.name }))) {
      return
    }

    const resp = await departmentService.bulkMoveNotes(selectedDepartment.id, {
      target_department_id: targetDepartmentId
    })
    if (resp.success) {
      toasts.success(t("departments.toasts.bulkMoveSuccess"))
    } else {
      toasts.apiError(t("departments.toasts.bulkMoveError"), resp)
    }
  }

  const handleBulkDelete = async () => {
    if (!selectedDepartment) return
    if (
      !window.confirm(t("departments.confirm.bulkDelete", { name: selectedDepartment.name }))
    ) {
      return
    }

    const resp = await departmentService.bulkDeleteNotes(selectedDepartment.id)
    if (resp.success) {
      toasts.success(t("departments.toasts.bulkDeleteSuccess"))
    } else {
      toasts.apiError(t("departments.toasts.bulkDeleteError"), resp)
    }
  }

  const handleMembershipChange = async (userId: string, checked: boolean) => {
    if (!selectedDepartment) return

    const resp = checked
      ? await departmentService.addUser(selectedDepartment.id, userId)
      : await departmentService.removeUser(selectedDepartment.id, userId)

    if (!resp.success) {
      toasts.apiError(t("departments.toasts.membershipError"), resp)
      return
    }

    if (checked) {
      addMembership({ department_id: selectedDepartment.id, user_id: userId })
    } else {
      removeMembership(selectedDepartment.id, userId)
    }
  }

  return (
    <div className={styles.container}>
      <button type="button" className={styles.close} onClick={onClose}>
        <IoMdClose size={24} />
      </button>

      <header className={styles.header}>
        <h2>{t("departments.management.title")}</h2>
        <span>{t("departments.management.subtitle")}</span>
      </header>

      <div className={styles.layout}>
        <aside className={styles.departmentList}>
          {sortedDepartments.map((department) => (
            <button
              key={department.id}
              type="button"
              className={styles.departmentButton}
              data-active={department.id === selectedDepartment?.id}
              onClick={() => setSelectedDepartmentId(department.id)}
            >
              <DepartmentIcon department={department} className={styles.icon} />
              <span>{department.name}</span>
            </button>
          ))}

          {sortedDepartments.length === 0 && (
            <span className={styles.empty}>{t("departments.management.empty")}</span>
          )}
        </aside>

        <main className={styles.panel}>
          <section className={styles.section}>
            <h3>{t("departments.management.create")}</h3>
            <div className={styles.formGrid}>
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder={t("departments.fields.name")}
              />
              <input
                value={newEmoji}
                onChange={(event) => setNewEmoji(event.target.value)}
                placeholder={t("departments.fields.emoji")}
              />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.gif"
                onChange={(event) => setNewIconFile(readFile(event))}
              />
              <Button
                disabled={isSaving || !newName.trim()}
                isLoading={isSaving}
                onClick={handleCreate}
              >
                {t("departments.actions.create")}
              </Button>
            </div>
          </section>

          {selectedDepartment && (
            <>
              <section className={styles.section}>
                <h3>{t("departments.management.details")}</h3>
                <div className={styles.formGrid}>
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    placeholder={t("departments.fields.name")}
                  />
                  <input
                    value={editEmoji}
                    onChange={(event) => setEditEmoji(event.target.value)}
                    placeholder={t("departments.fields.emoji")}
                  />
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.gif"
                    onChange={(event) => setEditIconFile(readFile(event))}
                  />
                  <Button
                    disabled={isSaving || !editName.trim()}
                    isLoading={isSaving}
                    onClick={handleUpdate}
                  >
                    <MdSave />
                    {t("commons.save")}
                  </Button>
                </div>
              </section>

              <section className={styles.section}>
                <h3>{t("departments.management.notes")}</h3>
                <div className={styles.actionsRow}>
                  <select
                    value={bulkTargetId}
                    onChange={(event) => setBulkTargetId(event.target.value)}
                  >
                    <option value="">{t("departments.general")}</option>
                    {sortedDepartments
                      .filter((department) => department.id !== selectedDepartment.id)
                      .map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                  </select>
                  <Button onClick={handleBulkMove}>
                    <MdDriveFileMove />
                    {t("departments.actions.bulkMove")}
                  </Button>
                  <Button onClick={handleBulkDelete}>
                    <MdDelete />
                    {t("departments.actions.bulkDelete")}
                  </Button>
                  <Button className={styles.dangerButton} onClick={handleDelete}>
                    <MdDelete />
                    {t("commons.delete")}
                  </Button>
                </div>
              </section>

              <section className={styles.section}>
                <h3>{t("departments.management.members")}</h3>
                {canManageUsers ? (
                  <div className={styles.memberList}>
                    {sortedUsers.map((user) => {
                      const checked = memberships.some(
                        (membership) =>
                          membership.department_id === selectedDepartment.id &&
                          membership.user_id === user.id
                      )

                      return (
                        <label className={styles.memberRow} key={user.id}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              handleMembershipChange(user.id, event.target.checked)
                            }
                          />
                          <span>{user.username}</span>
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <span className={styles.empty}>
                    {t("departments.management.membersPermission")}
                  </span>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function readFile(event: ChangeEvent<HTMLInputElement>): File | null {
  return event.target.files?.[0] ?? null
}
