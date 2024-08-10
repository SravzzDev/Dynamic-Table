import React from 'react';
import { Input, Form, InputNumber } from 'antd';

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    edit,
    save,
    children,
    ...restProps
  }) => {
    //  the type of input component based on `inputType`
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    
  
    console.log('edit:', edit);
    console.log('save:', save);

    return (
      <td {...restProps}>
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
           
            {inputNode}
          </Form.Item>
        ) : (
         
          children
        )}
      </td>
    );
  };

export default EditableCell;
