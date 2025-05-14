import React from "react";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <h1 className="text-center mb-4 fw-bold">Reset Your Password</h1>

          <ForgotPasswordForm />

          <div className="mt-4 text-center">
            <p className="text-muted small">
              Need help?{" "}
              <a href="/contact" className="text-decoration-none">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
