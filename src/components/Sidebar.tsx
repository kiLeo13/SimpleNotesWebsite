import type { JSX } from "react"
import "./Sidebar.css"

type SidebarProps = {
  sidebarLoading: boolean;
  isAdmin: boolean;
}

export function Sidebar({ sidebarLoading, isAdmin }: SidebarProps): JSX.Element {
  return (
    <nav className="left-menu">
      <div className="menu-upper-controls">
        <input disabled={sidebarLoading} type="text" id="search-input" placeholder="Pesquisar" autoComplete="off" />
        <div className="menu-divider"></div>
        <span id="search-result-count">0 resultados encontrados</span>
      </div>
      <div id="notes-container" className="menu-lower-items">
        <div className="sidebar-loader-container">
          {sidebarLoading && <div className="loader" id="sidebar-loader"></div>}
        </div>
      </div>
      <div className="menu-footer-controls">
        <div className="sidebar-pfp">L</div>
        {isAdmin && (
          <button className="footer-control-button" id="create-note-button">+</button>
        )}
      </div>
    </nav>
  )
}