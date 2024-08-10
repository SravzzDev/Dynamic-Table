import { useNavigate } from "react-router-dom";
import { Button, Layout, Menu } from "antd";
import "./SideBar.css";
import { MenuFoldOutlined } from "@ant-design/icons";

const{Sider} = Layout;

const SiderBar = () => {
  const navigate = useNavigate();

  const handleNavigation = (e) => {
    navigate(e.key);
  };

  const items = [
    {
      key: "/",
      label: "Global View",
    //   icon: <AppstoreOutlined />,
    },
    {
      key: "/cicd",
      label: "CI/CD",
    //   icon: <BankOutlined />,
    },
    {
      key: "/feed",
      label: "Feed",
    //   icon: <BarsOutlined />,
    },
    {
        key: "/webtasks",
        label: "Web Tasks",
      //   icon: <BarsOutlined />,
      },
  ];
  return (
    <div className="sidebar-menu-container">
      <Sider collapsed={false} className="sidebar">
        <Button className="menu-home-button">Sprints <MenuFoldOutlined /></Button>
        <Menu
          theme="dark"
          items={items}
          className="sidebar-menu"
          onClick={handleNavigation}
        />
      </Sider>
    </div>
  );
};

export default SiderBar;
