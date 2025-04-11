import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toDataURL } from 'qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { Client, Storage, ID } from "appwrite";

const Ticket = () => {
  const { state } = useLocation();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState("Guest");
  const [qrData, setQrData] = useState("");

  // Initialize Appwrite client once
  const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT);
  
  const storage = new Storage(client);

  const generateQRCode = async (data) => {
    try {
      return await toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.error("QR generation error:", err);
      setError("Failed to generate QR code");
      return null;
    }
  };

  const uploadQrCodeToStorage = async (data) => {
    try {
      // Generate QR code
      const qrDataUrl = await generateQRCode(data);
      if (!qrDataUrl) throw new Error("QR generation failed");

      // Convert to Blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();

      // Create File object
      const file = new File([blob], `ticket_${Date.now()}.png`, {
        type: 'image/png',
        lastModified: Date.now()
      });

      // Upload to Appwrite
      const uploadedFile = await storage.createFile(
        import.meta.env.VITE_APPWRITE_TICKET_QRs_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get preview URL
      return storage.getFilePreview(
        import.meta.env.VITE_APPWRITE_TICKET_QRs_BUCKET_ID,
        uploadedFile.$id
      );
    } catch (err) {
      console.error("Upload error:", {
        message: err.message,
        stack: err.stack,
        data: data
      });
      throw err;
    }
  };

  useEffect(() => {
    const initializeTicket = async () => {
      try {
        const name = state?.orderDetails?.name || 
                    localStorage.getItem('userName') || 
                    state?.user?.name || 
                    "Guest";
        setUserName(name);

        const ticketId = state?.orderDetails?.ticketId || ID.unique();
        const data = JSON.stringify({
          ticketId,
          eventId: state?.eventDetails?.$id,
          userId: state?.orderDetails?.userId
        });
        setQrData(data);

        // Generate local QR code for display
        const localQrUrl = await generateQRCode(data);
        setQrCodeUrl(localQrUrl || "");

        // Attempt upload (but don't block UI if it fails)
        try {
          const uploadedUrl = await uploadQrCodeToStorage(data);
          setQrCodeUrl(uploadedUrl);
        } catch (uploadErr) {
          console.warn("Upload failed, using local QR:", uploadErr);
        }
      } catch (err) {
        console.error("Ticket initialization error:", err);
        setError("Failed to initialize ticket");
      } finally {
        setLoading(false);
      }
    };

    initializeTicket();
  }, [state]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-white">
      <div className="text-black text-lg">Loading ticket...</div>
    </div>;
  }

  if (!state?.orderDetails || !state?.eventDetails) {
    return <div className="flex justify-center items-center h-screen bg-white">
      <div className="text-black text-lg">Ticket data not found</div>
    </div>;
  }

  const { orderDetails, eventDetails } = state;
  const quantity = orderDetails.selectedQuantity || orderDetails.quantity || 1;
  const ticketId = orderDetails.ticketId || "TKT-XXXXXX-XXXX";



return (
  <div className="flex justify-center items-center min-h-screen p-2 bg-black">
  <div className="w-[320px] bg-white rounded-[32px] shadow-xl text-black relative font-sans overflow-hidden">

    {/* Header */}
    <div className="bg-black text-white text-center py-5 px-3">
      <h1 className="text-2xl font-semibold tracking-wide">{eventDetails.name}</h1>
      <p className="mt-1 text-xs tracking-wide">{eventDetails.tagline || "Premium Event"}</p>
    </div>

    {/* Details */}
    <div className="text-xs text-gray-800 px-4 py-3 grid grid-cols-2 gap-y-3">
      <div>
        <p className="font-semibold">Venue</p>
        <p>{eventDetails.location || "Not specified"}</p>
      </div>
      <div>
        <p className="font-semibold">Date</p>
        <p>
          {new Date(eventDetails.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
      <div>
        <p className="font-semibold">Quantity</p>
        <p>{quantity}</p>
      </div>
      <div>
        <p className="font-semibold">Time</p>
        <p>{eventDetails.time || "8:00 PM"}</p>
      </div>
      <div>
        <p className="font-semibold">Name</p>
        <p>{userName}</p>
      </div>
      <div>
        <p className="font-semibold">Access</p>
        <p>{orderDetails.ticketCategory || "VIP"}: ₹{orderDetails.singleTicketPrice || "0"}</p>
      </div>
    </div>

    {/* Dotted Divider */}
    <div className="border-t border-dotted border-gray-300 mx-4 my-1.5"></div>

    {/* QR Code */}
    <div className="flex flex-col items-center px-3 pb-3">
      <p className="text-xs mb-1 text-gray-600 font-medium">Radiance Tech Event</p>
      <div className="bg-white border border-gray-300 p-2 rounded-md">
        {error ? (
          <p className="text-red-500 text-xs text-center">{error}</p>
        ) : qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="w-40 h-40 object-contain"
            onError={() => setError("Failed to load QR image")}
          />
        ) : (
          <QRCodeSVG
            value={qrData || "temporary-data"}
            size={160}
            level="H"
            includeMargin={true}
          />
        )}
      </div>
      <p className="mt-1 text-gray-600 text-[9px] font-mono">{ticketId.slice(0, 24)}</p>
      <p className="text-base font-semibold mt-1">x{quantity}</p>
    </div>

    {/* Footer */}
    <div className="text-center bg-black text-white py-3">
      <p className="text-xs text-gray-400">booked on</p>
      <p className="font-bold text-base tracking-wide">ShowGo.</p>
    </div>

    {/* Decorative Circles */}
    <div className="absolute top-1/2 -translate-y-1/2 -left-3 h-8 w-8 bg-black rounded-full border-4 border-white"></div>
    <div className="absolute top-1/2 -translate-y-1/2 -right-3 h-8 w-8 bg-black rounded-full border-4 border-white"></div>
  </div>
</div>
);

};

export default Ticket;