import React, { useState, useEffect, useMemo } from "react";
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
  const client = useMemo(() => {
    return new Client()
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT);
  }, []);

  const storage = useMemo(() => new Storage(client), [client]);


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

        // Check if already downloaded
        const isDownloaded = localStorage.getItem(`ticketDownloaded_${ticketId}`);
        if (isDownloaded) {
          console.log('Ticket already downloaded');
        }

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
    <div className="flex justify-center items-center min-h-screen p-4 bg-black">
      <div className="font-serif w-[340px] h-[620px] bg-white rounded-[40px] flex flex-col overflow-hidden drop-shadow-[0px_4px_10px_rgba(255,255,255,0.7)]">

        {/* Top White Padding - Reduced height */}
        <div className="h-6 bg-white flex-none"></div>

        {/* Header - Made more compact */}
        <div className="bg-gradient-to-b from-black to-gray-900 w-full flex-none flex flex-col justify-center items-center py-3 px-2 text-white">
          <div className="text-lg font-bold line-clamp-2 text-center">{eventDetails.name}</div>
          <div className="text-xs text-center mt-1">{eventDetails.tagline || "Premium Event"}</div>
        </div>

        {/* Tagline - Made more compact */}
        <div className="w-full flex justify-center py-1 flex-none">
          <div className="text-[10px] text-gray-500">The Sound of Arijit Singh</div>
        </div>

        {/* Main Content - Added overflow control */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Info Section - Reduced padding and gaps */}
          <div className="w-full flex px-4 py-2">
            <div className="w-1/2 flex flex-col gap-3">
              <div>
                <div className="text-xs font-bold text-black">Venue</div>
                <div className="text-[10px] text-gray-600 line-clamp-2">{eventDetails.location || "Not specified"}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-black">Quantity</div>
                <div className="text-[10px] text-gray-600">{quantity}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-black">Name</div>
                <div className="text-[10px] text-gray-600 line-clamp-1">
                  {userName && userName.length > 20 ? userName.slice(0, 17) + "..." : userName}
                </div>
              </div>
            </div>

            <div className="w-1/2 flex flex-col gap-3">
              <div>
                <div className="text-xs font-bold text-black">Date</div>
                <div className="text-[10px] text-gray-600">
                  {new Date(eventDetails.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-black">Time</div>
                <div className="text-[10px] text-gray-600">{eventDetails.time || "8:00 PM"}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-black">Access</div>
                <div className="text-[10px] text-gray-600">
                  {orderDetails.ticketCategory || "VIP"}: ₹{orderDetails.singleTicketPrice || "0"}
                </div>
              </div>
            </div>
          </div>

          {/* Dotted Line + Circles - Made more compact */}
          <div className="relative py-4">
            <div className="absolute top-1/2 left-8 right-8 border-t-2 border-dotted border-gray-300"></div>
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 h-8 w-8 bg-black rounded-full border-[4px] border-white"></div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 h-8 w-8 bg-black rounded-full border-[4px] border-white"></div>
          </div>

          {/* QR Section - Made more compact */}
          <div className="flex flex-col items-center px-4 pb-4">
            <p className="text-xs mb-2 text-gray-600 font-medium">Radiance Tech Event</p>
            <div className="bg-white border border-gray-300 p-2 rounded-lg">
              {error ? (
                <p className="text-red-500 text-xs text-center">{error}</p>
              ) : qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-32 h-32 object-contain"
                  onError={() => setError("Failed to load QR image")}
                />
              ) : (
                <QRCodeSVG
                  value={qrData || "temporary-data"}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            {/* Ticket ID + Quantity */}
<div className="w-full mt-2 flex flex-col items-center justify-center space-y-1 px-2">
  <p className="text-gray-600 text-[10px] font-mono text-center break-words">
    {ticketId}
  </p>
  <p className="text-lg font-bold text-center">x{quantity}</p>
</div>
          </div>
        </div>

        {/* Footer - Made more compact */}
        <div className="bg-gradient-to-b from-black to-gray-900 w-full flex-none flex flex-col justify-center items-center py-3 px-2 text-white">
          <div className="text-[10px] text-gray-400">booked on</div>
          <div className="bg-gray-400 w-24 h-[1px] my-1"></div>
          <div className="text-lg font-bold mt-1">Show GO</div>
        </div>

        {/* Bottom White Padding - Reduced height */}
        <div className="h-6 bg-white flex-none"></div>
      </div>
    </div>
  );
};

export default Ticket;