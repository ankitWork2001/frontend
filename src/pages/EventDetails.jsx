import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaShareAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { getEventDetails, createOrder, databases, ID, createTransaction, getRazorpayKey, updateTicketQuantity, storage } from "../api/appwriteConfig";
import QRCode from 'qrcode';

const EventDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { quantity, selectedTicket, increment, decrement, updateSelectedTicket, userId, user } = useCart();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [ticketsAvailable, setTicketsAvailable] = useState({});

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setError("No event ID found in URL");
        setLoading(false);
        navigate('/events');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const eventData = await getEventDetails(eventId);
        if (!eventData) throw new Error("Event data not found");

        console.log("RAW EVENT DATA FROM DB:", eventData); // Debug log

        const imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/66dd97eb0009f68104ef/files/${eventData.imageFileId}/view?project=67699acf002ecc80c89f&mode=admin`;

        // Calculate tickets available for each category
        const ticketsData = {};
        if (eventData.categories && Array.isArray(eventData.categories)) {
          eventData.categories.forEach(cat => {
            try {
              const [name, price, qty] = cat.split(':').map(item => item.trim());
              ticketsData[name] = parseInt(qty) || 0;
            } catch (err) {
              console.error("Error processing category:", cat, err);
            }
          });
        }

        setTicketsAvailable(ticketsData);
        setEvent({ ...eventData, imageField: imageUrl });

        // Initialize selected ticket
        if (eventData.categories?.length > 0) {
          const activeTickets = eventData.categories
            .filter(cat => {
              try {
                const [name] = cat.split(':').map(item => item.trim());
                return ticketsData[name] > 0;
              } catch (err) {
                return false;
              }
            })
            .map(cat => {
              const [name, price, qty] = cat.split(':').map(item => item.trim());
              return {
                name,
                price: parseFloat(price),
                display: `${name} - Rs. ${price}`,
                category: name,
                available: parseInt(qty) || 0
              };
            });

          if (activeTickets.length > 0 && !selectedTicket) {
            updateSelectedTicket(activeTickets[0]);
          }
        }
      } catch (err) {
        console.error("Event fetch failed:", err);
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

  const getTicketOptions = () => {
    if (!event?.categories || !Array.isArray(event.categories)) return [];
  
    const currentPhase = Array.isArray(event.phase)
      ? event.phase.filter(Boolean).slice(-1)[0]?.split(':')[0]?.trim()
      : null;
  
    return event.categories
      .filter(cat => {
        try {
          const parts = cat.split(':').map(item => item.trim());
          if (parts.length < 4) return false;
  
          const [name, price, qty, phaseTag] = parts;
  
          return parseInt(qty) > 0 && phaseTag === currentPhase;
        } catch (err) {
          console.error("Error processing category:", cat, err);
          return false;
        }
      })
      .map(cat => {
        const [name, price, qty, phaseTag] = cat.split(':').map(item => item.trim());
        return {
          name,
          price: parseFloat(price),
          display: `${name} - Rs. ${price} (${phaseTag})`, // ← Phase show karwa diya yahan
          category: name,
          available: parseInt(qty) || 0
        };
      });
  };
  
  
  

  const ticketOptions = getTicketOptions();
  const currentTicket = selectedTicket || ticketOptions[0];
  const isSoldOut = ticketOptions.length === 0;

  const calculateTotals = () => {
    if (!currentTicket) return {
      gst: 0,
      internetHandlingFee: 0,
      subtotal: 0,
      totalAmount: 0
    };

    const subtotal = (currentTicket.price * quantity).toFixed(2);
    const gst = (currentTicket.price * quantity * 0.05).toFixed(2);
    const internetHandlingFee = (currentTicket.price * quantity * 0.05).toFixed(2);
    const totalAmount = (parseFloat(subtotal) + parseFloat(gst) + parseFloat(internetHandlingFee)).toFixed(2);

    return { gst, internetHandlingFee, subtotal, totalAmount };
  };

  const { gst, internetHandlingFee, subtotal, totalAmount } = calculateTotals();

  const handleBookNow = async () => {
    if (isSoldOut) {
      alert("This ticket is sold out!");
      return;
    }

    if (!userId) {
      navigate('/login-signup', { state: { from: `/events/${eventId}` } });
      return;
    }

    if (!currentTicket || !user?.name || !eventId || !event) {
      alert("Please select a ticket and ensure all details are filled");
      return;
    }

    setBookingLoading(true);

    try {
      // Generate IDs
      const ticketId = `TKT-${Date.now().toString().slice(-9)}-${Math.random().toString(36).substr(2, 4)}`;
      const transactionId = `TXN-${Date.now()}`;

      // Check ticket availability again and create lock
      const ticketCategory = currentTicket.name.split(' - ')[0];
      const availableTickets = ticketsAvailable[ticketCategory];

      if (availableTickets <= 0) {
        alert("This ticket is now sold out!");
        setBookingLoading(false);
        return;
      }

      // Create a lock for this ticket
      const lockId = ID.unique();
      const lockExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      try {
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_LOCK_COLLECTION_ID,
          lockId,
          {
            ticketId: ticketId,
          }
        );
      } catch (lockError) {
        console.error("Failed to create lock:", lockError);
        throw new Error("Could not reserve your ticket. Please try again.");
      }

      // Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = async () => {
        const options = {
          key: getRazorpayKey(),
          amount: parseFloat(totalAmount) * 100,
          currency: 'INR',
          name: event.name,
          description: `Booking for ${event.name}`,
          image: event.imageField,
          order_id: null,
          handler: async function (response) {
            try {
              // Payment success - create transaction record
              const transactionData = {
                userId,
                ticketId,
                paymentId: response.razorpay_payment_id,
                totalAmount: totalAmount.toString(),
                gateway: 'razorpay',
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              };

              // Save to transactions collection
              await createTransaction(transactionData);

              // Update ticket quantity in database
              await updateTicketQuantity(eventId, ticketCategory, quantity);

              // Create ticket document in tickets collection
              const ticketData = {
                userId,
                eventId,
                eventName: event.name,
                eventSub_name: event.tagline || '',
                eventDate: event.date,
                eventTime: event.time,
                eventLocation: event.location,
                totalAmountPaid: totalAmount.toString(),
                imageFileId: event.imageFileId,
                category: ticketCategory,
                quantity: quantity.toString(),
                pricePerTicket: currentTicket.price.toString(),
                isListedForSale: "false",
                checkedIn: "false"
              };

              // Create the ticket document
              await databases.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID,
                import.meta.env.VITE_APPWRITE_TICKETS_COLLECTION_ID,
                ID.unique(),
                ticketData
              );

              // Generate QR code data
              const qrData = JSON.stringify({
                ticketId,
                eventId,
                userId
              });

              // Generate QR code and upload to storage
              try {
                // Create canvas for QR code
                const canvas = document.createElement('canvas');

                // Generate QR code to canvas
                await QRCode.toCanvas(canvas, qrData, {
                  width: 256,
                  margin: 2,
                  color: {
                    dark: '#000000',
                    light: '#ffffff'
                  }
                });

                // Convert canvas to blob and upload
                await new Promise((resolve, reject) => {
                  canvas.toBlob(async (blob) => {
                    try {
                      await storage.createFile(
                        import.meta.env.VITE_APPWRITE_TICKET_QRs_BUCKET_ID,
                        ticketId,
                        blob
                      );
                      resolve();
                    } catch (error) {
                      reject(error);
                    }
                  }, 'image/png');
                });
              } catch (qrError) {
                console.error("QR Code generation failed:", qrError);
                // Continue even if QR code fails
              }

              // Create order record
              const orderData = {
                userId,
                ticketId,
                ticketName: currentTicket.name,
                eventId,
                transactionId,
                quantity: quantity.toString(),
                singleTicketPrice: currentTicket.price.toString(),
                subtotal,
                taxGST: gst,
                internetHandlingFee,
                totalAmount,
                name: user.name,
                ticketCategory,
                paymentStatus: 'completed',
                razorpayPaymentId: response.razorpay_payment_id
              };

              const order = await createOrder(orderData);

              // Delete the lock after successful booking
              try {
                await databases.deleteDocument(
                  import.meta.env.VITE_APPWRITE_DATABASE_ID,
                  import.meta.env.VITE_APPWRITE_LOCK_COLLECTION_ID,
                  lockId
                );
              } catch (deleteError) {
                console.error("Failed to delete lock:", deleteError);
              }

              navigate(`/booking-confirmation/${order.$id}`, {
                state: {
                  orderDetails: {
                    name: user.name,
                    selectedTicketType: currentTicket.name,
                    selectedQuantity: quantity,
                    singleTicketPrice: currentTicket.price,
                    ticketId: ticketId,
                    paymentId: response.razorpay_payment_id
                  },
                  eventDetails: {
                    name: event.name,
                    tagline: event.tagline,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    imageField: event.imageField
                  }
                }
              });
            } catch (error) {
              console.error("Post-payment processing failed:", error);
              try {
                await databases.deleteDocument(
                  import.meta.env.VITE_APPWRITE_DATABASE_ID,
                  import.meta.env.VITE_APPWRITE_LOCK_COLLECTION_ID,
                  lockId
                );
              } catch (deleteError) {
                console.error("Failed to delete lock:", deleteError);
              }
              alert("Booking completed but there was an issue with confirmation. Please check your orders.");
            }
          },
          prefill: {
            name: user.name,
            email: user.email || '',
            contact: user.phone || ''
          },
          theme: {
            color: '#3399cc'
          }
        };

        const rzp = new window.Razorpay(options);

        rzp.on('payment.failed', async function (response) {
          // Payment failed - create failed transaction record
          const transactionData = {
            userId,
            ticketId,
            paymentId: response.error.metadata.payment_id || 'none',
            totalAmount: totalAmount.toString(),
            gateway: 'razorpay',
            status: 'failed',
            error: response.error.description
          };

          await createTransaction(transactionData);

          // Delete the lock after failed payment
          try {
            await databases.deleteDocument(
              import.meta.env.VITE_APPWRITE_DATABASE_ID,
              import.meta.env.VITE_APPWRITE_LOCK_COLLECTION_ID,
              lockId
            );
          } catch (deleteError) {
            console.error("Failed to delete lock:", deleteError);
          }

          alert(`Payment failed: ${response.error.description}`);
        });

        rzp.open();
      };

      script.onerror = () => {
        databases.deleteDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_LOCK_COLLECTION_ID,
          lockId
        ).catch(console.error);
        throw new Error('Failed to load Razorpay script');
      };

    } catch (error) {
      console.error("Booking failed:", error);
      alert(`Booking failed: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-white text-center py-10">Loading...</div>;
  if (error) return <div className="text-white text-center py-10">Error: {error}</div>;
  if (!event) return <div className="text-white text-center py-10">Event not found</div>;

  return (
    <div className="bg-black">
      <div className="px-4 py-10 md:px-10 lg:px-20 xl:px-40">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          <div className="flex-1 flex justify-center my-4">
            <img
              src={event.imageField}
              alt={event.name || "Event Image"}
              className="w-full max-w-[463px] h-auto rounded-xl"
            />
          </div>
          <div className="flex-1 text-white">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{event.name}</h1>
            <h2 className="text-lg md:text-xl text-gray-400 mt-2">{event.tagline}</h2>
            <p className="text-sm md:text-base text-[#D5D5D5] mt-4 mb-5">{event.description}</p>

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <div className="flex-1 bg-[#18181B] p-4 rounded-lg">
                <span className="text-xl md:text-2xl font-semibold">
                  Tickets
                </span>
              </div>
              <div className="flex-1 bg-[#18181B] p-4 rounded-lg">
                <div className="space-y-3">
                  {ticketOptions.length > 0 ? (
                    ticketOptions.map((option) => (
                      <div
                        key={option.name}
                        className="flex items-center justify-between gap-2 bg-[#27272A] p-3 rounded-md cursor-pointer hover:bg-gray-700"
                        onClick={() => updateSelectedTicket(option)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="ticket"
                            className="accent-green-500"
                            checked={currentTicket?.name === option.name}
                            onChange={() => { }}
                            readOnly
                          />
                          <span>{option.display}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {option.available} available
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="bg-red-900/20 p-3 rounded-md text-center">
                      <span className="text-red-400">SOLD OUT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mt-6">
              {!isSoldOut && (
                <div className="flex items-center bg-[#18181B] text-white rounded-full px-4 py-2">
                  <button
                    className="text-xl cursor-pointer px-2"
                    onClick={decrement}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-lg mx-2">{quantity}</span>
                  <button
                    className="text-xl cursor-pointer px-2"
                    onClick={increment}
                    disabled={currentTicket && quantity >= ticketsAvailable[currentTicket.category]}
                  >
                    +
                  </button>
                </div>
              )}

              {userId ? (
                <button
                  onClick={handleBookNow}
                  disabled={bookingLoading || isSoldOut}
                  className={`bg-[#18181B] text-white w-full h-[37px] text-sm md:text-base font-semibold rounded-[25px] cursor-pointer ${bookingLoading ? 'opacity-50 cursor-not-allowed' : ''
                    } ${isSoldOut ? 'bg-red-900/50 text-red-400' : 'hover:bg-gray-700'
                    }`}
                >
                  {isSoldOut ? 'SOLD OUT' : bookingLoading ? 'Processing...' : 'Book Now'}
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login-signup', { state: { from: `/events/${eventId}` } })}
                  className="bg-[#18181B] text-white w-full h-[37px] text-sm md:text-base font-semibold rounded-[25px] cursor-pointer hover:bg-gray-700"
                >
                  Login to Book
                </button>
              )}

              <div className="flex gap-6 text-white text-2xl md:text-xl cursor-pointer">
                <FaHeart className="hover:text-red-500" />
                <FaShareAlt className="hover:text-gray-400" />
              </div>
            </div>

            <div className="bg-[#18181B] p-5 rounded-xl mt-8">
              <div
                className="flex justify-between items-center text-base py-2 cursor-pointer"
                onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
              >
                <span>Subtotal</span>
                <div className="flex items-center gap-2">
                  <span>INR {subtotal}</span>
                  {showPriceBreakdown ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                </div>
              </div>

              {showPriceBreakdown && (
                <div className="pl-4">
                  <div className="flex justify-between text-sm text-yellow-400 py-1">
                    <span>+ Tax & GST (5%)</span>
                    <span>INR {gst}</span>
                  </div>
                  <div className="flex justify-between text-sm text-yellow-400 py-1">
                    <span>+ Internet Handling Fee (5%)</span>
                    <span>INR {internetHandlingFee}</span>
                  </div>
                </div>
              )}

              <hr className="border-gray-700 my-2" />
              <div className="flex justify-between text-base font-semibold py-2">
                <span>Total Amount</span>
                <span>INR {totalAmount}</span>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl md:text-2xl font-semibold">Event Info</h3>
              <ul className="text-sm md:text-base text-gray-400 list-disc pl-6 space-y-2 mt-2">
                {event?.eventInfo?.split(",").map((item, index) => (
                  <li key={index}>{item.trim()}</li>
                )) || <p>Loading event info...</p>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black py-12 md:py-16 px-4 md:px-10 lg:px-20 mb-16">
        <div className="max-w-[1200px] mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
            Terms & Conditions
          </h3>
          <ul className="text-sm md:text-base text-gray-400 list-disc pl-6 space-y-3 md:space-y-4">
            {[
              "If you were denied entry, please email at bash@gmail.com",
              "In case of event cancellation, refunds will only be processed if payouts haven't been released.",
              "Bash is not responsible for intellectual property issues during performances.",
              "Tickets allow 'Single Entry Per Day' and are non-refundable.",
              "Attendees must carry a valid ID proof for age verification at the venue.",
              "The event organizers reserve the right to refuse entry without providing a reason.",
              "Outside food and beverages are strictly prohibited inside the venue.",
              "The event schedule and lineup are subject to change without prior notice."
            ].map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;