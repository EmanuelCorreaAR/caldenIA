import type { ReactNode } from "react";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <div className="bg-field min-h-dvh">{children}</div>;
}
