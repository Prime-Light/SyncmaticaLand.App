import { Prime } from "@/components";

export default function Page() {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Prime.SignupForm />
            </div>
        </div>
    );
}
