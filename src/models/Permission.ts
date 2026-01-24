export class Permission {
  public readonly label: string
  public readonly offset: number
  public readonly raw: number

  private constructor(offset: number, label: string) {
    this.label = label
    this.offset = offset
    this.raw = 1 << offset
  }

  static readonly Administrator = new Permission(0, "Administrator")
  static readonly CreateNotes = new Permission(1, "Create Notes")
  static readonly EditNotes = new Permission(2, "Edit Notes")
  static readonly DeleteNotes = new Permission(3, "Delete Notes")
  static readonly SeeHiddenNotes = new Permission(4, "See Hidden Notes")
  static readonly ManageUsers = new Permission(5, "Manage Users")

  static get all(): Permission[] {
    return [
      Permission.Administrator,
      Permission.CreateNotes,
      Permission.EditNotes,
      Permission.DeleteNotes,
      Permission.SeeHiddenNotes,
      Permission.ManageUsers
    ]
  }

  static hasRaw(userMask: number, permission: Permission): boolean {
    return (userMask & permission.raw) === permission.raw
  }

  static hasEffective(userMask: number, permission: Permission): boolean {
    return (
      Permission.hasRaw(userMask, Permission.Administrator) ||
      Permission.hasRaw(userMask, permission)
    )
  }
}
