import React from 'react';
import { Input, Form, InputNumber } from 'antd';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  children,
  ...restProps
}) => {
  if (!record) {
    return <td {...restProps}>{children}</td>; // Handle the case where record is undefined
  }
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


export default EditableCell;
