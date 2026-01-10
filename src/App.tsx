import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import TwoFactorPage from "@/pages/auth/TwoFactorPage";
import TwoFactorSetup from "@/pages/auth/TwoFactorSetupPage";
import SocialCallback from "@/pages/auth/SocialCallback";

// Dashboards
import DashboardPage from "@/pages/dashboard/DashboardPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminAnalyticsDashboardPage from "@/pages/admin/AdminAnalyticsDashboardPage";

// Admin Pages
import AdminProfilePage from "@/pages/admin/profile/AdminProfilePage";
import ViewProfilePage from "@/pages/admin/profile/ViewProfilePage";
import AgentList from "@/pages/admin/agents/AgentList";
import AddAgent from "@/pages/admin/agents/AddAgent";
import AgentProfilePage from "@/pages/admin/agents/AgentProfile";
import AgentViewProfilePage from "@/pages/admin/agents/profile/AgentViewProfilePage";
import AgenteditProfilePage from "@/pages/admin/agents/profile/AgentProfilePage";
import CustomerList from "@/pages/admin/customer/CustomerList";
import AddCustomer from "@/pages/admin/customer/AddCustomer";
import CustomerProfilePage from "@/pages/admin/customer/CustomerProfilePage";
import AddProperties from "@/pages/admin/agents/AddProperties";
import AgentProperty from "@/pages/admin/agents/AgentProperty";
import CustomerPropertyList from "@/pages/admin/customer/CustomerPropertyList";
import AgentTransaction from "@/pages/admin/transaction/AgentTransaction";
import CustomerTransaction from "@/pages/admin/customer/CustomerTransaction";
import OrdersPage from "@/pages/admin/orders/OrdersPage";
import InboxPage from "@/pages/admin/inbox/InboxPage";
import ChatPage from "@/pages/admin/chat/ChatPage";
import ReviewsPage from "@/pages/admin/reviews/ReviewsPage";
import SettingsPage from "@/pages/admin/settings/SettingsPage";
import AgentDashboardPage from "./pages/admin/agents/AgentDashboardPage";
import SubscriptionPlanList from "./pages/admin/subscriptions/SubscriptionPlanList";
import AddSubscriptionPlan from "./pages/admin/subscriptions/AddSubscripitonPlan";
import EditSubscriptionPlan from "./pages/admin/subscriptions/EditSubscriptionPlan";
import Credit from "./pages/admin/Creditwallet/credit";
import Wallet from "./pages/admin/Creditwallet/wallet";

// Property Pages
import AddProperty from "@/pages/admin/agents/property/AddProperty";
import EditProperty from "@/pages/admin/agents/property/EditProperty";
import PropertyList from "@/pages/admin/agents/property/PropertyList";
import ViewProperty from "@/pages/admin/agents/property/ViewProperty";
import PropertyListAdmin from "@/pages/admin/property/PropertyList";
import PropertyStatsAdmin from "@/pages/admin/property/PropertyStats";
import SingleProperty from "@/components/sections/home/SingleProperty";

// Leads
import LeadList from "@/pages/admin/agents/lead/LeadList";
import ViewLead from "@/pages/admin/agents/lead/ViewLead";

// Customer Pages
import CustomerLayout from "@/pages/customer/CustomerLayout";
import CustomerProfile from "@/pages/customer/CustomerProfile";
import ProfileEditForm from "@/pages/customer/ProfileEditForm";
import PropertyFilters from "@/pages/customer/PropertyFilters";
import PropertyView from "@/pages/customer/PropertyView";
import ContactPage from "@/pages/customer/ContactPage";
import Creditwallate from "@/pages/customer/Creditwallate/mywallet";
import PackagePlan from "@/pages/customer/Creditwallate/packagepage";
import AIHub from "@/pages/customer/AIHub";

