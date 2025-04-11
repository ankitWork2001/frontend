import React from "react";
import { Link } from "react-router-dom";

const JoinCommunity = () => {
  return (
    <>
      <div
        className="flex justify-center items-center min-h-screen bg-black"
        style={{ marginTop: "-100px" }}
      >
        <div className="bg-white rounded-md shadow-lg w-100 h-75 text-center">
          {/* Circle Image */}
          <div
            className="bg-gray-300 rounded-full mx-auto"
            style={{ width: "80px", height: "80px", margin: "18px auto 10px" }}
          ></div>

          {/* Group Title */}
          <h2 className="text-lg font-bold text-black m-0">
            Concert Enthusiasts
          </h2>
          <p
            className="text-xs text-gray-500 m-0"
            style={{ marginBottom: "16px" }}
          >
            Rock Festival 2024
          </p>

          {/* Current Members Section */}
          <div style={{ marginBottom: "20px" }}>
            <div
              className="flex justify-between items-center"
              style={{ marginLeft: "20px", marginRight: "20px" }}
            >
              <p className="text-sm font-semibold text-black">
                Current Members
              </p>
              <span className="text-xs text-gray-500 font-bold bg-gray-200 rounded-full px-2 py-1">
                3
              </span>
            </div>

            {/* Member Circles Below */}
            <div
              className="flex justify-start items-center gap-2"
              style={{ marginLeft: "20px", marginTop: "12px" }}
            >
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-300 rounded-full"
                  style={{ width: "21px", height: "21px" }}
                ></div>
              ))}
            </div>
          </div>

          {/* Join Button */}
          <Link to="/members-added">
            <button
              className="bg-black text-white rounded-lg cursor-pointer"
              style={{
                padding: "8px",
                marginLeft: "20px",
                marginRight: "20px",
                width: "calc(100% - 40px)",
              }}
            >
              Join Group
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default JoinCommunity;
