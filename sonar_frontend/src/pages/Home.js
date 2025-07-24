import { Link } from "react-router-dom";
import Header from "./Header";
import { RiUserSettingsFill } from "react-icons/ri";

// Home page component for dashboard navigation
function Home() {
  return (
    <>
      <Header user={false} />
      <div className="card-container">
        <Link
          to="/salesHome"
          style={{ textDecoration: "none", color: "black" }}
        >
          <div className="dashboard-card">
            <div className="card-item">
              <RiUserSettingsFill size={60} color="#283E81" />
              <span className="dashboard-link"> Sales</span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

export default Home;
