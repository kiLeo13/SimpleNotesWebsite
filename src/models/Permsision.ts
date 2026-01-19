class Permission {
  public readonly offset: number
  public readonly label: string

  private constructor(offset: number, label: string) {
    this.offset = offset
    this.label = label
  }

  // Soon
  static readonly ReadNotes = new Permission(0, "Read Notes")

  static get all(): Permission[] {
    return []
  }
}