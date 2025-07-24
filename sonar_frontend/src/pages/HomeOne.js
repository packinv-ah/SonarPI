import { Link } from "react-router-dom";
import Header from "./Header";
import { MdOutlineRequestQuote } from "react-icons/md";
import { useNavigate } from "react-router-dom";

function Home() {
  let navigate = useNavigate();

  return (
    <>
      <Header user={false} />
      <button
        className="button-style "
        style={{
          backgroundColor: "#283E81",
          borderRadius: "10px",
          marginLeft: "42px",
        }}
        onClick={() => navigate("../home")}
      >
        Previous Menu
      </button>
      <div className="card-container">
        <Link
          to="/PackingAndInvoices"
          style={{ textDecoration: "none", color: "black" }}
        >
          <div className="dashboard-card">
            <div className="card-item">
              <MdOutlineRequestQuote size={60} color="#283E81" />
              <span className="dashboard-link">PackingInv</span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

export default Home;
