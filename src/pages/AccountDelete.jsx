import { FiSend } from "react-icons/fi";
import Footer from "../components/Footer";

const AccountDelete = () => {
  return (
    <>
      <div className="min-h-[648px] flex flex-col items-center justify-center bg-black text-white px-4">
        <div
          className="bg-gray-900 rounded-md w-full max-w-md min-w-0 flex flex-col items-center text-center"
          style={{ padding: "24px" }}
        >
          {/* Title */}
          <h1
            className="text-lg font-bold md:text-xl"
            style={{ paddingBottom: "8px" }}
          >
            Account Deletion Request
          </h1>
          <p
            className="text-gray-400 text-sm md:text-base mt-2"
            style={{ paddingBottom: "10px" }}
          >
            We're sorry to see you go. Please fill out this form to request
            account deletion.
          </p>

          {/* Form */}
          <form className="flex flex-col gap-3 mt-4 w-full">
            {/* Full Name */}
            <div className="text-left w-full">
              <label className="text-gray-400 text-xs md:text-sm">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full mt-1 rounded text-white focus:outline-none text-sm"
                style={{
                  padding: "6px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #333",
                }}
              />
            </div>

            {/* Email Address */}
            <div className="text-left w-full">
              <label className="text-gray-400 text-xs md:text-sm">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full mt-1 rounded text-white focus:outline-none text-sm"
                style={{
                  padding: "6px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #333",
                }}
              />
            </div>

            {/* User ID */}
            <div className="text-left w-full">
              <label className="text-gray-400 text-xs md:text-sm">
                User ID
              </label>
              <input
                type="text"
                placeholder="Enter your User ID"
                className="w-full mt-1 rounded text-white focus:outline-none text-sm"
                style={{
                  padding: "6px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #333",
                }}
              />
            </div>

            {/* Reason for Deletion */}
            <div className="text-left w-full">
              <label className="text-gray-400 text-xs md:text-sm">
                Reason for Deletion
              </label>
              <textarea
                rows="4"
                placeholder="Please tell us why you want to delete your account..."
                className="w-full mt-1 rounded text-white focus:outline-none text-sm"
                style={{
                  padding: "10px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #333",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-white text-black py-2 rounded-full font-medium flex items-center justify-center gap-2 mt-3 text-sm"
              style={{ padding: "6px" }}
            >
              <FiSend size={18} /> Send Request
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AccountDelete;
