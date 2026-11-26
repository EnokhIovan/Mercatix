
import FooterLayout from "./FooterLayout";
import Sidebar from "../components/Sidebar";
import { getUser } from "../api/api";
import { useEffect } from "react";

export default function PageLayout({ children, title, searchBox }) {
  useEffect(() => {
    getUser()
      .then((response) => {
        setUser
      })
  })

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