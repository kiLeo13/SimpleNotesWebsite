import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { AuditActionType, AuditLogEntryData } from "@/types/api/audit"

import { AuditLogsModal } from "./AuditLogsModal"
import { auditService } from "@/services/auditService"
import { userService } from "@/services/userService"
import { useUsersStore } from "@/stores/useUsersStore"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mockT = (
  key: string,
  options?: Record<string, unknown>
): string => {
  const labels: Record<string, string> = {
    "modals.audit.close": "Fechar logs de auditoria",
    "modals.audit.title": "Logs de Auditoria",
    "modals.audit.subtitle":
      "Acompanhe as alterações mais recentes e abra cada item para ver os campos afetados.",
    "modals.audit.loading": "Carregando o rastro de auditoria mais recente...",
    "modals.audit.loadError": "Erro ao carregar",
    "modals.audit.retry": "Tentar novamente",
    "modals.audit.empty": "Nenhum log de auditoria foi encontrado ainda.",
    "modals.audit.loadMoreHint": "Role para continuar carregando eventos antigos.",
    "modals.audit.endReached": "Você chegou ao fim dos logs disponíveis.",
    "modals.audit.noChanges": "Sem alterações",
    "modals.audit.emptyValue": "Sem valor",
    "modals.audit.system": "Sistema",
    "modals.audit.loadingActor": `Carregando usuário #${options?.id}`,
    "modals.audit.unknownActor": `Usuário #${options?.id}`,
    "modals.audit.filters.actor": "Ator",
    "modals.audit.filters.action": "Ação",
    "modals.audit.filters.subject": "Alvo",
    "modals.audit.filters.subjectId": "ID do Alvo",
    "modals.audit.filters.subjectIdPlaceholder": "Ex: 42 ou 12345678000195",
    "modals.audit.filters.allActors": "Todos os atores",
    "modals.audit.filters.allActions": "Todas as ações",
    "modals.audit.filters.allSubjects": "Todos os alvos",
    "modals.audit.filters.apply": "Aplicar",
    "modals.audit.filters.clear": "Limpar",
    "modals.audit.labels.actor": "Ator",
    "modals.audit.labels.source": "Origem",
    "modals.audit.labels.eventId": "ID do Evento",
    "modals.audit.labels.oldValue": "Valor Anterior",
    "modals.audit.labels.newValue": "Novo Valor",
    "modals.audit.actions.noteCreate": "Nota criada",
    "modals.audit.actions.noteUpdate": "Nota atualizada",
    "modals.audit.actions.noteDelete": "Nota excluída",
    "modals.audit.actions.userUpdate": "Usuário atualizado",
    "modals.audit.actions.userSuspend": "Usuário suspenso",
    "modals.audit.actions.userUnsuspend": "Suspensão removida",
    "modals.audit.actions.userDelete": "Usuário excluído",
    "modals.audit.actions.companyLookup": "Consulta de empresa",
    "modals.audit.subjects.note": "Nota",
    "modals.audit.subjects.user": "Usuário",
    "modals.audit.subjects.company": "Empresa",
    "modals.audit.sources.httpApi": "HTTP API",
    "errors.auditLogs": "Erro ao carregar logs de auditoria"
  }

  if (key === "modals.audit.loadedCount") {
    return `${options?.count} eventos carregados`
  }

  if (key === "modals.audit.summary.noteCreate") {
    return `${options?.actor} criou a nota #${options?.subjectId}`
  }

  if (key === "modals.audit.summary.noteUpdate") {
    return `${options?.actor} alterou a nota #${options?.subjectId}`
  }

  if (key === "modals.audit.summary.noteDelete") {
    return `${options?.actor} excluiu a nota #${options?.subjectId}`
  }

  if (key === "modals.audit.summary.userUpdate") {
    return `${options?.actor} atualizou o usuário ${options?.username}`
  }

  if (key === "modals.audit.summary.userSuspend") {
    return `${options?.actor} suspendeu o usuário ${options?.username}`
  }

  if (key === "modals.audit.summary.userUnsuspend") {
    return `${options?.actor} removeu a suspensão do usuário ${options?.username}`
  }

  if (key === "modals.audit.summary.userDelete") {
    return `${options?.actor} excluiu o usuário ${options?.username}`
  }

  if (key === "modals.audit.summary.companyLookup") {
    return `${options?.actor} consultou a empresa ${options?.subjectId}`
  }

  if (key === "modals.audit.summary.fallback") {
    return `${options?.actor} executou ${options?.action} em ${options?.subjectType} #${options?.subjectId}`
  }

  if (key === "modals.audit.change.created") {
    return `Definiu ${options?.field} como ${options?.newValue}`
  }

  if (key === "modals.audit.change.deleted") {
    return `Removeu ${options?.field} (antes: ${options?.oldValue})`
  }

  if (key === "modals.audit.change.updated") {
    return `Alterou ${options?.field} de ${options?.oldValue} para ${options?.newValue}`
  }

  return labels[key] ?? key
}

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT
  })
}))

