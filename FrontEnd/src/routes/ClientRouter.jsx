import { ToastContainer } from 'react-toastify';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { SWRConfig } from 'swr';

import 'react-toastify/dist/ReactToastify.css';
import customTheme from '../pages/CustomThemes/customTheme.js';

import LoginPage from '../pages/Authorization/LoginPage';
import AboutUsPage from '../pages/AboutUsPage/AboutUsPage.jsx';
import Footer from '../components/Footer/Footer';
import Header from '../components/Header/Header';
import Loader from '../components/Loader/Loader';
import MainPage from '../pages/LandingPage/MainPage';
import PrivacyPolicy from '../pages/PrivacyPolicyPage/PrivacyPolicyPage';
import ProfileDetailPage from '../pages/ProfileDetail/ProfileDetailPage';
import ProfileListPage from '../pages/ProfileList/ProfileListPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import { SignUpPage } from '../pages/SignUp/SignUp/SignUpPage';
import { SignUpCompletionPage } from '../pages/SignUp/SignUp/SignUpCompletionPage';
import { ResendActivationPage } from '../pages/SignUp/SignUp/ResendActivationPage';
import { ActivateProfilePage } from '../pages/SignUp/SignUp/ActivateProfilePage';
import { SendEmailForgotPasswordPage } from '../pages/RestorePassword/Pages/SendEmailForgotPasswordPage';
import { RestorePasswordPage } from '../pages/RestorePassword/Pages/RestorePasswordPage';
import { ForgotPasswordCompletionPage } from '../pages/RestorePassword/Pages/ForgotPasswordCompletionPage';
import { RestorePasswordSuccessPage } from '../pages/RestorePassword/Pages/RestorePasswordSuccessPage';
import { RestorePasswordFailedPage } from '../pages/RestorePassword/Pages/RestorePasswordFailedPage';
import { ModerationModal } from '../components/Moderation/ModerationModal';
import TermsAndConditions from '../components/TermsAndConditionsApp/terms_conditions/TermsAndConditionsComponent';
import { useAuth } from '../hooks';
import { Search } from '../pages/SearchPage/Search';
import '../pages/CustomThemes/customToastStyles.css';
import Contact from '../pages/Contact/Contact.jsx';
import ErrorPage404 from '../pages/ErrorPages/ErrorPage404';

import { BurgerMenuProvider } from '../context/BurgerMenuContext';
import { CookieProvider } from '../context/CookieContext';
import PageWrapper from '../components/PageWrapper/PageWrapper';

function ClientRouter() {
  const { isAuth, user, logout, isLoading } = useAuth();

  return (
    <ConfigProvider theme={customTheme}>
      <SWRConfig
        value={{
          onError: (error) => {
            console.error(error);
            if (error.status === 401) {
              logout();
            }
          },
        }}
      >
        <CookieProvider>
          <BurgerMenuProvider>
            <Header isAuthorized={isAuth} />
            <PageWrapper>
              {isLoading ? (
                <Loader />
              ) : (
                <Routes>
                  <Route path="/" element={<MainPage isAuthorized={isAuth} />} />
                  <Route path="/about-us" element={<AboutUsPage />} />
                  {isAuth ? (
                    <Route path="/profile/*" element={<ProfilePage />} />
                  ) : (
                    <Route path="/profile/*" element={<Navigate to="/" />} />
                  )}
                  <Route
                    path="/profile-detail/:id"
                    element={<ProfileDetailPage isAuthorized={isAuth} />}
                  />
                  <Route
                    path="/profiles"
                    element={
                      <ProfileListPage isAuthorized={isAuth} isSaved={false} />
                    }
                  />
                  <Route
                    path="/profiles/saved"
                    element={
                      <ProfileListPage isAuthorized={isAuth} isSaved={true} />
                    }
                  />
                  {isAuth ? (
                    <Route
                      path="/login"
                      element={<Navigate to="/profile/user-info" />}
                    />
                  ) : (
                    <Route path="/login" element={<LoginPage />} />
                  )}
                  {isAuth ? (
                    <Route
                      path="/sign-up"
                      element={<Navigate to="/profile/user-info" />}
                    />
                  ) : (
                    <Route path="/sign-up" element={<SignUpPage />} />
                  )}
                  <Route
                    path="/sign-up/completion"
                    element={<SignUpCompletionPage />}
                  />
                  <Route
                    path="/sign-up/resend-activation"
                    element={<ResendActivationPage />}
                  />
                  <Route
                    path="/activate/:uid/:token"
                    element={<ActivateProfilePage />}
                  />
                  <Route
                    path="/reset-password"
                    element={<SendEmailForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password/completion"
                    element={<ForgotPasswordCompletionPage />}
                  />
                  <Route
                    path="/password/reset/confirm/:uid/:token"
                    element={<RestorePasswordPage />}
                  />
                  <Route
                    path="/reset-password/successfully"
                    element={<RestorePasswordSuccessPage />}
                  />
                  <Route
                    path="/reset-password/failed"
                    element={<RestorePasswordFailedPage />}
                  />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route
                    path="/terms-and-conditions"
                    element={<TermsAndConditions />}
                  />
                  <Route path="/contact" element={<Contact />} />
                  <Route
                    path="/search"
                    element={<Search isAuthorized={isAuth} userData={user} />}
                  />
                  <Route
                    path="/moderation/:id/:action"
                    element={<ModerationModal />}
                  />
                  <Route path="*" element={<ErrorPage404 />} />
                </Routes>
              )}
            </PageWrapper>
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              theme="colored"
              icon={false}
            />
          </BurgerMenuProvider>
        </CookieProvider>
      </SWRConfig>
    </ConfigProvider>
  );
}

export default ClientRouter;
