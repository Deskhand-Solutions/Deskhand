import { Outlet } from 'react-router-dom'
import { LandingHeader } from '../pages/landing/LandingHeader'

export const LandingLayout = () => (
  <div className="landing-shell min-h-svh">
    <LandingHeader />
    <Outlet />
  </div>
)
