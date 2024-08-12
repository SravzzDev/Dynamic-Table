import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Table,
  Button,
  Dropdown,
  Menu,
  Checkbox,
  message,
  Modal,
  InputNumber,
} from "antd";
import { MenuOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { FetchProducts } from "../../api/Api";
import axios from "axios";
import "./Grid.css";

const Grid = () => {
  // State hooks
  const [originalColumns, setOriginalColumns] = useState([
    {
      title: "Name",
      dataIndex: "name",
      editable: true,
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend", null],
    },
    {
      title: "Username",
      dataIndex: "username",
      editable: true,
      width: 200,
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortDirections: ["ascend", "descend", null],
    },
    {
      title: "Email",
      dataIndex: "email",
      editable: true,
      width: 250,
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["ascend", "descend", null],
    },
    {
      title: "Phone",
      dataIndex: "phone",
      editable: true,
      width: 200,
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      sortDirections: ["ascend", "descend", null],
    },
    {
      title: "Website",
      dataIndex: "website",
      editable: true,
      width: 250,
      sorter: (a, b) => a.website.localeCompare(b.website),
      sortDirections: ["ascend", "descend", null],
    },
  ]);
  const [products, setProducts] = useState([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [editingColumn, setEditingColumn] = useState("");
  const [columnsOrder, setColumnsOrder] = useState([]);
  const [tempColumnsOrder, setTempColumnsOrder] = useState([]);
  const [isReorderModalVisible, setIsReorderModalVisible] = useState(false);
  const [isCreateViewModalVisible, setIsCreateViewModalVisible] =
    useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    username: true,
    email: true,
    phone: true,
    website: true,
  });
  const [searchText, setSearchText] = useState("");
  const [views, setViews] = useState([]);
  const [newViewName, setNewViewName] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState("");

  useEffect(() => {
    const GetProducts = async () => {
      try {
        const products = await FetchProducts();
        setProducts(products);
        message.success("Products fetched successfully!");
      } catch (error) {
        message.error("Failed to fetch products.");
      }
    };
    GetProducts();

    const savedViews = JSON.parse(localStorage.getItem("views")) || [];
    setViews(savedViews);
    setColumnsOrder(originalColumns); // Default columns
  }, []);
  // const originalColumns = ;
  const mergedColumns =
    columnsOrder.length > 0 ? columnsOrder : originalColumns;
  const visibleMergedColumns = mergedColumns.filter(
    (col) => visibleColumns[col.dataIndex]
  );

  const isEditing = (record, column) =>
    record.id === editingKey && column === editingColumn;

  const edit = (record, column) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
    setEditingColumn(column);
    message.info(`Editing ${column} for ${record.name}`);
  };

  const cancel = () => {
    setEditingKey("");
    setEditingColumn("");
    message.info("Edit cancelled");
  };

  const save = async () => {
    try {
      const row = await form.validateFields();
      const newData = [...products];
      const index = newData.findIndex((item) => editingKey === item.id);

      if (index > -1) {
        const item = newData[index];
        const updatedItem = { ...item, ...row };
        newData.splice(index, 1, updatedItem);
        setProducts(newData);
        setEditingKey("");

        // Update the product on the server
        await axios.put(
          `https://jsonplaceholder.typicode.com/users/${item.id}`,
          updatedItem
        );
        message.success("Product updated successfully!");
      }
    } catch (errInfo) {
      message.error("Save failed. Please check your input.");
    }
  };

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        save();
      }
    };

    return (
      <td {...restProps} onDoubleClick={() => edit(record, dataIndex)}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {React.cloneElement(inputNode, { onKeyDown: handleKeyDown })}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const showReorderModal = () => {
    setTempColumnsOrder(mergedColumns);
    setIsReorderModalVisible(true);
  };

  const handleDrop = (item, index) => {
    const reorderedColumns = Array.from(tempColumnsOrder);
    const [movedColumn] = reorderedColumns.splice(item.index, 1);
    reorderedColumns.splice(index, 0, movedColumn);
    setTempColumnsOrder(reorderedColumns);
  };

  const ColumnItem = ({ column, index }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "COLUMN",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop({
      accept: "COLUMN",
      hover: (item) => {
        if (item.index !== index) {
          handleDrop(item, index);
          item.index = index;
        }
      },
    });

    return (
      <li
        ref={(node) => drag(drop(node))}
        style={{
          opacity: isDragging ? 0.5 : 1,
          userSelect: "none",
          padding: 16,
          marginBottom: 8,
          backgroundColor: "#ffffff",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ cursor: "grab" }}>
          <MenuOutlined style={{ marginRight: 8 }} />
          {column.title}
        </span>
      </li>
    );
  };

  const handleReorderOk = () => {
    setColumnsOrder(tempColumnsOrder);
    setIsReorderModalVisible(false);
  };

  const handleReorderCancel = () => {
    setIsReorderModalVisible(false);
  };

const handleCreateView = () => {
  if (!newViewName) {
    message.error("Please enter a view name.");
    return;
  }

  const newView = {
    name: newViewName,
    columns: selectedColumns,
  };

  const existingViews = JSON.parse(localStorage.getItem("views")) || [];
  localStorage.setItem("views", JSON.stringify([...existingViews, newView]));

  setViews([...existingViews, newView]);
  setNewViewName(""); // Clear the new view name
  setSelectedColumns([]);
  setIsCreateViewModalVisible(false);
  message.success("View created successfully!");
};


  const handleCheckboxChange = (column, checked) => {
    setSelectedColumns((prev) =>
      checked ? [...prev, column] : prev.filter((c) => c !== column)
    );
  };

  const handleViewClick = (view) => {
    const columns = originalColumns.filter((col) =>
      view.columns.includes(col.dataIndex)
    );
    setColumnsOrder(columns);
    message.info(`Viewing ${view.name}`);
  };
  

  const handleDeleteView = (viewName) => {
    const updatedViews = views.filter((view) => view.name !== viewName);
    localStorage.setItem("views", JSON.stringify(updatedViews));
    setViews(updatedViews);
    if (updatedViews.length === 0) {
      setColumnsOrder(originalColumns); // Revert to default view if no saved views
    }
    message.success(`View ${viewName} deleted.`);
  };

  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
    message.info(`${column} visibility toggled`);
  };

  const columnVisibilityMenu = (
    <Menu>
      {originalColumns.map((col) => (
        <Menu.Item key={col.dataIndex}>
          <Checkbox
            checked={visibleColumns[col.dataIndex]}
            onChange={() => handleColumnVisibilityChange(col.dataIndex)}
            onClick={(e) => e.stopPropagation()}
          >
            {col.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  const filteredData = products.filter((product) =>
    Object.values(product)
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const addNewColumn = () => {
    if (!newColumnName.trim()) {
      message.error("Please enter a column name.");
      return;
    }
  
    const newColumn = {
      title: newColumnName,
      dataIndex: newColumnName.toLowerCase().replace(/\s+/g, "_"), // Create a unique dataIndex
      editable: true,
      width: 200,
    };
  
    setOriginalColumns((prev) => [...prev, newColumn]);
    setVisibleColumns((prev) => ({ ...prev, [newColumn.dataIndex]: true }));
    setSelectedColumns((prev) => [...prev, newColumn.dataIndex]);
    setNewColumnName(""); // Reset the input field
    message.success("New column added successfully!");
  };
  
console.log(originalColumns);
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid-container">
        <Button onClick={showReorderModal}>Reorder Columns</Button>
        <Input.Search
          placeholder="Search all fields"
          value={searchText}
          onChange={handleSearch}
          style={{
            marginBottom: 16,
            width: 300,
            marginRight: "30px",
            marginLeft: "30px",
          }}
        />

      

        <Dropdown overlay={columnVisibilityMenu}>
          <Button style={{ marginRight: "30px" }}>
            Column Visibility <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown
          overlay={
            <Menu>
              {views.map((view) => (
                <Menu.Item key={view.name}>
                  <Button onClick={() => handleViewClick(view)}>
                    {view.name}
                  </Button>
                  <Button onClick={() => handleDeleteView(view.name)} danger>
                    Delete
                  </Button>
                </Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button style={{ marginRight: "30px" }}>
            Saved Views <DownOutlined />
          </Button>
        </Dropdown>
        <Button onClick={() => setIsCreateViewModalVisible(true)}>
          Create New View
        </Button>
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            columns={visibleMergedColumns.map((col, index) => ({
              ...col,
              onCell: (record) => ({
                record,
                inputType: col.dataIndex === "phone" ? "number" : "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record, col.dataIndex),
              }),
            }))}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              defaultPageSize: 5,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "15", "20"],
            }}
          />
        </Form>
        <Modal
          title="Reorder Columns"
          visible={isReorderModalVisible}
          onOk={handleReorderOk}
          onCancel={handleReorderCancel}
        >
          <ul style={{ padding: 0, listStyleType: "none" }}>
            {tempColumnsOrder.map((column, index) => (
              <ColumnItem
                key={column.dataIndex}
                column={column}
                index={index}
              />
            ))}
          </ul>
        </Modal>
        <Modal
  title="Create New View"
  visible={isCreateViewModalVisible}
  onOk={handleCreateView}
  onCancel={() => setIsCreateViewModalVisible(false)}
>
  <Form.Item label="View Name">
    <Input
      value={newViewName}
      onChange={(e) => setNewViewName(e.target.value)}
    />
  </Form.Item>
  <Form.Item label="Select Columns">
    <div>
      {originalColumns.map((col) => (
        <Checkbox
          key={col.dataIndex}
          checked={selectedColumns.includes(col.dataIndex)}
          onChange={(e) =>
            handleCheckboxChange(col.dataIndex, e.target.checked)
          }
        >
          {col.title}
        </Checkbox>
      ))}
    </div>
  </Form.Item>
  <Form.Item label="Add New Column">
    <Input
      placeholder="New column name"
      value={newColumnName}
      onChange={(e) => setNewColumnName(e.target.value)}
      suffix={<PlusOutlined onClick={addNewColumn} />}
    />
  </Form.Item>
</Modal>

      </div>
    </DndProvider>
  );
};

export default Grid;
