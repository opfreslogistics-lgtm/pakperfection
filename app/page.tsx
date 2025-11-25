import { redirect } from 'next/navigation'

export default function Home() {
  // Public access - redirect to home page
  redirect('/home')
}