// Routing Utils
import ProtectedRoute from "@/lib/ProtectedRoute";
import PublicRoute from "@/lib/PublicRoute";
import { ApiInterceptor } from "./api/ApiInterceptor";
import ScrollToTop from "@/components/ScrollToTop";
import FloatingAIChatWrapper from "@/components/ai/FloatingAIChatWrapper";
import AgentAppointments from "./pages/admin/agents/appointment/AgentAppointments";
import ShowSubscriptionPlan from "./pages/admin/subscriptions/ShowSubscriptionPlan";
import SubscriptionPlans from "./pages/customer/subscriptions/SubscriptionPlans";
import StripeProvider from "./providers/StripeProvider";
import SubscriptionCheckout from "./pages/customer/subscriptions/SubscriptionCheckout";
import MySubscriptions from "./pages/customer/subscriptions/MySubscriptions";
import RemindersList from "./pages/admin/agents/reminders/RemindersList";
import CreateReminder from "./pages/admin/agents/reminders/CreateReminder";
import EditReminder from "./pages/admin/agents/reminders/EditReminder";
import ShowReminder from "./pages/admin/agents/reminders/ShowReminder";
import CustomerChatPage from "./pages/customer/CustomerChatPage";
import PagesList from './pages/admin/pages/PagesList';
import PageEditor from './pages/admin/pages/PageEditor';
import FAQList from "./pages/admin/cms/faqs/FAQList";
import BlogList from "./pages/admin/cms/blogs/BlogList";
import AgentBlogList from "./pages/admin/agents/cms/Bloglist";
import AgentcommentList from "./pages/admin/agents/cms/Commentslist";
import NewsList from "./pages/admin/cms/news/NewsList";
import BlogCategories from "./pages/admin/cms/blogs/BlogCategories";
import BlogPage from "./pages/customer/Blog/BlogPage";
import SingleBlogPage from "./pages/customer/Blog/SingleBlog";
import Aipriceestimate from "./pages/admin/agents/aipriceestimate/Aipriceestimate";
import AIChatLeadsDashboard from "./pages/admin/aichatleads/AIChatLeads";
import PageView from './pages/customer/PageView';

