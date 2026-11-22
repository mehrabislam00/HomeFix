/** What the Navbar needs to know about the signed-in user. */
export type SessionUser = {
  name: string
  email: string
  /** Profile picture URL. When missing, initials are shown. */
  image?: string
}