import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Provider } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { store } from '@/store';
import Layout from '@/components/Layout';
import Login from '@/pages/Auth/Login';
import Dashboard from '@/pages/Dashboard';
import UserList from '@/pages/Users/UserList';
import OrderList from '@/pages/Orders/OrderList';
import PackageList from '@/pages/Packages/PackageList';
import PaymentList from '@/pages/Payments/PaymentList';
import TimeSlotList from '@/pages/TimeSlots/TimeSlotList';
import GlobalSearch from '@/pages/Search/GlobalSearch';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/styles/global.css';

dayjs.locale('zh-cn');

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/users" element={<UserList />} />
                      <Route path="/orders" element={<OrderList />} />
                      <Route path="/packages" element={<PackageList />} />
                      <Route path="/payments" element={<PaymentList />} />
                      <Route path="/time-slots" element={<TimeSlotList />} />
                      <Route path="/search" element={<GlobalSearch />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ConfigProvider>
    </Provider>
  );
};

export default App;



