import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card"; // Assuming you have a Card component

const AboutPage = () => {
  return (
    <div className="container py-5">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            About Us
          </li>
        </ol>
      </nav>

      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">About Our Company</h1>
        <p className="lead text-muted">
          Learn more about our mission, vision, and the team dedicated to
          bringing you the best products.
        </p>
      </div>

      <div className="row g-5">
        <div className="col-lg-6">
          <Card className="h-100 shadow-sm">
            <div className="p-4">
              <h3 className="fw-semibold mb-3">
                <i className="bi bi-bullseye me-2 text-danger"></i>Our Mission
              </h3>
              <p className="text-muted">
                Our mission is to provide high-quality electronic products and
                accessories with exceptional customer service. We strive to
                innovate and adapt to the ever-changing technological landscape,
                ensuring our customers always have access to the latest and
                greatest in tech.
              </p>
              <p className="text-muted">
                We believe in building lasting relationships with our customers
                based on trust, reliability, and a shared passion for
                technology.
              </p>
            </div>
          </Card>
        </div>

        <div className="col-lg-6">
          <Card className="h-100 shadow-sm">
            <div className="p-4">
              <h3 className="fw-semibold mb-3">
                <i className="bi bi-book-half me-2 text-danger"></i>Our Story
              </h3>
              <p className="text-muted">
                Founded in [2030], Our Company started as a small venture with a
                big dream: to make cutting-edge technology accessible to
                everyone. What began in a small office (or garage!) has grown
                into a trusted online retailer, serving thousands of customers
                nationwide.
              </p>
              <p className="text-muted">
                Oh my god i spent 12 hours 5 days in a row to get this done. I
                am Ma Quoc Cuong and i know that no one will take a look at this
                line.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="my-5 py-4 bg-light rounded p-4 p-md-5">
        <h2 className="text-center fw-bold mb-4">Why Choose Us?</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="text-center">
              <div className="icon-circle bg-danger text-white mb-3 mx-auto">
                <i className="bi bi-award fs-2"></i>
              </div>
              <h5 className="fw-semibold">Quality Products</h5>
              <p className="text-muted small">
                We source only the best products from reputable brands.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-center">
              <div className="icon-circle bg-danger text-white mb-3 mx-auto">
                <i className="bi bi-headset fs-2"></i>
              </div>
              <h5 className="fw-semibold">Exceptional Support</h5>
              <p className="text-muted small">
                Our dedicated team is here to help you every step of the way.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-center">
              <div className="icon-circle bg-danger text-white mb-3 mx-auto">
                <i className="bi bi-truck fs-2"></i>
              </div>
              <h5 className="fw-semibold">Fast Shipping</h5>
              <p className="text-muted small">
                Get your orders delivered quickly and reliably.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <h2 className="fw-bold mb-4">Meet Our Team (Coming Soon)</h2>
        <p className="text-muted">
          We're working on introducing the amazing individuals behind Our
          Company. Stay tuned for updates!
        </p>
        {/* Placeholder for team members if you want to add them later */}
        {/*
        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <Card className="shadow-sm">
              <img src="/images/placeholders/team-member-1.jpg" className="card-img-top" alt="Team Member 1" />
              <div className="card-body text-center">
                <h5 className="card-title fw-semibold">Jane Doe</h5>
                <p className="card-text text-muted">CEO & Founder</p>
              </div>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="shadow-sm">
              <img src="/images/placeholders/team-member-2.jpg" className="card-img-top" alt="Team Member 2" />
              <div className="card-body text-center">
                <h5 className="card-title fw-semibold">John Smith</h5>
                <p className="card-text text-muted">Head of Technology</p>
              </div>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="shadow-sm">
              <img src="/images/placeholders/team-member-3.jpg" className="card-img-top" alt="Team Member 3" />
              <div className="card-body text-center">
                <h5 className="card-title fw-semibold">Alice Brown</h5>
                <p className="card-text text-muted">Marketing Director</p>
              </div>
            </Card>
          </div>
        </div>
        */}
      </div>

      <style jsx>{`
        .icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
