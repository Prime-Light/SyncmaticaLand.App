import { PrimeLight } from "@/components";

export default function LoginPage() {
    return (
        <div className="bg-background fixed inset-0 flex flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <PrimeLight.LoginForm />
            </div>
        </div>
    );
}
