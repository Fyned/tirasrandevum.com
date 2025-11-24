import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tabs = [
  { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'barbers', label: 'Berberler', icon: Briefcase },
  { id: 'customers', label: 'Müşteriler', icon: Users },
  { id: 'appointments', label: 'Randevular', icon: Calendar },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

const AdminLayout = ({ activeTab, onTabChange, children, subtitle, welcomeMessage }) => {
  return (
    <div className="min-h-screen bg-[color:var(--tr-bg)] text-[color:var(--tr-text)] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[color:var(--tr-text)]">{welcomeMessage}</h1>
          <p className="text-lg text-[color:var(--tr-text-muted)] mt-1">{subtitle}</p>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="relative flex items-center gap-2 p-1 rounded-full bg-[color:var(--tr-surface)] border border-[color:var(--tr-border)] w-full max-w-max">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                variant="ghost"
                className="relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--tr-accent)] focus-visible:ring-offset-[color:var(--tr-surface)]"
                style={{
                  color: activeTab === tab.id ? 'white' : 'var(--tr-text-muted)',
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="admin-active-tab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;