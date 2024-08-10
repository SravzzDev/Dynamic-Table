import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, Table, Button, Dropdown, Menu, Checkbox, message } from "antd";
import { MenuOutlined, DownOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FetchProducts } from "../../api/Api";
import axios from "axios";
import "./Grid.css";

const Grid = () => {
  // State hooks for managing products data, form instance, editing state, column order, and visibility.
  const [products, setProducts] = useState([]);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [editingColumn, setEditingColumn] = useState("");
  const [columnsOrder, setColumnsOrder] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    category: true,
    price: true,
    stock: true,
  });
  const [searchText, setSearchText] = useState("");

  // Function to determine if a row and column are being edited
  const isEditing = (record, column) => record.id === editingKey && column === editingColumn;

  // Initial column definitions
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

  // Fetch products and set initial column order on component mount
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

  // Merge columns with current order and filter based on visibility
  const mergedColumns = columnsOrder.length > 0 ? columnsOrder : originalColumns;
  const visibleMergedColumns = mergedColumns.filter(
    (col) => visibleColumns[col.dataIndex]
  );

  // Function to handle editing of a record
  const edit = (record, column) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id);
    setEditingColumn(column);
    message.info(`Editing ${column} for ${record.name}`);
  };

  // Function to cancel editing
  const cancel = () => {
    setEditingKey("");
    setEditingColumn("");
    message.info("Edit cancelled");
  };

  // Function to save changes to a record
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

  // EditableCell component for rendering editable cells
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

    // Save changes when Enter key is pressed
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

  // ColumnHeader component for handling drag-and-drop column reordering
  const ColumnHeader = ({ column, index }) => {
    const [, drag] = useDrag({
      type: "COLUMN",
      item: { index },
    });

    const [, drop] = useDrop({
      accept: "COLUMN",
      hover: (item) => {
        if (item.index !== index) {
          const reorderedColumns = Array.from(columnsOrder);
          const [movedColumn] = reorderedColumns.splice(item.index, 1);
          reorderedColumns.splice(index, 0, movedColumn);
          setColumnsOrder(reorderedColumns);
          item.index = index;
          message.info("Column reordered");
        }
      },
    });

    return (
      <th
        ref={(node) => drag(drop(node))}
        style={{
          opacity: 1,
          userSelect: "none",
          padding: 5,
          marginBottom: 8,
          borderRadius: "4px",
          cursor: "move",
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <MenuOutlined style={{ marginRight: 8 }} />
          {column.title}
        </span>
      </th>
    );
  };

  // Function to toggle column visibility
  const handleColumnVisibilityChange = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
    message.info(`${column} visibility toggled`);
  };

  // Menu for toggling column visibility
  const menu = (
    <Menu>
      {originalColumns.map((col) => (
        <Menu.Item key={col.dataIndex}>
          <Checkbox
            checked={visibleColumns[col.dataIndex]}
            onChange={() => handleColumnVisibilityChange(col.dataIndex)}
            onClick={(e) => e.stopPropagation()} // Prevents dropdown from closing
          >
            {col.title}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  // Function to handle search input
  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchText(value);
  };

  // Filter products based on search text
  const filteredData = products.filter((product) =>
    Object.values(product)
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid-container">
        <Input.Search
          placeholder="Search all fields"
          value={searchText}
          onChange={handleSearch}
          style={{ marginBottom: 16, width: 300, marginRight: "30px" }}
        />
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            Column Visibility <DownOutlined />
          </Button>
        </Dropdown>
        <Form form={form} component={false}>
          <Table
            components={{ body: { cell: EditableCell, header: { cell: ColumnHeader } } }}
            bordered
            columns={visibleMergedColumns.map((col, index) => ({
              ...col,
              title: <ColumnHeader column={col} index={index} />,
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
      </div>
    </DndProvider>
  );
};

export default Grid;
