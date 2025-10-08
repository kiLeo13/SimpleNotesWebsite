import type { JSX } from "react"
import { Sidebar } from "../../components/Sidebar"
import { APP_NAME } from "../../App"

type MainPageProps = {
  sidebarLoading: boolean
  isAdmin: boolean
}

export function MainPage({ sidebarLoading, isAdmin }: MainPageProps): JSX.Element {
  return (
    <>
      <title>{`${APP_NAME} - Anotações`}</title>

      <div className="container">
        <Sidebar sidebarLoading={sidebarLoading} isAdmin={isAdmin} />
        
        <main className="main-content" id="content-board">
          <div className="empty-content-box">
            <span>:/</span>
          </div>
        </main>
      </div>
    </>
  )
}