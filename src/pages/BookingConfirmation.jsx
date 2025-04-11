import React from "react";
import { AiFillApple, AiFillWindows } from "react-icons/ai";
import { useLocation, useParams, Link } from "react-router-dom";
import Ticket from "./bookings/ticket";

const BookingConfirmation = () => {
  const { orderId } = useParams();
  const { state } = useLocation();
  
  // Access the passed data
  const orderDetails = state?.orderDetails;
  const eventDetails = state?.eventDetails;

  return (
    <div className="min-h-screen flex  justify-around bg-black text-white p-6">
      <div className="max-w-4xl w-full flex flex-col md:flex-row mt-6 gap-40">
        {/* Left Section - Ticket Image */}
        <div className="w-1/2 flex justify-center">
      <Ticket/>
      </div>

        {/* Right Section - Booking Confirmation */}
        <div className="md:w-1/2 text-center font-serif md:text-left p-4">
          <h1
            className="text-3xl text-center md:text-4xl font-normal"
            style={{ marginBottom: "16px" }}
          >
            Booking Confirmed! #{orderId}
          </h1>
          <p
            className="text-md text-center text-gray-300"
            style={{ marginBottom: "24px", marginLeft: "16px" }}
          >
            Your ticket for {eventDetails?.name} has been booked successfully. <br />
            An email with the ticket and invoice has <br />
            been sent to your registered email address.
          </p>

          {/* Buttons */}
          <div
            className="flex flex-col mt-4 md:flex-row justify-center md:justify-start gap-4"
            style={{ marginBottom: "44px" }}
          >
            <button
              className="bg-white text-black font-semibold px-6 py-2 rounded-2xl font-medium w-full"
              style={{ padding: "4px" }}
            >
              Download
            </button>
            <Link to="/">
              <button
                className="bg-white text-black font-semibold px-6 py-2 rounded-2xl font-medium w-full"
                style={{ padding: "4px" }}
              >
                Go Back
              </button>
            </Link>
          </div>
          
          {/* Mobile App Section */}
          <div
            className="flex items-center justify-between bg-white text-black rounded-2xl shadow-md"
            style={{ padding: "8px" }}
          >
            {/* Left Section - Text with Icon */}
            <div className="flex items-center gap-2">
              <span className="text-black font-semibold text-xs">ⓘ</span>
              <p className="text-xs">
                Download our iOS or Android Mobile app for easy access
              </p>
            </div>

            {/* Divider */}
            <div className="border-l border-gray-400 h-10 mx-4"></div>

            {/* Right Section - Download Options */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <AiFillWindows className="text-xs" />
                <span className="font-semibold text-xs">Android</span>
              </div>
              <div className="flex items-center gap-2">
                <AiFillApple className="text-xs" />
                <span className="font-semibold text-xs">iOS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;