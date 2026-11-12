import FooterLayout from "./FooterLayout";
import Sidebar from "../components/Sidebar";

export default function MainLayout({children, title}){
  return (
    <>
      <title>{title}</title>
      <div className="customer-dashboard">
        <Sidebar>
          {children}
          <FooterLayout/>
        </Sidebar>
      </div>
    </>
  )
}