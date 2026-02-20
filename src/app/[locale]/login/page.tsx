import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="bg-background fixed inset-0 flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
