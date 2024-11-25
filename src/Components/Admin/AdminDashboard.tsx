import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Layout, Menu, Breadcrumb, Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { TekiContext } from '../../App';
import { FixedSizeList as List } from 'react-window';

const { Header, Content, Footer, Sider } = Layout;

interface Investor {
  _id: string;
  name: string;
  email: string;
}

interface AdminDashboardProps {}

const stripePromise = loadStripe("sk_test_4eC39HqLyjWDarjtT1zdp7dc");

// Custom hook for data fetching
const useDataFetching = (url: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);
        setData(response.data.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { loading: contextLoading, setLoading, BASE }: any = useContext(TekiContext);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<string>('investors');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Investor | null>(null);
  const [form] = Form.useForm();

  const { data, loading, error } = useDataFetching(`${BASE}/admins/${selectedSection}`);

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const handleMenuClick = useCallback(({ key }: { key: React.Key }) => {
    setSelectedSection(key.toString());
  }, []);

  const handleOpenModal = useCallback(() => {
    setEditingItem(null);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    form.resetFields();
  }, [form]);

  const handleFormSubmit = useCallback(async (values: Investor) => {
    try {
      if (editingItem) {
        await axios.put(`${BASE}/admins/${selectedSection}/${editingItem._id}`, values);
        message.success('Item updated successfully!');
      } else {
        await axios.post(`${BASE}/admins/${selectedSection}`, values);
        message.success('Item added successfully!');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to submit form.');
    }
  }, [editingItem, selectedSection, BASE, handleCloseModal]);

  const handleEdit = useCallback((record: Investor) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  }, [form]);

  const handleDelete = useCallback(async (record: Investor) => {
    try {
      await axios.delete(`${BASE}/admins/${selectedSection}/${record._id}`);
      message.success('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      message.error('Failed to delete item.');
    }
  }, [selectedSection, BASE]);

  const columns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: Investor) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ], [handleEdit, handleDelete]);

  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      {data[index].name} - {data[index].email}
    </div>
  ), [data]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={handleToggleCollapse}>
          <div className="logo" />
          <Menu theme="dark" defaultSelectedKeys={['investors']} mode="inline" onClick={handleMenuClick}>
            <Menu.Item key="investors">Investors</Menu.Item>
            <Menu.Item key="pitchers">Pitchers</Menu.Item>
            <Menu.Item key="social">Social</Menu.Item>
            <Menu.Item key="support">Support</Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }} />
          <Content style={{ margin: '0 16px' }}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>{selectedSection.toUpperCase()}</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
              <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: '1rem' }}>
                Add {selectedSection === 'support' ? 'Inquiry' : selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
              </Button>
              {contextLoading ? (
                <div>Loading...</div>
              ) : (
                <React.Suspense fallback={<div>Loading...</div>}>
                  {['investors', 'pitchers'].includes(selectedSection) ? (
                    <Table columns={columns} dataSource={data} rowKey="_id" />
                  ) : (
                    <List
                      height={400}
                      itemCount={data.length}
                      itemSize={35}
                      width={300}
                    >
                      {Row}
                    </List>
                  )}
                </React.Suspense>
              )}
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Admin Dashboard</Footer>
        </Layout>
        <Modal
          title={`${editingItem ? 'Edit' : 'Add'} ${selectedSection === 'support' ? 'Inquiry' : selectedSection}`}
          visible={modalVisible}
          onOk={form.submit}
          onCancel={handleCloseModal}
          okText="Submit"
          cancelText="Cancel"
        >
          <Form form={form} onFinish={handleFormSubmit}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Elements>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Wrap the AdminDashboard component with ErrorBoundary
const AdminDashboardWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <AdminDashboard />
  </ErrorBoundary>
);

export default AdminDashboardWithErrorBoundary;
