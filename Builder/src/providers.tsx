import type { ReactNode } from "react";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth-client";
import { useNavigate, Link } from "react-router-dom";

function LinkAdapter({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={navigate}
      Link={LinkAdapter}
    >
      {children}
    </AuthUIProvider>
  );
}

