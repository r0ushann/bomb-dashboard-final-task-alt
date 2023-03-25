import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Page from '../../components/Page/Page';

import HomeImage from '../../assets/img/background.jpg'

const backgroundImage = createGlobalStyle `
body{
    background: url(${HomeImage}) repeat !important;
    background-size: cover !important;
    background-color: #171923;
}`;

const Dashboard = () => {
    return (
        <Page>

        </Page>
    )
}


export default Dashboard;
