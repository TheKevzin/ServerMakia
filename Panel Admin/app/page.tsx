import { redirect } from 'next/navigation'

// Root page → redirect to dashboard
// The middleware already handles auth, so if we get here, user is authenticated
export default function Page() {
  redirect('/dashboard')
}