function App() {
  return (
    <BrowserRouter>
      <StripeProvider>
        <ScrollToTop />
        <ApiInterceptor />
        <Routes>
          {/* ---------------- AUTH ROUTES ---------------- */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/two-factor" element={<TwoFactorPage />} />
            <Route path="/two-factor-setup" element={<TwoFactorSetup />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/social-callback" element={<SocialCallback />} />
          </Route>

          {/* ---------------- USER DASHBOARD ---------------- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- CUSTOMER ROUTES ---------------- */}
          <Route element={<CustomerLayout />}>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />
            {/* Customer Chat */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <CustomerChatPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <ProfileEditForm />
                </ProtectedRoute>
              }
            />

            {/* Property Listing */}
            <Route path="/properties/rent" element={<PropertyFilters />} />
            <Route path="/properties/sale" element={<PropertyFilters />} />
            <Route path="/properties/view/:id" element={<PropertyView />} />

            {/* Contact Page */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/package-plan" element={<PackagePlan />} />
            <Route path="/my-wallet" element={<Creditwallate />} />
            {/* AI Features */}
            <Route path="/ai-hub" element={<AIHub />} />

            {/* Subscriptions */}
            <Route
              path="/subscription-plans"
              element={
                <ProtectedRoute>
                  <SubscriptionPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription-plan/checkout/:planId"
              element={
                <ProtectedRoute>
                  <SubscriptionCheckout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-subscriptions"
              element={
                <ProtectedRoute>
                  <MySubscriptions />
                </ProtectedRoute>
              }
            />
            {/* Blog Page */}
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<SingleBlogPage />} />

            <Route path="/page/:slug" element={<PageView />} />
            {/* Customer Protected Route */}
          </Route>

          {/* ---------------- ADMIN DASHBOARD ---------------- */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAnalyticsDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- AGENT DASHBOARD ---------------- */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- AGENT SUBSCRIPTION ---------------- */}
          <Route
            path="/agent/subscription-plans"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <SubscriptionPlans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/subscription-plan/checkout/:planId"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <SubscriptionCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/my-subscriptions"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <MySubscriptions />
              </ProtectedRoute>
            }
          />

          {/* ---------------- ADMIN PROFILE ROUTES ---------------- */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ViewProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile/edit"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- AGENT PROFILE ROUTES ---------------- */}
          <Route
            path="/agent/profile"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <AgentViewProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/profile/edit"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <AgenteditProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- AGENT LEADS ---------------- */}
          <Route
            path="/agent/leads"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <LeadList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/leads/:id"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <ViewLead />
              </ProtectedRoute>
            }
          />
          {/* ---------------- AGENT Price estimate ---------------- */}
          <Route
            path="/agent/ai-price-estimate"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <Aipriceestimate />
              </ProtectedRoute>
            }
          />

          {/* ---------------- AGENT REMINDERS ---------------- */}
          <Route
            path="/agent/reminders"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <RemindersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/reminders/:id"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <ShowReminder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/reminders/new"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <CreateReminder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/reminders/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <EditReminder />
              </ProtectedRoute>
            }
          />

          {/* ---------------- AGENT MANAGEMENT ---------------- */}
          <Route
            path="/admin/agents"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent"]}>
                <AgentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddAgent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgentProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents/:id/properties"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgentProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/agents/:id/properties/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddProperties />
              </ProtectedRoute>
            }
          />

          {/* ---------------- CUSTOMER MANAGEMENT ---------------- */}
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers/:id/properties"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerPropertyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers/:id/transactions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerTransaction />
              </ProtectedRoute>
            }
          />

          {/* ---------------- SUBSCRIPTIONS MANAGEMENT ---------------- */}
          <Route
            path="/admin/subscriptions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SubscriptionPlanList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddSubscriptionPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ShowSubscriptionPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subscriptions/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditSubscriptionPlan />
              </ProtectedRoute>
            }
          />

          {/* credit package */}
          <Route
            path="/admin/credit"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Credit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wallet"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Wallet />
              </ProtectedRoute>
            }
          />

          {/* ---------------- PROPERTIES (AGENT) ---------------- */}
          <Route
            path="/agent/properties"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <PropertyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/properties/new"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AddProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/properties/:id"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <ViewProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/properties/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["agent", "admin"]}>
                <EditProperty />
              </ProtectedRoute>
            }
          />

          {/* ---------------- PROPERTIES (ADMIN) ---------------- */}
          <Route
            path="/admin/properties"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PropertyListAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/properties/stats"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PropertyStatsAdmin />
              </ProtectedRoute>
            }
          />

          {/* ---------------- CMS (ADMIN) ---------------- */}
          <Route
            path="/admin/cms/faqs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <FAQList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cms/blog-categories"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BlogCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cms/blogs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BlogList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cms/news"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <NewsList />
              </ProtectedRoute>
            }
          />

          {/* PAGES (ADMIN) */}
          <Route
            path="/admin/pages"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PagesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pages/create"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PageEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pages/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PageEditor />
              </ProtectedRoute>
            }
          />

          {/* ---------------- TRANSACTIONS ---------------- */}
          <Route
            path="/admin/transactions/agents"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AgentTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions/customers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CustomerTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/aichatleads"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AIChatLeadsDashboard />
              </ProtectedRoute>
            }
          />

          {/* ---------------- ORDERS, INBOX, CHAT, REVIEWS, SETTINGS ---------------- */}
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inbox"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <InboxPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          {/* ---------------- AGENT CHAT ---------------- */}
          <Route
            path="/agent/chat"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/blogs"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentBlogList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/comments"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentcommentList />
              </ProtectedRoute>
            }
          />
          {/* ---------------- Appointment ---------------- */}
          <Route
            path="/agent/appointments"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- PUBLIC PROPERTY VIEW ---------------- */}
          <Route path="/property/:id" element={<SingleProperty />} />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: "15px" },
          }}
        />

        {/* Floating AI Chat Button - Only Public view - Guest + Auth */}
        <FloatingAIChatWrapper />
      </StripeProvider>
    </BrowserRouter>
  );
}

export default App;
