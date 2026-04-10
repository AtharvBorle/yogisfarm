import React from 'react';
import Breadcrumb from '../components/Breadcrumb';

const About = () => (
  <main className="main">
    <Breadcrumb items={[{ label: 'About' }]} />
    <div className="container mt-50 mb-50"><h2>About Page</h2><p>Coming soon...</p></div>
  </main>
);

export default About;
