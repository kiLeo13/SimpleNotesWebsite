import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Toaster } from "sonner"

export const Route = createRootRoute({
  component: RootLayout
})

function RootLayout() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        visibleToasts={6}
        expand
        toastOptions={{
          duration: 5000,
          style: {
            backgroundColor: "rgb(33, 29, 43)",
            borderColor: "rgba(60, 55, 77, 1)"
          }
        }}
      />

      <Outlet />
    </>
  )
}
