import React from 'react';
import { Navigate } from 'react-router-dom';
import BarberInstagramProfile from './BarberInstagramProfile.jsx';

// This component now acts as a wrapper/redirect to the new Instagram-style profile.
const BarberPortfolio = () => {
    return <Navigate to="/berber/instagram-profile" replace />;
};

export default BarberPortfolio;