vi.mock("@/utils/toastUtils", () => ({
  toasts: {
    apiError: vi.fn()
  }
}))

vi.mock("@/services/auditService", () => ({
  auditService: {
    listAuditLogs: vi.fn()
  }
}))

vi.mock("@/services/userService", () => ({
  userService: {
    getUserById: vi.fn(),
    getUsers: vi.fn()
  }
}))

vi.mock("@/components/vanilla/inputs/CustomSelect", () => ({
  CustomSelect: ({
    options,
    value,
    onChange,
    ...props
  }: {
    options: Array<{ value: string; label: string }>
    value?: string
    onChange: (value: string) => void
    "aria-label"?: string
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value || option.label} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}))

const mockedAuditService = vi.mocked(auditService)
const mockedUserService = vi.mocked(userService)

describe("AuditLogsModal", () => {
  beforeEach(() => {
    mockedAuditService.listAuditLogs.mockReset()
    mockedUserService.getUserById.mockReset()
    useUsersStore.setState({
      users: [],
      state: "READY",
      _fetchPromise: null
    })
  })

  it("renders a compact i18n summary row and expands change details", async () => {
    useUsersStore.setState({
      users: [makeUser("7", "Leonardo")]
    })

    mockedAuditService.listAuditLogs.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      data: {
        entries: [makeAuditEntry("evt-1", "101", "NOTE_UPDATE", "7")],
        nextBeforeId: undefined
      }
    })

    render(<AuditLogsModal setShowAuditLogs={vi.fn()} />)

    const rowButton = await screen.findByRole("button", {
      name: /Leonardo alterou a nota #101/i
    })

    expect(rowButton).toBeInTheDocument()

    fireEvent.click(rowButton)

    expect(
      await screen.findByText("Alterou name de Antigo para Novo")
    ).toBeInTheDocument()
  })

  it("fetches a missing actor through the user service when the store does not have it", async () => {
    mockedAuditService.listAuditLogs.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      data: {
        entries: [makeAuditEntry("evt-2", "202", "NOTE_CREATE", "88")],
        nextBeforeId: undefined
      }
    })
    mockedUserService.getUserById.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      data: makeUser("88", "Maria")
    })

    render(<AuditLogsModal setShowAuditLogs={vi.fn()} />)

    expect(await screen.findByText("Maria criou a nota #202")).toBeInTheDocument()
    expect(mockedUserService.getUserById).toHaveBeenCalledWith("88")
  })

  it("resolves missing user subjects for lifecycle events", async () => {
    useUsersStore.setState({
      users: [makeUser("7", "Leonardo")]
    })

    mockedAuditService.listAuditLogs.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      data: {
        entries: [
          makeAuditEntry("evt-5", "88", "USER_DELETE", "7", {
            subjectType: "USER",
            changes: []
          })
        ],
        nextBeforeId: undefined
      }
    })
    mockedUserService.getUserById.mockResolvedValueOnce({
      success: true,
      statusCode: 200,
      data: makeUser("88", "Maria")
    })

    render(<AuditLogsModal setShowAuditLogs={vi.fn()} />)

    expect(
      await screen.findByText("Leonardo excluiu o usuário Maria")
    ).toBeInTheDocument()
    expect(mockedUserService.getUserById).toHaveBeenCalledWith("88")
  })

  it("auto-applies filters and keeps them while loading more entries", async () => {
    useUsersStore.setState({
      users: [makeUser("7", "Leonardo")]
    })

    mockedAuditService.listAuditLogs.mockImplementation(async (params = {}) => {
      if (
        params.actorUserId === "7" &&
        params.actionType === "NOTE_UPDATE" &&
        params.subjectType === "NOTE" &&
        params.beforeId === "cursor-1"
      ) {
        return {
          success: true,
          statusCode: 200,
          data: {
            entries: [makeAuditEntry("evt-4", "203", "NOTE_UPDATE", "7")],
            nextBeforeId: undefined
          }
        }
      }

      if (
        params.actorUserId === "7" &&
        params.actionType === "NOTE_UPDATE" &&
        params.subjectType === "NOTE"
      ) {
        return {
          success: true,
          statusCode: 200,
          data: {
            entries: [makeAuditEntry("evt-3", "202", "NOTE_UPDATE", "7")],
            nextBeforeId: "cursor-1"
          }
        }
      }

      return {
        success: true,
        statusCode: 200,
        data: {
          entries: [makeAuditEntry("evt-1", "101", "NOTE_CREATE", "7")],
          nextBeforeId: undefined
        }
      }
    })

    render(<AuditLogsModal setShowAuditLogs={vi.fn()} />)

    await screen.findByText("Leonardo criou a nota #101")

    fireEvent.change(screen.getByLabelText("Ator"), {
      target: { value: "7" }
    })
    fireEvent.change(screen.getByLabelText("Ação"), {
      target: { value: "NOTE_UPDATE" }
    })
    fireEvent.change(screen.getByLabelText("Alvo"), {
      target: { value: "NOTE" }
    })

    await waitFor(() => {
      expect(mockedAuditService.listAuditLogs).toHaveBeenLastCalledWith({
        limit: 50,
        actorUserId: "7",
        actionType: "NOTE_UPDATE",
        subjectType: "NOTE",
        beforeId: undefined
      })
    })

    expect(await screen.findByText("Leonardo alterou a nota #202")).toBeInTheDocument()

    const list = screen.getByTestId("audit-log-list")
    Object.defineProperty(list, "scrollHeight", {
      configurable: true,
      value: 1000
    })
    Object.defineProperty(list, "clientHeight", {
      configurable: true,
      value: 300
    })
    Object.defineProperty(list, "scrollTop", {
      configurable: true,
      value: 720,
      writable: true
    })

    fireEvent.scroll(list)

    await waitFor(() => {
      expect(mockedAuditService.listAuditLogs).toHaveBeenLastCalledWith({
        limit: 50,
        actorUserId: "7",
        actionType: "NOTE_UPDATE",
        subjectType: "NOTE",
        beforeId: "cursor-1"
      })
    })

    expect(await screen.findByText("Leonardo alterou a nota #203")).toBeInTheDocument()
  })
})

function makeAuditEntry(
  id: string,
  subjectId: string,
  actionType: AuditActionType,
  actorUserId: string,
  overrides: Partial<AuditLogEntryData> = {}
): AuditLogEntryData {
  return {
    id,
    actorUserId,
    actionType,
    subjectType: "NOTE",
    subjectId,
    source: "HTTP_API",
    occurredAt: "2026-04-19T00:00:00Z",
    changes: [
      {
        fieldName: "name",
        oldValue: actionType === "NOTE_CREATE" ? undefined : "Antigo",
        newValue: "Novo",
        valueType: "STRING"
      }
    ],
    ...overrides
  }
}

function makeUser(id: string, username: string) {
  return {
    id,
    username,
    permissions: 0,
    presence: "OFFLINE" as const,
    isVerified: true,
    suspended: false,
    createdAt: "2026-04-19T00:00:00Z",
    updatedAt: "2026-04-19T00:00:00Z"
  }
}
