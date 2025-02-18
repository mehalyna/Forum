import { ToastContainer } from 'react-toastify';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import ukUA from 'antd/es/locale/uk_UA';

import { useAuth } from '../hooks';

import AdminLayout from '../pages/AdminPage/AdminLayout.jsx';
import Header from '../components/Header/Header';
import UserTable from '../pages/AdminPage/UserProfilesTable/UserTable';
import ProfilesTable from '../pages/AdminPage/UserProfilesTable/ProfilesTable';
import ProfileDetail from '../pages/AdminPage/DetailView/ProfileDetail';
import MainPage from '../pages/AdminPage/MainPage/MainPage';
import Loader from '../components/Loader/Loader';
import AutoApproveDelay from '../pages/AdminPage/AutoApproveDelay/AutoApproveDelay';
import ModerationEmail from '../pages/AdminPage/DetailView/ModerationEmail';
import Contacts from '../pages/AdminPage/DetailView/Contacts';
import AdminProfilePage from '../pages/AdminPage/AdminProfile/AdminProfilePage';
import AdminRegistration from '../pages/AdminPage/AdminRegistration/AdminRegistration';
import FormatCategories from '../pages/AdminPage/FormatCategories/CategoriesTable';
import ProfilesStatistics from '../pages/AdminPage/UserProfilesTable/ProfilesStatistics';
import FeedbackCategories from '../pages/AdminPage/FeedbackCategories/FeedbackCategoriesTable';
import customAdminTheme from '../pages/CustomThemes/customAdminTheme.js';
import '../pages/AdminPage/AdminGlobal.css';
import { BurgerMenuProvider } from '../context/BurgerMenuContext';

function AdminRouter() {
    const { isLoading, isAuth, isStaff, isSuperUser, user } = useAuth();

    const authRoutes = isStaff && isAuth ? (
        <>
            <Route path="/" element={<MainPage />} />
            <Route path="/users" element={<UserTable />} />
            <Route path="/profiles" element={<ProfilesTable />} />
            <Route path="/profile/:id" element={<ProfileDetail />} />
            <Route path="/automoderation" element={<AutoApproveDelay />} />
            {isSuperUser && (
                <>
                    <Route path="/email" element={<ModerationEmail />} />
                    <Route path="/admin-create" element={<AdminRegistration />} />
                </>
            )}
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/admin-profile/*" element={<AdminProfilePage />} />
            <Route path="/categories/" element={<FormatCategories />} />
            <Route path="/feedback-categories/" element={<FeedbackCategories />} />
            <Route path="/statistics" element={<ProfilesStatistics />} />
        </>
    ) : (
        <Route path="/customadmin/" element={<MainPage />}/>
    );

    return (
        <ConfigProvider
            theme={customAdminTheme}
            locale={{
                ...ukUA,
                Table: {
                    filterReset: 'Скинути',
                    filterConfirm: 'Застосувати',
                },
            }}
        >
            <BurgerMenuProvider>
                <Header isAuthorized={isAuth} user={user} />
                <AdminLayout>
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <Routes>
                            {authRoutes}
                        </Routes>
                    )}
                </AdminLayout>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    theme="colored"
                    icon={false}
                />
            </BurgerMenuProvider>
        </ConfigProvider>
    );
}

export default AdminRouter;
