import React, { useState } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/navigation/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { LandingPage } from './components/public/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
import { RegisterModal } from './components/auth/RegisterModal';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FlatsManagement } from './components/admin/FlatsManagement';
import { OwnersManagement } from './components/admin/OwnersManagement';
import { TenantsManagement } from './components/admin/TenantsManagement';
import { WorkersManagement } from './components/admin/WorkersManagement';
import { BillsManagement } from './components/admin/BillsManagement';
import { PaymentsManagement } from './components/admin/PaymentsManagement';
import { ComplaintsManagement } from './components/admin/ComplaintsManagement';
import { AnnouncementsManagement } from './components/admin/AnnouncementsManagement';
import { ServicesManagement } from './components/admin/ServicesManagement';
import { AuditTrail } from './components/admin/AuditTrail';
import { AllResidentsManagement } from './components/admin/AllResidentsManagement';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { SecurityGuardPortal } from './components/security/SecurityGuardPortal';
import { ServiceBookingPortal } from './components/services/ServiceBookingPortal';
import { PrivateChatView } from './components/chat/PrivateChatView';

// Owner Views
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { OwnerProperties } from './components/owner/OwnerProperties';
import { OwnerBillsAndCollections } from './components/owner/OwnerBillsAndCollections';
import { OwnerComplaints } from './components/owner/OwnerComplaints';

// Tenant Views
import { TenantDashboard } from './components/tenant/TenantDashboard';
import { TenantRentAndBills } from './components/tenant/TenantRentAndBills';
import { TenantPaymentHistory } from './components/tenant/TenantPaymentHistory';
import { TenantComplaints } from './components/tenant/TenantComplaints';
import { TenantServices } from './components/tenant/TenantServices';
import { TenantProfile } from './components/tenant/TenantProfile';

// Worker Views
import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { WorkerTasks } from './components/worker/WorkerTasks';
import { WorkerTaskHistory } from './components/worker/WorkerTaskHistory';
import { WorkerProfile } from './components/worker/WorkerProfile';

import { UserRole } from './types';

