import { Typography, Tabs } from "antd";
import "./GlobalView.css";
import Grid from "../../components/grid/Grid";
import { useState } from "react";

const { TabPane } = Tabs;

const GlobalView = () => {
  const [activeTab, setActiveTab] = useState("myView");

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="global-view-container">
      <Typography.Title level={3}>Global View</Typography.Title>
      
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="custom-tabs"
      >
        <TabPane tab="My View" key="myView" />
        <TabPane tab="Team View" key="teamView" />
        <TabPane tab="Custom View" key="customView" />
        <TabPane tab="Zohi Analytics" key="zohiAnalytics" />
      </Tabs>
      
      <Grid />
    </div>
  );
};

export default GlobalView;
