import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Search } from 'lucide-react';
import { useBarberFollowers } from '@/hooks/useBarberFollowers';

const BarberFollowers = () => {
    const { profile, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('followers'); // 'followers' or 'following'
    const { getFollowers, getFollowing } = useBarberFollowers();
    
    // Mock data for UI
    const mockFollowers = [
        { id: 1, name: 'Ahmet Yılmaz', avatar: 'https://i.pravatar.cc/150?u=ahmet', date: '12.10.2025' },
        { id: 2, name: 'Zeynep Kaya', avatar: 'https://i.pravatar.cc/150?u=zeynep', date: '10.10.2025' },
    ];
    const mockFollowing = [
        { id: 3, name: 'Mehmet Öztürk', avatar: 'https://i.pravatar.cc/150?u=mehmet', date: '05.09.2025' },
    ];

    const list = activeTab === 'followers' ? mockFollowers : mockFollowing;

    if (authLoading) {
        return <div className="flex items-center justify-center h-full"><p className="text-[color:var(--tr-text-muted)]">Yükleniyor...</p></div>;
    }
    
    if (!profile || profile.role !== 'barber') {
        return <Navigate to="/giris" replace />;
    }

    return (
        <>
            <Helmet>
                <title>Takipçiler - Tıraş Randevum</title>
                <meta name="description" content="Takipçilerinizi ve takip ettiğiniz kişileri yönetin." />
            </Helmet>
            <div className="p-4 sm:p-6 md:p-8 bg-[color:var(--tr-bg)] text-[color:var(--tr-text)]">
                <div className="max-w-3xl mx-auto">
                    <Card className="bg-[color:var(--tr-bg-soft)] border-[color:var(--tr-border-strong)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users /> Takipçi Yönetimi
                            </CardTitle>
                            <div className="flex justify-between items-center pt-4">
                                <div className="flex space-x-1 bg-[color:var(--tr-bg-elevated)] p-1 rounded-lg">
                                    <Button variant={activeTab === 'followers' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('followers')} className={`px-4 py-1.5 h-auto text-sm ${activeTab === 'followers' ? 'bg-[color:var(--tr-accent)] text-white' : ''}`}>Takipçiler</Button>
                                    <Button variant={activeTab === 'following' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('following')} className={`px-4 py-1.5 h-auto text-sm ${activeTab === 'following' ? 'bg-[color:var(--tr-accent)] text-white' : ''}`}>Takip Edilenler</Button>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--tr-text-muted)]" />
                                    <Input placeholder="Ara..." className="pl-9 bg-[color:var(--tr-bg-elevated)] border-[color:var(--tr-border-strong)]" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {list.length > 0 ? list.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-[color:var(--tr-bg-elevated)]">
                                        <div className="flex items-center gap-4">
                                            <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold">{user.name}</p>
                                                <p className="text-xs text-[color:var(--tr-text-muted)]">Takip tarihi: {user.date}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                            {activeTab === 'followers' ? 'Kaldır' : 'Takipten Çık'}
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-center text-[color:var(--tr-text-muted)] py-8">
                                        {activeTab === 'followers' ? 'Henüz takipçiniz yok.' : 'Henüz kimseyi takip etmiyorsunuz.'}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default BarberFollowers;