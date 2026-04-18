import { redirect } from "next/navigation";
import { createSupabaseServerClient, supabaseServerAdmin } from "@/lib/database";
import { Shadcn, Prime } from "@/components";
import { CurrentUser } from "@/hooks/use-current-user";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: profile } = await supabaseServerAdmin
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("user_id", user.id)
        .single();

    const currentUser: CurrentUser = {
        user_id: user.id,
        email: user.email ?? "",
        display_name: profile?.display_name ?? "",
        avatar_url: profile?.avatar_url ?? "",
        role: profile?.role ?? "user",
    };

    return (
        <Shadcn.SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }>
            <Prime.AppSidebar variant="inset" currentUser={currentUser} />
            <Shadcn.SidebarInset>{children}</Shadcn.SidebarInset>
        </Shadcn.SidebarProvider>
    );
}
