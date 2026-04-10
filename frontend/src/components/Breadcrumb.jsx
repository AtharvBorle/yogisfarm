import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
    return (
        <div className="page-header breadcrumb-wrap">
            <div className="container">
                <div className="breadcrumb">
                    <Link to="/"><i className="fi-rs-home mr-5"></i>Home</Link>
                    {items.map((item, index) => (
                        <React.Fragment key={index}>
                            <span></span> {item.link ? <Link to={item.link}>{item.label}</Link> : item.label}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Breadcrumb;
