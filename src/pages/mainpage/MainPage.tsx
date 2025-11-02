import type { JSX } from "react"
import { Sidebar } from "../../components/Sidebar"
import { APP_NAME } from "../../App"

import styles from "./MainPage.module.css"

type MainPageProps = {
  isAdmin: boolean
}

export function MainPage({ isAdmin }: MainPageProps): JSX.Element {
  return (
    <>
      <title>{`${APP_NAME} - Anotações`}</title>

      <div className="container">
        <Sidebar isAdmin={isAdmin} />
        
        <main className={styles.mainContent}>
          <div className={styles.empty}>
            <span>:/</span>
          </div>
        </main>
      </div>
    </>
  )
}