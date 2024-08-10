import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Layout, Menu } from "antd";
import "./SideBar.css";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Sider } = Layout;

const SiderBar = () => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  const handleNavigation = (e) => {
    navigate(e.key);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const items = [
    {
      key: "/",
      label: "Global View",
    },
    {
      key: "/cicd",
      label: "CI/CD",
    },
    {
      key: "/feed",
      label: "Feed",
    },
    {
      key: "/webtasks",
      label: "Web Tasks",
    },
  ];

  return (
    <Layout>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleSidebar}
        className="sidebar"
        trigger={null}  // Disable the default trigger button
      >
        <Button
          className="menu-home-button"
          onClick={toggleSidebar}
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        >
          {!collapsed && ' Sprints'}
        </Button>
        <Menu
          theme="dark"
          items={items}
          className="sidebar-menu"
          onClick={handleNavigation}
        />
      </Sider>
    </Layout>
  );
};

export default SiderBar;
