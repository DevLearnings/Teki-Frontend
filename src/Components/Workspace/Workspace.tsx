import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Layout,
  Typography,
  Button,
  List,
  Card,
  message,
  Tooltip,
  Form,
  Input,
  Modal,
  Select,
  Tabs,
  Spin,
  Pagination,
  Upload,
  Tag,
  Row,
  Col,
  Statistic,
  Skeleton,
  ConfigProvider,
  DatePicker,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ShareAltOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { TekiContext } from "../../App";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Chart from "react-apexcharts";
import io from "socket.io-client";
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ErrorBoundary from './ErrorBoundary';
import { v4 as uuidv4 } from 'uuid';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface Item {
  _id: string;
  name: string;
  description?: string;
  [key: string]: any;
}

interface Startup extends Item {
  profile: string;
  foundingDate: string;
  teamSize: number;
  fundingGoal: number;
}

interface Supply extends Item {
  quantity: number;
  status: "requested" | "received";
  type: "digital" | "physical" | "influencer";
  associatedStartup?: string;
  requestDate: string;
  estimatedDeliveryDate?: string;
}

interface Task extends Item {
  status: "todo" | "inProgress" | "completed";
  type: "stickyNote" | "kanban";
  priority: "low" | "medium" | "high";
  dueDate: string;
  assignee?: string;
  completionDetails?: {
    description: string;
    images: string[];
    completionDate: string;
  };
}

