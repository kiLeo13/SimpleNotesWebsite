import type { ReactNode } from "react"

import { SidebarFooter } from "./SidebarFooter"
import { Permission } from "@/models/Permission"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

const mockUsePermission = vi.fn()

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "tooltips.labels.auditLogs": "Logs de Auditoria",
        "tooltips.labels.algoCalc": "Pedra Chave",
        "tooltips.labels.lookup": "Consultar",
        "tooltips.labels.createNote": "Criar Nota",
        "tooltips.labels.usersMng": "Gerenciar Usuários",
        "tooltips.labels.settings": "Configurações",
        "menus.settings.signout": "Sair",
        "menus.notes.optText": "Markdown / Texto",
        "menus.notes.optFlowchart": "Diagrama",
        "menus.notes.optFile": "Arquivo",
        "warnings.noAccessToken": "Nenhum access token encontrado!"
      })[key] ?? key
  })
}))

vi.mock("@/hooks/usePermission", () => ({
  usePermission: (permission: Permission) => mockUsePermission(permission)
}))

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => vi.fn()
}))

vi.mock("../DarkWrapper", () => ({
  DarkWrapper: ({ children, open }: { children: ReactNode; open?: boolean }) =>
    open ? <>{children}</> : null
}))

vi.mock("../ui/ActionMenu", () => ({
  ActionMenu: ({ children }: { children: ReactNode }) => <>{children}</>
}))

vi.mock("../ui/AppTooltip", () => ({
  AppTooltip: ({ children }: { children: ReactNode }) => <>{children}</>
}))

vi.mock("../modals/notes/creations/editors/CreateEditorModal", () => ({
  CreateEditorModal: () => <div>Create Editor Modal</div>
}))

vi.mock("../modals/notes/creations/uploads/CreateNoteModalForm", () => ({
  CreateNoteModalForm: () => <div>Create Note Modal</div>
}))

vi.mock("../modals/users/management/UserManagementPopover", () => ({
  UserManagementPopover: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  )
}))

vi.mock("../modals/global/algorithm/AlgorithmCalculator", () => ({
  AlgorithmCalculator: () => <div>Algorithm Calculator</div>
}))

vi.mock("../modals/global/lookup/CompanyLookupModal", () => ({
  CompanyLookupModal: () => <div>Company Lookup Modal</div>
}))

vi.mock("../modals/global/audit/AuditLogsModal", () => ({
  AuditLogsModal: () => <div>Audit Logs Modal</div>
}))

vi.mock("@/services/userService", () => ({
  userService: {
    logout: vi.fn()
  }
}))

vi.mock("@/utils/toastUtils", () => ({
  toasts: {
    warning: vi.fn(),
    apiError: vi.fn()
  }
}))

describe("SidebarFooter", () => {
  beforeEach(() => {
    mockUsePermission.mockReset()
    mockUsePermission.mockImplementation((permission: Permission) => {
      return permission.raw === Permission.ReadAuditLogs.raw
    })
  })

  it("shows the audit logs button only for users with the audit permission", () => {
    render(<SidebarFooter />)

    expect(
      screen.getByRole("button", { name: "Logs de Auditoria" })
    ).toBeInTheDocument()
  })

  it("opens the audit logs modal when the audit button is clicked", async () => {
    render(<SidebarFooter />)

    fireEvent.click(screen.getByRole("button", { name: "Logs de Auditoria" }))

    expect(await screen.findByText("Audit Logs Modal")).toBeInTheDocument()
  })

  it("hides the audit logs button without the audit permission", () => {
    mockUsePermission.mockReturnValue(false)

    render(<SidebarFooter />)

    expect(
      screen.queryByRole("button", { name: "Logs de Auditoria" })
    ).not.toBeInTheDocument()
  })
})