const MainApp: React.FC = () => {
  const { currentUser, loginAsRole } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | undefined>(undefined);

  // Global Action Modals from Dashboard triggers
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Admin Dashboard Shortcuts
  const [openCommonBillModal, setOpenCommonBillModal] = useState(false);
  const [openAddFlatModal, setOpenAddFlatModal] = useState(false);
  const [openAnnouncementModal, setOpenAnnouncementModal] = useState(false);

  // Tenant Dashboard Shortcut
  const [openTenantComplaintModal, setOpenTenantComplaintModal] = useState(false);

  // If not logged in, show Landing Page with interactive persona launcher
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <LandingPage
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onSelectRole={(role: UserRole) => {
            setCurrentTab('dashboard');
          }}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
        />

        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterOpen(false);
            setIsLoginOpen(true);
          }}
        />
      </div>
    );
  }

  // Active View Resolver
  const renderCurrentView = () => {
    const role = currentUser.role;

    // --- SUPER ADMIN VIEWS ---
    if (role === 'SUPER_ADMIN') {
      switch (currentTab) {
        case 'super-admin':
        case 'dashboard':
          return (
            <SuperAdminPortal
              onOpenChatWithAdmin={(adminId) => {
                setActiveChatPartnerId(adminId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'directory':
          return (
            <AllResidentsManagement
              onOpenChatWithUser={(partnerId) => {
                setActiveChatPartnerId(partnerId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'security':
          return <SecurityGuardPortal />;
        case 'services':
        case 'bookings':
          return (
            <ServiceBookingPortal
              onOpenChatWithWorker={(workerUserId) => {
                setActiveChatPartnerId(workerUserId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'chat':
          return (
            <PrivateChatView
              initialPartnerId={activeChatPartnerId}
              onClose={() => setCurrentTab('super-admin')}
            />
          );
        case 'audit':
          return <AuditTrail />;
        default:
          return (
            <SuperAdminPortal
              onOpenChatWithAdmin={(adminId) => {
                setActiveChatPartnerId(adminId);
                setCurrentTab('chat');
              }}
            />
          );
      }
    }

    // --- SECURITY / WATCHMAN VIEWS ---
    if (role === 'SECURITY') {
      switch (currentTab) {
        case 'security':
        case 'dashboard':
          return <SecurityGuardPortal />;
        case 'chat':
          return (
            <PrivateChatView
              initialPartnerId={activeChatPartnerId}
              onClose={() => setCurrentTab('security')}
            />
          );
        case 'announcements':
          return <AnnouncementsManagement />;
        default:
          return <SecurityGuardPortal />;
      }
    }

    // --- ADMIN VIEWS ---
    if (role === 'ADMIN') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <AdminDashboard
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenCreateBill={() => setCurrentTab('bills')}
              onOpenCreateCommonBill={() => {
                setOpenCommonBillModal(true);
                setCurrentTab('bills');
              }}
              onOpenAddFlat={() => {
                setOpenAddFlatModal(true);
                setCurrentTab('flats');
              }}
              onOpenCreateAnnouncement={() => {
                setOpenAnnouncementModal(true);
                setCurrentTab('announcements');
              }}
            />
          );
        case 'directory':
          return (
            <AllResidentsManagement
              onOpenChatWithUser={(partnerId) => {
                setActiveChatPartnerId(partnerId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'security':
          return <SecurityGuardPortal />;
        case 'chat':
          return (
            <PrivateChatView
              initialPartnerId={activeChatPartnerId}
              onClose={() => setCurrentTab('dashboard')}
            />
          );
        case 'flats':
          return <FlatsManagement />;
        case 'owners':
          return <OwnersManagement />;
        case 'tenants':
          return <TenantsManagement />;
        case 'workers':
          return <WorkersManagement />;
        case 'bills':
          return <BillsManagement initialOpenCommonBill={openCommonBillModal} />;
        case 'payments':
          return <PaymentsManagement />;
        case 'complaints':
          return <ComplaintsManagement />;
        case 'announcements':
          return <AnnouncementsManagement initialOpenCreate={openAnnouncementModal} />;
        case 'services':
        case 'bookings':
          return (
            <ServiceBookingPortal
              onOpenChatWithWorker={(workerUserId) => {
                setActiveChatPartnerId(workerUserId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'audit':
          return <AuditTrail />;
        default:
          return (
            <AdminDashboard
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenCreateBill={() => setCurrentTab('bills')}
              onOpenCreateCommonBill={() => setCurrentTab('bills')}
              onOpenAddFlat={() => setCurrentTab('flats')}
              onOpenCreateAnnouncement={() => setCurrentTab('announcements')}
            />
          );
      }
    }

    // --- OWNER VIEWS ---
    if (role === 'OWNER') {
      switch (currentTab) {
        case 'dashboard':
          return <OwnerDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
        case 'chat':
          return (
            <PrivateChatView
              initialPartnerId={activeChatPartnerId}
              onClose={() => setCurrentTab('dashboard')}
            />
          );
        case 'properties':
          return <OwnerProperties />;
        case 'tenants':
          return <OwnersManagement />;
        case 'bills':
        case 'payments':
          return <OwnerBillsAndCollections />;
        case 'complaints':
          return <OwnerComplaints />;
        case 'announcements':
          return <AnnouncementsManagement />;
        case 'services':
        case 'bookings':
          return (
            <ServiceBookingPortal
              onOpenChatWithWorker={(workerUserId) => {
                setActiveChatPartnerId(workerUserId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'profile':
          return <TenantProfile />;
        default:
          return <OwnerDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
      }
    }

    // --- TENANT VIEWS ---
    if (role === 'TENANT') {
      switch (currentTab) {
        case 'dashboard':
          return (
            <TenantDashboard
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNewComplaint={() => {
                setOpenTenantComplaintModal(true);
                setCurrentTab('complaints');
              }}
            />
          );
        case 'chat':
          return (
            <PrivateChatView
              initialPartnerId={activeChatPartnerId}
              onClose={() => setCurrentTab('dashboard')}
            />
          );
        case 'my-flat':
          return <TenantProfile />;
        case 'rent-bills':
          return <TenantRentAndBills />;
        case 'payments':
          return <TenantPaymentHistory />;
        case 'complaints':
          return <TenantComplaints initialOpenCreate={openTenantComplaintModal} />;
        case 'announcements':
          return <AnnouncementsManagement />;
        case 'services':
        case 'bookings':
          return (
            <ServiceBookingPortal
              onOpenChatWithWorker={(workerUserId) => {
                setActiveChatPartnerId(workerUserId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'profile':
          return <TenantProfile />;
        default:
          return (
            <TenantDashboard
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNewComplaint={() => setCurrentTab('complaints')}
            />
          );
      }
    }

    // --- WORKER VIEWS ---
    if (role === 'WORKER') {
      switch (currentTab) {
        case 'dashboard':
          return <WorkerDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
        case 'chat':
          return (
            <PrivateChatView
              initialPartnerId={activeChatPartnerId}
              onClose={() => setCurrentTab('dashboard')}
            />
          );
        case 'tasks':
          return <WorkerTasks />;
        case 'bookings':
          return (
            <ServiceBookingPortal
              onOpenChatWithWorker={(workerUserId) => {
                setActiveChatPartnerId(workerUserId);
                setCurrentTab('chat');
              }}
            />
          );
        case 'history':
          return <WorkerTaskHistory />;
        case 'profile':
          return <WorkerProfile />;
        default:
          return <WorkerDashboard onNavigateTab={(tab) => setCurrentTab(tab)} />;
      }
    }

    return <div>Select a tab to view content.</div>;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Navbar */}
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onNavigateHome={() => setCurrentTab('dashboard')}
        onOpenChat={() => {
          setActiveChatPartnerId(undefined);
          setCurrentTab('chat');
        }}
      />


      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              // Reset any one-shot modal flags
              setOpenCommonBillModal(false);
              setOpenAnnouncementModal(false);
              setOpenTenantComplaintModal(false);
            }}
          />
        </div>

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50 shadow-2xl">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={(tab) => {
                  setCurrentTab(tab);
                  setIsMobileMenuOpen(false);
                  setOpenCommonBillModal(false);
                  setOpenAnnouncementModal(false);
                  setOpenTenantComplaintModal(false);
                }}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderCurrentView()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
