import { Typography, Tabs } from "antd";
import "./GlobalView.css";
import Grid from "../../components/grid/Grid";
import { useState } from "react";

const { Title } = Typography;

const GlobalView = () => {
  const [activeTab, setActiveTab] = useState("myView");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const tabItems = [
    { label: "My View", key: "myView" },
    { label: "Team View", key: "teamView" },
    { label: "Custom View", key: "customView" },
    { label: "Zohi Analytics", key: "zohiAnalytics" },
  ];

  return (
    <div className="global-view-container">
      <Title level={3}>Global View</Title>
      
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="custom-tabs"
        items={tabItems}
      />
      
      <Grid />
    </div>
  );
};

export default GlobalView;
