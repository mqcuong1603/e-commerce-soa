import React from "react";

const DashboardLoader = () => {
  return (
    <div className="container-fluid p-4">
      {/* Header with gradient */}
      <div className="bg-gradient bg-primary text-white p-4 rounded-3 mb-4 shadow-sm">
        <h1 className="display-6 mb-0">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h1>
      </div>

      <div className="row g-4">
        {/* Main stats cards with shimmer effect */}
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm position-relative overflow-hidden">
              <div className="card-body p-3">
                <div className="placeholder-glow">
                  <span className="placeholder col-6 bg-primary bg-opacity-25 mb-2"></span>
                  <h3 className="placeholder col-4 bg-secondary bg-opacity-25"></h3>
                  <p className="placeholder col-8 bg-secondary bg-opacity-10"></p>
                </div>
              </div>
              {/* Animated shimmer overlay */}
              <div
                className="position-absolute top-0 start-0 h-100 w-100"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
                  animation: "shimmer 1.5s infinite",
                  transform: "skewX(-20deg)",
                  zIndex: 2,
                }}
              ></div>
            </div>
          </div>
        ))}

        {/* Chart loading placeholder */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div className="card-header bg-transparent py-3 d-flex justify-content-between align-items-center">
              <div className="placeholder-glow">
                <span className="placeholder col-4 bg-primary bg-opacity-25"></span>
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-6 bg-secondary bg-opacity-25"></span>
              </div>
            </div>
            <div
              className="card-body d-flex flex-column justify-content-center align-items-center"
              style={{ minHeight: "300px" }}
            >
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading chart data...</span>
              </div>
              <p className="text-muted mt-3 mb-0">
                Preparing your dashboard analytics...
              </p>
            </div>
            {/* Animated shimmer overlay */}
            <div
              className="position-absolute top-0 start-0 h-100 w-100"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
                animation: "shimmer 1.5s infinite",
                transform: "skewX(-20deg)",
                zIndex: 1,
              }}
            ></div>
          </div>
        </div>

        {/* Recent activity loading placeholder */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div className="card-header bg-transparent py-3">
              <div className="placeholder-glow">
                <span className="placeholder col-7 bg-primary bg-opacity-25"></span>
              </div>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {[1, 2, 3, 4].map((index) => (
                  <li
                    key={index}
                    className="list-group-item px-0 py-3 border-bottom"
                  >
                    <div className="d-flex align-items-center">
                      <div className="placeholder-glow me-3">
                        <span
                          className="placeholder rounded-circle bg-secondary bg-opacity-25"
                          style={{ width: "40px", height: "40px" }}
                        ></span>
                      </div>
                      <div className="flex-grow-1 placeholder-glow">
                        <span className="placeholder col-7 bg-secondary bg-opacity-25 mb-1"></span>
                        <span className="placeholder col-5 bg-secondary bg-opacity-10"></span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Animated shimmer overlay */}
            <div
              className="position-absolute top-0 start-0 h-100 w-100"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
                animation: "shimmer 1.5s infinite",
                transform: "skewX(-20deg)",
                zIndex: 1,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          100% {
            transform: translateX(150%) skewX(-20deg);
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLoader;
