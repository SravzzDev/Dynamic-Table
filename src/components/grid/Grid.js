import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Table, Button, Dropdown, Menu, Checkbox, message, Modal } from "antd";
import { MenuOutlined, DownOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FetchProducts } from "../../api/Api";
import axios from "axios";
import "./Grid.css";
import { TouchBackend } from 'react-dnd-touch-backend';
const Grid = () => {
  // State hooks
  const [products, setProducts] = useState([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [editingColumn, setEditingColumn] = useState("");
  const [columnsOrder, setColumnsOrder] = useState([]);
  const [tempColumnsOrder, setTempColumnsOrder] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    category: true,
    price: true,
    stock: true,
  });
  const [searchText, setSearchText] = useState("");

  // Check if a cell is being edited
  const isEditing = (record, column) => record.id === editingKey && column === editingColumn;

  // Define initial columns
  const originalColumns = [
    {
      title: "Name",
      dataIndex: "name",
      editable: true,
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortDirections: ["ascend", "descend", null],
    },
    {
      title: "Category",
      dataIndex: "category",
      editable: true,
      width: 200,
      filters: [...new Set(products.map((item) => item.category))].map(
        (category) => ({
          text: category,
          value: category,
        })
      ),
      onFilter: (value, record) => record.category.includes(value),
      sortDirections: ["ascend", "descend", null],
    },
    {
      title: "Price",
      dataIndex: "price",
      editable: true,
      width: 200,
      sorter: (a, b) => a.price - b.price,
      sortDirections: ["ascend", "descend", null],
    },
    {
      title: "Stock",
      dataIndex: "stock",
      editable: true,
      width: 200,
      sortDirections: ["ascend", "descend", null],
    },
  ];

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
    setColumnsOrder(originalColumns);
  }, []);

  const mergedColumns = columnsOrder.length > 0 ? columnsOrder : originalColumns;
  const visibleMergedColumns = mergedColumns.filter(
    (col) => visibleColumns[col.dataIndex]
  );

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
        const response = await axios.put(`http://localhost:5000/products/${item.id}`, updatedItem);
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

  const showModal = () => {
    setTempColumnsOrder(mergedColumns);
    setIsModalVisible(true);
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

  const handleOk = () => {
    setColumnsOrder(tempColumnsOrder);
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
    message.info(`${column} visibility toggled`);
  };

  const menu = (
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid-container">
        <Button onClick={showModal}>Reorder Columns</Button>
        <Input.Search
          placeholder="Search all fields"
          value={searchText}
          onChange={handleSearch}
          style={{ marginBottom: 16, width: 300, marginRight: "30px",marginLeft:"30px" }}
        />
        <Dropdown ovrlay={menu} trigger={['click']}>
          <Button>
            Column Visibility <DownOutlined />
          </Button>
        </Dropdown>
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell } }}
            bordered
            columns={visibleMergedColumns.map((col, index) => ({
              ...col,
              onCell: (record) => ({
                record,
                inputType: col.dataIndex === "price" || col.dataIndex === "stock" ? "number" : "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record, col.dataIndex),
              }),
            }))}
            dataSource={filteredData}
            pagination={{ defaultPageSize: 5, showSizeChanger: true, pageSizeOptions: ["5", "10", "15", "20"] }}
            rowKey={"id"}
          />
        </Form>
        <Modal
          title="Reorder Columns"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          width={600}
        >
          <ul>
            {tempColumnsOrder.map((column, index) => (
              <ColumnItem key={column.dataIndex} column={column} index={index} />
            ))}
          </ul>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default Grid;
