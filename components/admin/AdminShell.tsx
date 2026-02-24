"use client";
import Link from "next/link";
import { useState } from "react";
import Toast from "@/components/Toast";
export default function AdminShell({ title, backHref, children }:
{ title: string; backHref: string; children: (setToast:(t:any)=>void)=>React.ReactNode; }) {
  const [toast, setToast] = useState<any>(null);
  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="h1">{title}</h1>
        <Link className="pill" href={backHref}>Voltar</Link>
      </div>
      {children(setToast)}
      <Toast message={toast} />
    </div>
  );
}
