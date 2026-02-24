import Link from "next/link";
import CatalogClient from "@/components/CatalogClient";
export default function Cursos() {
  return (
    <div className="container">
      <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="h1">Cursos</h1>
        <Link className="pill" href="/catalogo">Voltar</Link>
      </div>
      <CatalogClient type="cursos" />
    </div>
  );
}
