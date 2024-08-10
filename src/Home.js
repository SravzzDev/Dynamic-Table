import SiderBar from "./components/sidebar/SideBar";
import "./Home.css";
import Content from "./pages/Content/Content";

function Home() {
  return (
    <div className="home-container">
      <SiderBar/>
      <Content/>
    </div>
  );
}

export default Home;
