import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import TwoArrows from "../assets/TwoArrows.png";
import Arrows from "../assets/Arrows.png";
import Users from "../assets/Users.png";
import Map from "../assets/Map.png";
import DecorativeConcert from "../assets/DecorativeConcert.jpg";
import Transfer from "../assets/transfer.gif";
import Group from "../assets/group.gif";
import Sell from "../assets/sell.gif";
import { fetchEvents, storage, subscribeToEvents } from "../api/appwriteConfig";

const Home = () => {
  const sliderRef = useRef(null);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getEvents = async () => {
      const eventData = await fetchEvents();

      const updatedEvents = eventData.map((event) => {
        let imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/66dd97eb0009f68104ef/files/${event.imageFileId}/view?project=67699acf002ecc80c89f&mode=admin`;

        return { ...event, imageField: imageUrl };
      });

      setEvents(updatedEvents);
    };

    getEvents();
    const unsubscribe = subscribeToEvents(getEvents);
    return () => unsubscribe();
  }, []);

  const handleDiveInClick = () => {
    navigate("/events"); 
  };

  const handleEventClick = (eventId) => {
    navigate(`/event-details/${eventId}`);
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 200,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2500,
    cssEase: "ease-in-out",
    swipeToSlide: true,
    draggable: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "15%",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "10%",
        },
      },
    ],
  };

  return (
    <>
      <div className="overflow-x-hidden bg-black">
        {/* Heading Section */}
        <div className="flex flex-col items-center justify-center min-h-[190px]">
          <h1 className="text-white font-extrabold text-[40px] leading-[45px] tracking-[0.15em] sm:text-[55px] sm:leading-[60px] sm:tracking-[0.20em] md:text-[70px] md:leading-[69px] md:tracking-[0.24em] max-w-[885px] font-inter text-center">
            Snap Tickets, <br /> Share Moments
          </h1>
        </div>

        {/* Merged Section: "Dive In" + Features */}
        <div className="flex flex-col items-center justify-center gap-6 min-h-[500px]">
          {/* "Dive In" Button */}
          {/* Enhanced "Dive In" Button */}
          <div
            className="group w-[140px] h-[50px] sm:w-[165px] sm:h-[58px] rounded-full cursor-pointer flex items-center justify-center relative overflow-hidden transition-all duration-500 border border-white/34 hover:shadow-[0_0_25px_5px_rgba(255,255,255,0.4)]"
            onClick={handleDiveInClick}
          >
            {/* Hover Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#000FFF] to-[#FF008C] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />

            {/* Text Content */}
            <button className="relative z-10 text-white font-Karla text-[18px] sm:text-[22px] md:text-[24px] leading-[100%] tracking-[0.05em] transition-colors duration-500">
              Dive In
            </button>
          </div>

          {/* Feature Section */}
          <div className="text-white p-4 sm:p-10 w-full flex flex-col md:flex-row gap-8 md:gap-4 lg:gap-8 justify-center items-center">
            <div className="flex-1 flex flex-col items-center gap-3 text-center max-w-[350px]">
              <img
                src={TwoArrows}
                alt="TransferIcon"
                className="w-[35px] h-[45px] sm:w-[41.43px] sm:h-[53px]"
              />
              <h1 className="font-inter text-[28px] sm:text-[32px] md:text-[36px] leading-[35px] sm:leading-[39px] tracking-[0.07em]">
                Transfer Your Ticket
              </h1>
              <p className="text-sm sm:text-base">
                Can't make it to the show? Easily transfer your ticket to a
                friend and let them enjoy the event in your place.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-3 text-center max-w-[350px]">
              <img
                src={Arrows}
                alt="SellTicketIcon"
                className="w-[35px] h-[45px] sm:w-[41.43px] sm:h-[53px]"
              />
              <h1 className="font-inter text-[28px] sm:text-[32px] md:text-[36px] leading-[35px] sm:leading-[39px] tracking-[0.07em]">
                Sell Your Ticket
              </h1>
              <p className="text-sm sm:text-base">
                If plans change, sell your ticket directly through our platform,
                and find a new buyer quickly and securely.
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-3.5 text-center max-w-[350px]">
              <img
                src={Users}
                alt="UserIcon"
                className="w-[35px] h-[45px] sm:w-[41.43px] sm:h-[53px]"
              />
              <h1 className="font-inter text-[28px] sm:text-[32px] md:text-[36px] leading-[35px] sm:leading-[39px] tracking-[0.07em]">
                Group Bookings
              </h1>
              <p className="text-sm sm:text-base">
                Book with friends and keep track of everyone's plans.
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-screen w-full px-4 py-12 bg-black flex flex-col xl:flex-row items-center justify-center gap-10">
          {/* Map Image */}
          <img
            src={Map}
            alt="Map"
            className="w-[375px] h-[626px] rounded-[20px] object-cover"
          />

          {/* Text Content */}
          <div className="flex flex-col items-end justify-center text-white">
            {/* Title */}
            <h2
              className="font-anton text-[64px] leading-[112.9999999999999%] tracking-[0.18em] text-right"
              style={{ width: '355px', height: '360px', top: '838px', left: '429px' }}
            >
              Discover<br />
              Concerts<br />
              Tailored<br />
              Just for<br />
              You!
            </h2>

            {/* Description */}
            <p
              className="font-Cantarell  text-[20px] leading-[171%] tracking-[-1%] text-right mt-4"
              style={{
                width: '378px',
                height: '124px',
                backgroundColor: '#000', // Keep black background for visibility on black section
              }}
            >
              Connect your Spotify account, and<br />
              receive concert recommendations<br />
              based on the artists you listen<br />
              to the most.
            </p>
          </div>


          {/* Concert Image */}
          <img
            src={DecorativeConcert}
            alt="Concert illustration"
            className="w-[375px] h-[626px] rounded-[20px] object-cover"
          />
        </div>


        {/* Trending Events Section with Carousel */}
        <div className="w-full px-4 md:px-12 py-8">
          <h1 className="text-white font-inter font-[400] text-[24px] leading-[38px] tracking-[0.17em] sm:text-[28px] sm:leading-[30px] md:text-[32px] md:leading-[32px] mb-6 pl-4 sm:pl-8 md:pl-12">
            Trending Events:
          </h1>

          <div className="px-2 sm:px-4 md:px-8">
            <Slider {...carouselSettings}>
              {events.length > 0 ? (
                events.map((event, index) => (
                  <div
                    key={index}
                    className="px-2 sm:px-4 focus:outline-none cursor-pointer"
                    onClick={() => handleEventClick(event.$id)}
                  >
                    <div className="w-full max-w-[280px] sm:max-w-[335px] mx-auto bg-[#1a1a1a] text-white rounded-lg shadow-lg overflow-hidden">
                      <div className="aspect-w-4 aspect-h-3">
                        <img
                          src={event.imageField}
                          alt={event.name}
                          className="w-full h-[200px] sm:h-[250px] object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-2 min-h-[120px] flex flex-col justify-center">
                        <h3 className="text-lg font-semibold line-clamp-1">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Date: {event.date || "Not Available"}
                        </p>
                        <p className="text-md text-white">
                          Rs. {event.price || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-white text-xl sm:text-2xl">
                    No Trending Events Available
                  </h2>
                </div>
              )}
            </Slider>
          </div>
        </div>

        {/* Transfer Ticket Section */}
        <div className="w-full flex flex-col justify-center items-center gap-8 md:flex-row md:justify-between md:items-center py-8 px-4 md:px-8 lg:px-12">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-6 md:pl-8 lg:pl-12">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center md:text-left">
              Last-minute change? <br /> No problem! <br /> Easily transfer your{" "}
              <br /> ticket to a friend!
            </h1>
            <button className="bg-white w-36 text-xl md:text-2xl text-black font-medium rounded-full shadow-md py-2 hover:bg-gray-200 transition h-12">
              Explore
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={Transfer}
              alt="Transfer"
              className="w-full max-w-md md:max-w-lg lg:max-w-xl rounded-[20px]"
            />
          </div>
        </div>

        {/* Sell Ticket Section */}
        <div className="w-full flex flex-col-reverse md:flex-row justify-center items-center gap-8 md:gap-12 px-4 md:px-8 lg:px-12 py-8">
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={Sell}
              alt="Sell"
              className="w-full max-w-md md:max-w-lg lg:max-w-xl"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-6 md:pr-8 lg:pr-12">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center md:text-left">
              Need to sell your ticket? <br /> Our platform makes it <br />{" "}
              quick and secure!
            </h1>
            <button className="bg-white w-36 text-xl md:text-2xl text-black font-medium rounded-full shadow-md py-2 hover:bg-gray-200 transition h-12">
              Explore
            </button>
          </div>
        </div>

        {/* Group Booking Section */}
        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 px-4 md:px-8 lg:px-12 py-8 pb-16">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-6 md:pl-8 lg:pl-12">
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center md:text-left">
              Book with friends <br /> and enjoy events <br /> together!
            </h1>
            <button className="bg-white w-36 text-xl md:text-2xl text-black font-medium rounded-full shadow-md py-2 hover:bg-gray-200 transition h-12">
              Explore
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={Group}
              alt="Group"
              className="w-full max-w-md md:max-w-lg lg:max-w-xl"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;