interface PaginatedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const WorkspaceComponent: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { BASE } = useContext(TekiContext);
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<string>("dashboard");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRequestSupplyModalVisible, setIsRequestSupplyModalVisible] = useState(false);
  const [isCompleteTaskModalVisible, setIsCompleteTaskModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form] = Form.useForm();
  const [socket, setSocket] = useState<any>(null);
  const [selectedStartup, setSelectedStartup] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [stickyNotes, setStickyNotes] = useState<Task[]>([]);

  const queryClient = useQueryClient();

  const socketURL = `${BASE}`;

  useEffect(() => {
    const newSocket = io(socketURL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, [socketURL]);

  useEffect(() => {
    if (socket) {
      socket.on("itemUpdated", (data: { type: string }) => {
        if (data.type === activeType) {
          queryClient.invalidateQueries(['items', activeType]);
        }
      });
    }
  }, [socket, activeType, queryClient]);

  const fetchItems = async () => {
    const response = await axios.get<PaginatedResponse<Startup | Supply | Task>>(
      `${BASE}/workspaces/${workspaceId}/${selectedStartup ? `${selectedStartup}/` : ''}${activeType}`,
      {
        params: { page: currentPage, limit: 10 },
      }
    );
    return response.data;
  };

  const { data, isLoading, error } = useQuery(
    ['items', activeType, currentPage, workspaceId, selectedStartup],
    fetchItems,
    {
      keepPreviousData: true,
    }
  );

  const fetchStartups = async () => {
    const response = await axios.get<PaginatedResponse<Startup>>(
      `${BASE}/workspaces/${workspaceId}/startups`
    );
    return response.data;
  };

  const { data: startups } = useQuery(['startups', workspaceId], fetchStartups);

  const fetchCompletedTasks = async () => {
    const response = await axios.get<PaginatedResponse<Task>>(
      `${BASE}/workspaces/${workspaceId}/${selectedStartup}/tasks/completed`
    );
    setCompletedTasks(response.data.items);
  };

  useEffect(() => {
    if (selectedStartup) {
      fetchCompletedTasks();
    }
  }, [selectedStartup]);

  const addMutation = useMutation(
    (newItem: any) => axios.post(`${BASE}/workspaces/${workspaceId}/${selectedStartup ? `${selectedStartup}/` : ''}${activeType}`, newItem),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['items', activeType]);
        message.success(`${activeType} created successfully`);
        setIsAddModalVisible(false);
        form.resetFields();
        socket.emit("itemUpdated", { type: activeType });
      },
      onError: () => {
        message.error(`Failed to create ${activeType}`);
      },
    }
  );

  const editMutation = useMutation(
    (updatedItem: any) => axios.put(`${BASE}/workspaces/${workspaceId}/${selectedStartup ? `${selectedStartup}/` : ''}${activeType}/${updatedItem._id}`, updatedItem),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['items', activeType]);
        message.success(`${activeType} updated successfully`);
        setIsEditModalVisible(false);
        form.resetFields();
        socket.emit("itemUpdated", { type: activeType });
      },
      onError: () => {
        message.error(`Failed to update ${activeType}`);
      },
    }
  );

  const deleteMutation = useMutation(
    (itemId: string) => axios.delete(`${BASE}/workspaces/${workspaceId}/${selectedStartup ? `${selectedStartup}/` : ''}${activeType}/${itemId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['items', activeType]);
        message.success(`${activeType} deleted successfully`);
        socket.emit("itemUpdated", { type: activeType });
      },
      onError: () => {
        message.error(`Failed to delete ${activeType}`);
      },
    }
  );

  const handleAddItem = (values: any) => {
    addMutation.mutate(values);
  };

  const handleEditItem = (values: any) => {
    if (!selectedItem) return;
    editMutation.mutate({ ...selectedItem, ...values });
  };

  const handleDeleteItem = (itemId: string) => {
    deleteMutation.mutate(itemId);
  };

  const handleRequestSupply = async (values: any) => {
    try {
      const response = await axios.post(`${BASE}/workspaces/${workspaceId}/${selectedStartup}/supply/request`, values);
      queryClient.invalidateQueries(['items', 'supply']);
      message.success("Supply requested successfully");
      setIsRequestSupplyModalVisible(false);
      form.resetFields();
      socket.emit("itemUpdated", { type: "supply" });
    } catch (error) {
      message.error("Failed to request supply");
    }
  };

  const handleCompleteTask = async (taskId: string, completionDetails: any) => {
    try {
      await axios.put(`${BASE}/workspaces/${workspaceId}/${selectedStartup}/tasks/${taskId}`, {
        status: "completed",
        completionDetails,
      });
      queryClient.invalidateQueries(['items', 'task']);
      message.success("Task marked as completed");
      setIsCompleteTaskModalVisible(false);
      form.resetFields();
      socket.emit("itemUpdated", { type: "task" });
    } catch (error) {
      message.error("Failed to complete task");
    }
  };

  const handleShareCompletedTasks = async () => {
    try {
      const response = await axios.get(`${BASE}/workspaces/${workspaceId}/${selectedStartup}/tasks/completed/share`);
      message.success(`${response.data.items.length} completed tasks shared with investors`);
    } catch (error) {
      message.error("Failed to share completed tasks");
    }
  };

  const handleReceiveSupply = async (supplyId: string) => {
    try {
      await axios.put(`${BASE}/workspaces/${workspaceId}/${selectedStartup}/supply/${supplyId}/receive`);
      queryClient.invalidateQueries(['items', 'supply']);
      message.success("Supply marked as received");
      socket.emit("itemUpdated", { type: "supply" });
    } catch (error) {
      message.error("Failed to mark supply as received");
    }
  };

  const handleShareCompletedTask = async (taskId: string) => {
    try {
      await axios.post(`${BASE}/workspaces/${workspaceId}/${selectedStartup}/tasks/${taskId}/share`);
      message.success("Task shared successfully");
    } catch (error) {
      message.error("Failed to share task");
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) {
      // Reorder within the same column
      const newTasks = Array.from(data?.items || []);
      const [reorderedItem] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, reorderedItem);

      // Optimistic update
      queryClient.setQueryData(['items', 'task'], (old: any) => ({
        ...old,
        items: newTasks,
      }));
    } else {
      // Move to a different column
      try {
        const response = await axios.put(`${BASE}/workspaces/${workspaceId}/${selectedStartup}/tasks/${draggableId}`, {
          status: destination.droppableId,
        });
        queryClient.invalidateQueries(['items', 'task']);
        message.success("Task status updated");
        socket.emit("itemUpdated", { type: "task" });
      } catch (error) {
        message.error("Failed to update task status");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "blue";
      case "inProgress":
        return "orange";
      case "completed":
        return "green";
      default:
        return "default";
    }
  };

  const renderStartups = () => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
      dataSource={data?.items as Startup[]}
      renderItem={(startup: Startup) => (
        <List.Item>
          <Card
            hoverable
            cover={
              <img
                alt={startup.name}
                src={`https://source.unsplash.com/400x200/?${startup.profile}`}
              />
            }
            actions={[
              <Tooltip title="Edit">
                <EditOutlined
                  key="edit"
                  onClick={() => {
                    setSelectedItem(startup);
                    form.setFieldsValue(startup);
                    setIsEditModalVisible(true);
                  }}
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <DeleteOutlined
                  key="delete"
                  onClick={() => handleDeleteItem(startup._id)}
                />
              </Tooltip>,
            ]}
            onClick={() => setSelectedStartup(startup._id)}
          >
            <Card.Meta
              title={startup.name}
              description={
                <>
                  <p>{startup.description}</p>
                  <p><TeamOutlined /> Team Size: {startup.teamSize}</p>
                  <p><CalendarOutlined /> Founded: {startup.foundingDate}</p>
                  <p><DollarOutlined /> Funding Goal: ${startup.fundingGoal.toLocaleString()}</p>
                </>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );

  const renderSupplies = () => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
      dataSource={data?.items as Supply[]}
      renderItem={(supply: Supply) => (
        <List.Item>
          <Card
            hoverable
            actions={[
              <Tooltip title="Edit">
                <EditOutlined
                  key="edit"
                  onClick={() => {
                    setSelectedItem(supply);
                    form.setFieldsValue(supply);
                    setIsEditModalVisible(true);
                  }}
                />
              </Tooltip>,
              <Tooltip title="Delete">
                <DeleteOutlined
                  key="delete"
                  onClick={() => handleDeleteItem(supply._id)}
                />
              </Tooltip>,
              supply.status === "requested" && (
                <Tooltip title="Mark as Received">
                  <CheckCircleOutlined
                    key="receive"
                    onClick={() => handleReceiveSupply(supply._id)}
                  />
                </Tooltip>
              ),
            ]}
          >
            <Card.Meta 
              title={supply.name} 
              description={
                <>
                  <p>{supply.description}</p>
                  <p>Quantity: {supply.quantity}</p>
                  <p>Request Date: {supply.requestDate}</p>
                  {supply.estimatedDeliveryDate && <p>Estimated Delivery: {supply.estimatedDeliveryDate}</p>}
                </>
              } 
            />
            <Tag color={supply.status === "requested" ? "blue" : "green"}>
              {supply.status}
            </Tag>
            <Tag color="purple">{supply.type}</Tag>
          </Card>
        </List.Item>
      )}
    />
  );

  const renderTasks = () => (
    <>
      <Tabs defaultActiveKey="kanban">
        <TabPane tab="Kanban Board" key="kanban">
        <DragDropContext onDragEnd={onDragEnd}>
            <Row gutter={16}>
              {["todo", "inProgress", "completed"].map((status) => (
                <Col span={8} key={status}>
                  <Title level={4}>{status.charAt(0).toUpperCase() + status.slice(1)}</Title>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {(data?.items as Task[])
                          .filter((task) => task.status === status && task.type === "kanban")
                          .map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ marginBottom: 16 }}
                                >
                                  <Card.Meta
                                    title={task.name}
                                    description={
                                      <>
                                        <p>{task.description}</p>
                                        <p>Due Date: {task.dueDate}</p>
                                        <p>Assignee: {task.assignee || 'Unassigned'}</p>
                                      </>
                                    }
                                  />
                                  <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                                  <Tag color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}>
                                    {task.priority}
                                  </Tag>
                                  {task.status !== "completed" && (
                                    <Button
                                      type="link"
                                      onClick={() => {
                                        setSelectedItem(task);
                                        setIsCompleteTaskModalVisible(true);
                                      }}
                                    >
                                      Mark as Completed
                                    </Button>
                                  )}
                                </Card>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              ))}
            </Row>
          </DragDropContext>
        </TabPane>
        <TabPane tab="Sticky Notes" key="stickyNotes">
          <Row gutter={[16, 16]}>
            {stickyNotes.map((note) => (
              <Col span={6} key={note._id}>
                <Card
                  style={{ backgroundColor: '#feff9c', minHeight: 150 }}
                  actions={[
                    <EditOutlined key="edit" onClick={() => {
                      setSelectedItem(note);
                      form.setFieldsValue(note);
                      setIsEditModalVisible(true);
                    }} />,
                    <DeleteOutlined key="delete" onClick={() => handleDeleteItem(note._id)} />,
                  ]}
                >
                  <Card.Meta
                    title={note.name}
                    description={note.description}
                  />
                </Card>
              </Col>
            ))}
            <Col span={6}>
              <Card
                style={{ backgroundColor: '#e8e8e8', minHeight: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => {
                  form.resetFields();
                  setIsAddModalVisible(true);
                }}
              >
                <PlusOutlined style={{ fontSize: 24 }} />
                <div>Add New Note</div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </>
  );

  const renderCompletedTasks = () => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
      dataSource={completedTasks}
      renderItem={(task: Task) => (
        <List.Item>
          <Card
            hoverable
            cover={task.completionDetails?.images[0] && (
              <img alt="task completion" src={task.completionDetails.images[0]} />
            )}
            actions={[
              <Tooltip title="Share">
                <ShareAltOutlined
                  key="share"
                  onClick={() => handleShareCompletedTask(task._id)}
                />
              </Tooltip>,
            ]}
          >
            <Card.Meta
              title={task.name}
              description={
                <>
                  <p>{task.completionDetails?.description}</p>
                  <p>Completed on: {task.completionDetails?.completionDate}</p>
                </>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );

  const renderDashboard = () => (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Startups"
              value={data?.items.filter((item: any) => item.type === 'startup').length}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Supplies"
              value={data?.items.filter((item: any) => item.type === 'supply').length}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={data?.items.filter((item: any) => item.type === 'task').length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title="Task Progress">
            <Chart
              options={{
                chart: {
                  type: "bar",
                },
                xaxis: {
                  categories: ['Todo', 'In Progress', 'Completed'],
                },
              }}
              series={[
                {
                  name: "Tasks",
                  data: [
                    data?.items.filter((item: Task) => item.status === 'todo').length,
                    data?.items.filter((item: Task) => item.status === 'inProgress').length,
                    data?.items.filter((item: Task) => item.status === 'completed').length,
                  ],
                },
              ]}
              type="bar"
              width="100%"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderContent = useMemo(() => {
    if (isLoading) return <Skeleton active />;
    if (error) return <div>Error: {(error as Error).message}</div>;

    switch (activeType) {
      case 'startup':
        return renderStartups();
      case 'supply':
        return renderSupplies();
      case 'task':
        return renderTasks();
      case 'completedTasks':
        return renderCompletedTasks();
      default:
        return renderDashboard();
    }
  }, [activeType, data, isLoading, error, completedTasks, stickyNotes]);

  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <Content style={{ padding: "24px", margin: "80px" }}>
          <Title level={2}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Workspace</span>
              <Button onClick={() => navigate('/')}>View Dashboard</Button>
            </div>
          </Title>

          <Select
            style={{ width: 200, marginBottom: 16 }}
            placeholder="Select a startup"
            onChange={(value) => setSelectedStartup(value)}
            value={selectedStartup}
          >
            {startups?.items.map((startup) => (
              <Option key={startup._id} value={startup._id}>{startup.name}</Option>
            ))}
          </Select>

          <Tabs activeKey={activeType} onChange={(key) => setActiveType(key as string)}>
            <TabPane tab="Dashboard" key="dashboard" />
            <TabPane tab="Startups" key="startup" />
            <TabPane tab="Supplies" key="supply" />
            <TabPane tab="Tasks" key="task" />
            <TabPane tab="Completed Tasks" key="completedTasks" />
          </Tabs>

          {renderContent}

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
            style={{ marginTop: 16 }}
          >
            Add {activeType}
          </Button>

          {activeType === "supply" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsRequestSupplyModalVisible(true)}
              style={{ marginTop: 16, marginLeft: 16 }}
            >
              Request Supply
            </Button>
          )}

          {activeType === "completedTasks" && (
            <Button
              type="primary"
              onClick={handleShareCompletedTasks}
              style={{ marginTop: 16, marginLeft: 16 }}
            >
              Share All Completed Tasks
            </Button>
          )}

          <Modal
            title={`Add ${activeType}`}
            visible={isAddModalVisible}
            onCancel={() => setIsAddModalVisible(false)}
            footer={null}
          >
            <Form form={form} onFinish={handleAddItem} layout="vertical">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter the name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <TextArea rows={4} />
              </Form.Item>
              {activeType === "startup" && (
                <>
                  <Form.Item
                    name="profile"
                    label="Profile"
                    rules={[{ required: true, message: "Please enter the profile" }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="foundingDate"
                    label="Founding Date"
                    rules={[{ required: true, message: "Please select the founding date" }]}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    name="teamSize"
                    label="Team Size"
                    rules={[{ required: true, message: "Please enter the team size" }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item
                    name="fundingGoal"
                    label="Funding Goal"
                    rules={[{ required: true, message: "Please enter the funding goal" }]}
                  >
                    <Input type="number" prefix="$" />
                  </Form.Item>
                </>
              )}
              {activeType === "supply" && (
                <>
                  <Form.Item
                    name="quantity"
                    label="Quantity"
                    rules={[{ required: true, message: "Please enter the quantity" }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Please select the type" }]}
                  >
                    <Select>
                      <Option value="digital">Digital</Option>
                      <Option value="physical">Physical</Option>
                      <Option value="influencer">Influencer</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="requestDate"
                    label="Request Date"
                    rules={[{ required: true, message: "Please select the request date" }]}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item
                    name="estimatedDeliveryDate"
                    label="Estimated Delivery Date"
                  >
                    <DatePicker />
                  </Form.Item>
                </>
              )}
              {activeType === "task" && (
                <>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: "Please select the status" }]}
                  >
                    <Select>
                      <Option value="todo">To Do</Option>
                      <Option value="inProgress">In Progress</Option>
                      <Option value="completed">Completed</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="type"
                    label="Type"
                    rules={[{ required: true, message: "Please select the type" }]}
                  >
                    <Select>
                      <Option value="kanban">Kanban</Option>
                      <Option value="stickyNote">Sticky Note</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="priority"
                    label="Priority"
                    rules={[{ required: true, message: "Please select the priority" }]}
                  >
                    <Select>
                      <Option value="low">Low</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="high">High</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="dueDate"
                    label="Due Date"
                    rules={[{ required: true, message: "Please select the due date" }]}
                  >
                    <DatePicker />
                  </Form.Item>
                  <Form.Item name="assignee" label="Assignee">
                    <Input />
                  </Form.Item>
                </>
              )}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add {activeType}
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title={`Edit ${activeType}`}
            visible={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={null}
          >
            <Form form={form} onFinish={handleEditItem} layout="vertical">
              {/* Add form fields similar to the Add Modal, but populate with existing data */}
            </Form>
          </Modal>

          <Modal
            title="Request Supply"
            visible={isRequestSupplyModalVisible}
            onCancel={() => setIsRequestSupplyModalVisible(false)}
            footer={null}
          >
            <Form form={form} onFinish={handleRequestSupply} layout="vertical">
              <Form.Item
                name="name"
                label="Supply Name"
                rules={[{ required: true, message: "Please enter the supply name" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <TextArea rows={4} />
              </Form.Item>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter the quantity" }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: "Please select the type" }]}
                >
                  <Select>
                    <Option value="digital">Digital</Option>
                    <Option value="physical">Physical</Option>
                    <Option value="influencer">Influencer</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="requestDate"
                  label="Request Date"
                  rules={[{ required: true, message: "Please select the request date" }]}
                >
                  <DatePicker />
                </Form.Item>
                <Form.Item
                  name="estimatedDeliveryDate"
                  label="Estimated Delivery Date"
                >
                  <DatePicker />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Request Supply
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
  
            <Modal
              title="Complete Task"
              visible={isCompleteTaskModalVisible}
              onCancel={() => setIsCompleteTaskModalVisible(false)}
              footer={null}
            >
              <Form
                form={form}
                onFinish={(values) => handleCompleteTask(selectedItem?._id || "", values)}
                layout="vertical"
              >
                <Form.Item
                  name="description"
                  label="Completion Details"
                  rules={[{ required: true, message: "Please enter completion details" }]}
                >
                  <TextArea rows={4} />
                </Form.Item>
                <Form.Item name="images" label="Upload Images">
                  <Upload
                    listType="picture-card"
                    fileList={form.getFieldValue('images') || []}
                    onChange={({ fileList }) => form.setFieldsValue({ images: fileList })}
                    beforeUpload={() => false}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  </Upload>
                </Form.Item>
                <Form.Item
                  name="completionDate"
                  label="Completion Date"
                  rules={[{ required: true, message: "Please select the completion date" }]}
                >
                  <DatePicker />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Mark as Completed
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
  
            <Pagination
              current={currentPage}
              total={data?.totalItems || 0}
              pageSize={10}
              onChange={(page) => setCurrentPage(page)}
              style={{ marginTop: 16, textAlign: "right" }}
            />
          </Content>
        </ConfigProvider>
      </ErrorBoundary>
    );
  };
  
  export default React.memo(WorkspaceComponent);