import { useState, useEffect } from "react";
import { FaHeart, FaShareAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { fetchEvents, storage, subscribeToEvents } from "../api/appwriteConfig";

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getEvents = async () => {
      const eventData = await fetchEvents();
      const updatedEvents = eventData.map((event) => {
        let imageUrl = `https://cloud.appwrite.io/v1/storage/buckets/66dd97eb0009f68104ef/files/${event.imageFileId}/view?project=67699acf002ecc80c89f`;

        return { ...event, imageField: imageUrl };
      });
      setEvents(updatedEvents);
    };

    getEvents();
    const unsubscribe = subscribeToEvents(getEvents);
    return () => unsubscribe();
  }, []);


  const truncateText = (text) => {
    const sentences = text.split(".").filter(sentence => sentence.trim() !== "");
    return sentences.length > 2 ? sentences.slice(0, 2).join(". ") + "..." : text;
  };

  return (
    <div className="bg-black min-h-screen p-6">
      {events.length === 0 ? (
        <h2 className="text-white text-center text-2xl">No Events Available</h2>
      ) : (
        events.map((event) => (
          <div key={event.$id} className="min-h-[550px] bg-black flex flex-wrap md:flex-nowrap items-start justify-center gap-20 px-6 md:px-12 lg:px-16 py-8">
            <img
              src={event.imageField}
              alt="Event Image"
              className="w-full max-w-[463px] h-auto rounded-lg shadow-lg"
            />

            <div className="flex flex-col gap-4 w-full max-w-[655px] text-center md:text-left self-start">
              <h1 className="text-[30px] md:text-[50px] text-white font-bold">{event.name}</h1>
              {event.sub_name && (
                <h2 className="text-[20px] md:text-[30px] text-[#09FF67] font-semibold">
                  {event.sub_name}
                </h2>
              )}
              <p className="text-[16px] md:text-[20px] lg:text-[30px] text-[#D5D5D5] leading-relaxed">
                {truncateText(event.eventInfo)}
              </p>
              <h1 className="text-[25px] md:text-[45px] text-white font-semibold">
                FROM: <span className="text-[#09FF67]">Rs. {event.price}</span>
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6">
                <Link to={`/event-details/${event.$id}`}>
                  <button className="bg-white text-black px-6 md:px-8 h-[45px] text-[18px] md:text-[20px] font-semibold rounded-[20px] cursor-pointer shadow-md hover:bg-gray-200 transition">
                    Buy Now
                  </button>
                </Link>
                <div className="flex gap-6 text-white text-[30px] md:text-[35px] cursor-pointer">
                  <FaHeart className="hover:text-red-500 transition" />
                  <FaShareAlt className="hover:text-gray-400 transition" />
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  ); 
};

export default Events;