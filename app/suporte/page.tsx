import Link from "next/link";
import SupportClient from "./ui/SupportClient";
export default function Suporte(){
  return (
    <div className="container">
      <div className="row" style={{alignItems:"center",justifyContent:"space-between"}}>
        <h1 className="h1">Suporte</h1>
        <Link className="pill" href="/">Voltar</Link>
      </div>
      <SupportClient />
    </div>
  );
}
