import FooterLayout from "./FooterLayout";
import Sidebar from "../components/Sidebar";

export default function PageLayout({ children, title, searchBox }) {
  return (
    <>
      <title>{title}</title>

      <div className="customer-dashboard">
        <Sidebar searchBox={searchBox}>
          {children}
          <FooterLayout />
        </Sidebar>
      </div>
    </>
  );
}