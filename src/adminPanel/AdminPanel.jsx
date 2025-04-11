import { useState, useEffect } from "react";
import EventList from "../pages/EventList.jsx";
import { Client, Databases, ID, Storage } from "appwrite";
import { isAdmin } from "./authHelper.jsx";

const AdminPanel = () => {
     const [showEventList, setShowEventList] = useState(false);
     const [editingIndex, setEditingIndex] = useState(null);
     const [events, setEvents] = useState([]);
     const [loading, setLoading] = useState(false);
     const [admin, setAdmin] = useState(false);
     const [phases, setPhases] = useState([]);
     const [categories, setCategories] = useState({
          "General Admission": { price: "", quantity: "", selected: false },
          "VIP": { price: "", quantity: "", selected: false },
          "VVIP": { price: "", quantity: "", selected: false }
     });
     const [allCategories, setAllCategories] = useState([]);

     useEffect(() => {
          isAdmin().then((res) => {
               console.log("Admin Status:", res);
               setAdmin(res);
          });
     }, []);

     const client = new Client()
          .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
          .setProject(import.meta.env.VITE_APPWRITE_PROJECT);

     const databases = new Databases(client);
     const storage = new Storage(client);

     const [eventData, setEventData] = useState({
          name: "",
          price: "",
          eventInfo: "",
          location: "",
          organiserId: "",
          tags: "",
          totalTickets: "",
          ticketsLeft: "",
          image: null,
          existingImage: null,
          date: "",
          time: ""
     });

     useEffect(() => {
          fetchEvents();
     }, []);

     const fetchEvents = async () => {
          setLoading(true);
          try {
               const response = await databases.listDocuments(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    import.meta.env.VITE_APPWRITE_COLLECTION_ID
               );

               const eventsWithPhasesAndCategories = response.documents.map(event => {
                    // Preserve the original categories array
                    const originalCategories = Array.isArray(event.categories)
                         ? event.categories
                         : [];

                    // Initialize form categories (will be populated when editing)
                    const formCategories = {
                         "General Admission": { price: "", quantity: "", selected: false },
                         "VIP": { price: "", quantity: "", selected: false },
                         "VVIP": { price: "", quantity: "", selected: false }
                    };

                    return {
                         ...event,
                         categories: originalCategories, // Preserve all original categories
                         formCategories, // For form display
                         phase: event.phase || []
                    };
               });

               setEvents(eventsWithPhasesAndCategories);
          } catch (error) {
               console.error("Error fetching events:", error);
          } finally {
               setLoading(false);
          }
     };

     const handleCategoryChange = (category) => {
          setCategories(prev => ({
               ...prev,
               [category]: {
                    ...prev[category],
                    selected: !prev[category]?.selected
               }
          }));
     };

     const handleCategoryFieldChange = (category, field, value) => {
          setCategories(prev => ({
               ...prev,
               [category]: {
                    ...prev[category],
                    [field]: value
               }
          }));
     };

     // In the addPhase function
     const addPhase = () => {
          // Reset categories when adding a new phase
          setCategories({
               "General Admission": { price: "", quantity: "", selected: false },
               "VIP": { price: "", quantity: "", selected: false },
               "VVIP": { price: "", quantity: "", selected: false }
          });

          const newPhase = { name: "", startDate: "", endDate: "" };

          // If there are existing phases, set the new phase's start date to the previous phase's end date
          if (phases.length > 0) {
               const lastPhase = phases[phases.length - 1];
               newPhase.startDate = lastPhase.endDate || "";
          }

          // Ensure that new phases are added properly to avoid removing data from the previous phases
          setPhases([...phases, newPhase]);
     };

     // In handlePhaseChange, ensure categories and phases are updated correctly
     const handlePhaseChange = (index, field, value) => {
          const newPhases = [...phases];
          newPhases[index] = {
               ...newPhases[index],
               [field]: value
          };

          // If we're updating the name of a phase, reset categories
          if (field === 'name') {
               setCategories({
                    "General Admission": { price: "", quantity: "", selected: false },
                    "VIP": { price: "", quantity: "", selected: false },
                    "VVIP": { price: "", quantity: "", selected: false }
               });
          }

          // If we're updating the end date of a phase, ensure the start date for the next phase is set correctly
          if (field === 'endDate' && index < newPhases.length - 1) {
               newPhases[index + 1] = {
                    ...newPhases[index + 1],
                    startDate: value
               };
          }

          setPhases(newPhases);
     };

     // When editing an existing event, you must carefully load all the phase data without losing existing data
     const handleEdit = (index) => {
          const eventToEdit = events[index];

          // Start with default empty categories
          const updatedCategories = {
               "General Admission": { price: "", quantity: "", selected: false },
               "VIP": { price: "", quantity: "", selected: false },
               "VVIP": { price: "", quantity: "", selected: false }
          };

          // Get all phases
          const loadedPhases = eventToEdit.phase?.map(p => {
               if (typeof p === 'string') {
                    const [name, startDate, endDate] = p.split(":");
                    return { name, startDate, endDate };
               }
               return { name: p, startDate: "", endDate: "" };
          }) || [];

          // Set the loaded phases and categories correctly
          setCategories(updatedCategories);
          setPhases(loadedPhases);

          // Store all categories in a ref or state to use during submission
          setAllCategories(eventToEdit.categories || []);

          setEventData({
               ...eventData,
               ...eventToEdit,
               existingImage: eventToEdit.imageField,
               image: null
          });
          setEditingIndex(index);
          setShowEventList(false);
     };

     const handleDelete = async (eventId) => {
          if (window.confirm("Are you sure you want to delete this event?")) {
               setLoading(true);
               try {
                    await databases.deleteDocument(
                         import.meta.env.VITE_APPWRITE_DATABASE_ID,
                         import.meta.env.VITE_APPWRITE_COLLECTION_ID,
                         eventId
                    );
                    alert("Event Deleted Successfully!");
                    await fetchEvents();
               } catch (error) {
                    console.error("Error deleting event:", error);
                    alert(`Error deleting event: ${error.message}`);
               } finally {
                    setLoading(false);
               }
          }
     };

     const formatTime = (time) => {
          const [hours, minutes] = time.split(":");
          const formattedHours = (hours % 12) || 12;
          const ampm = hours >= 12 ? "PM" : "AM";
          return `${formattedHours}:${minutes} ${ampm}`;
     };


     // Update the handleSubmit function to properly format phases and categories
     const handleSubmit = async (e) => {
          e.preventDefault();

          if (!eventData.name.trim() ||
               !eventData.organiserId.trim() ||
               !eventData.date || !eventData.time) {
               alert("All required fields must be filled!");
               return;
          }

          setLoading(true);

          try {
               let imageFileId = null;
               let imageUrl = eventData.existingImage;

               if (eventData.image) {
                    imageFileId = ID.unique();
                    await storage.createFile(
                         import.meta.env.VITE_APPWRITE_BUCKET_ID,
                         imageFileId,
                         eventData.image,
                    );
                    imageUrl = storage.getFilePreview(
                         import.meta.env.VITE_APPWRITE_BUCKET_ID,
                         imageFileId
                    ).href;
               }

               // Process phases - ensure proper formatting
               const formatToCustomReadable = (dateStr) => {
                    const parsed = new Date(dateStr);
                    const options = { month: 'long', day: 'numeric', year: 'numeric' };
                    return !isNaN(parsed) ? parsed.toLocaleDateString('en-US', options) : "";
               };

               const processedPhases = phases
                    .filter(p => p.name && p.name.trim() !== "")
                    .map((phase, index) => {
                         const startDate = index === 0 && !phase.startDate
                              ? eventData.date
                              : phase.startDate || "";

                         const adjustedStartDate = index > 0 && !phase.startDate && phases[index - 1].endDate
                              ? phases[index - 1].endDate
                              : startDate;

                         const readableStart = formatToCustomReadable(adjustedStartDate);
                         const readableEnd = phase.endDate ? formatToCustomReadable(phase.endDate) : "";

                         return `${phase.name.trim()}: ${readableStart}:${readableEnd}`;
                    });




               // Get current phase name
               const currentPhase = processedPhases.length > 0
                    ? processedPhases[processedPhases.length - 1].split(":")[0].trim()
                    : "";

               // Format NEW categories for current phase
               const newCategories = Object.entries(categories)
                    .filter(([_, data]) => data.selected)
                    .map(([name, data]) =>
                         `${name.trim()}:${data.price}:${data.quantity}${currentPhase ? `:${currentPhase}` : ''}`
                    );

               // Combine with existing categories from other phases
               let allCategoriesCombined = [];

               if (editingIndex !== null) {
                    // For edits, preserve existing categories from other phases
                    const existingCategories = events[editingIndex].categories || [];
                    allCategoriesCombined = [
                         ...existingCategories.filter(cat => {
                              // Keep categories that don't belong to current phase
                              const parts = cat.split(':');
                              return parts.length < 4 || parts[3] !== currentPhase;
                         }),
                         ...newCategories
                    ];
               } else {
                    // For new events, just use the new categories
                    allCategoriesCombined = newCategories;
               }

               const eventPayload = {
                    name: eventData.name,
                    price: eventData.price.toString(),
                    eventInfo: eventData.eventInfo,
                    categories: allCategoriesCombined,
                    location: eventData.location,
                    organiserId: eventData.organiserId.toString(),
                    tags: Array.isArray(eventData.tags)
                         ? eventData.tags
                         : eventData.tags.split(",").map(tag => tag.trim()),
                    totalTickets: Object.entries(categories)
                         .filter(([_, data]) => data.selected)
                         .reduce((sum, [_, data]) => {
                              const qty = parseInt(data.quantity) || 0;
                              return sum + qty;
                         }, 0).toString(), // Calculate total tickets from categories
                    ticketsLeft: "0", // Will be updated by your system
                    phase: processedPhases,
                    imageField: imageUrl,
                    imageFileId,
                    date: eventData.date,
                    time: formatTime(eventData.time)
               };

               if (editingIndex !== null) {
                    await databases.updateDocument(
                         import.meta.env.VITE_APPWRITE_DATABASE_ID,
                         import.meta.env.VITE_APPWRITE_COLLECTION_ID,
                         events[editingIndex].$id,
                         eventPayload
                    );
                    alert("Event Updated Successfully!");
               } else {
                    await databases.createDocument(
                         import.meta.env.VITE_APPWRITE_DATABASE_ID,
                         import.meta.env.VITE_APPWRITE_COLLECTION_ID,
                         ID.unique(),
                         eventPayload
                    );
                    alert("Event Added Successfully!");
               }


               await fetchEvents();
               setShowEventList(true);
               setEditingIndex(null); // Reset editing state
               setEventData({
                    name: "",
                    price: "",
                    eventInfo: "",
                    location: "",
                    organiserId: "",
                    tags: "",
                    totalTickets: "",
                    ticketsLeft: "",
                    image: null,
                    existingImage: null,
                    date: "",
                    time: ""
               });
               setCategories({
                    "General Admission": { price: "", quantity: "", selected: false },
                    "VIP": { price: "", quantity: "", selected: false },
                    "VVIP": { price: "", quantity: "", selected: false }
               });
               setPhases([]);
          } catch (error) {
               console.error("Error saving event:", error);
               alert(`Error saving event: ${error.message}`);
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="flex flex-col md:flex-row min-h-screen bg-gray-900">
               {/* Sidebar */}
               <aside className="w-full md:w-1/4 bg-gray-800 p-4 md:p-5">
                    <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-4">
                         {admin && (
                              <button
                                   onClick={() => { setShowEventList(false); }}
                                   className="w-full md:w-full bg-blue-500 hover:bg-blue-600 text-white p-2 md:p-3 rounded-md"
                              >
                                   {editingIndex !== null ? "Edit Event" : "Add Event"}
                              </button>
                         )}
                         <button
                              onClick={() => setShowEventList(true)}
                              className="w-full md:w-full bg-green-500 hover:bg-green-600 text-white p-2 md:p-3 rounded-md"
                         >
                              Event List
                         </button>
                    </div>
               </aside>

               {/* Main Content */}
               <div className="w-full md:w-3/4 p-4 md:p-5">
                    {loading ? (
                         <div className="flex justify-center items-center h-full">
                              <div className="text-white text-xl">Loading...</div>
                         </div>
                    ) : showEventList ? (
                         <EventList events={events} onEdit={handleEdit} onDelete={handleDelete} />
                    ) : (
                         <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   {Object.keys(eventData).map((key, index) => (
                                        key !== "image" && key !== "existingImage" && (
                                             <div key={index} className="bg-gray-700 p-3 rounded-md">
                                                  <label className="block text-gray-300 text-sm mb-1 capitalize">{key}</label>
                                                  <input
                                                       type={key === "date" ? "date" : key === "time" ? "time" : "text"}
                                                       placeholder={key}
                                                       value={eventData[key]}
                                                       onChange={(e) => setEventData({ ...eventData, [key]: e.target.value })}
                                                       className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                                                       required={["name", "price", "organiserId", "totalTickets", "date", "time"].includes(key)}
                                                  />
                                             </div>
                                        )
                                   ))}
                              </div>

                              {/* Phases Section */}
                              <div className="mt-4 bg-gray-700 p-3 rounded-md">
                                   <label className="block text-gray-300 text-sm mb-1">Event Phases</label>
                                   <button type="button" onClick={addPhase} className="bg-blue-500 text-white p-2 rounded-md">Add Phase</button>
                                   <div className="mt-2 space-y-2">
                                        {phases.map((phase, index) => (
                                             <div key={index} className="bg-gray-600 p-4 rounded-md space-y-2">
                                                  <input
                                                       type="text"
                                                       value={phase.name || ""}
                                                       onChange={(e) => handlePhaseChange(index, 'name', e.target.value)}
                                                       placeholder={`Phase ${index + 1} Name`}
                                                       className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                                                  />
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                       <div>
                                                            <label className="block text-gray-300 text-sm mb-1">Start Date</label>
                                                            <input
                                                                 type="date"
                                                                 value={phase.startDate || ""}
                                                                 onChange={(e) => handlePhaseChange(index, 'startDate', e.target.value)}
                                                                 className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                                                                 disabled={index > 0} // Start date is auto-set for phases after the first one
                                                            />
                                                       </div>
                                                       <div>
                                                            <label className="block text-gray-300 text-sm mb-1">End Date</label>
                                                            <input
                                                                 type="date"
                                                                 value={phase.endDate || ""}
                                                                 onChange={(e) => handlePhaseChange(index, 'endDate', e.target.value)}
                                                                 className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                                                            />
                                                       </div>
                                                  </div>
                                             </div>
                                        ))}
                                   </div>
                              </div>

                              {/* Categories Selection */}
                              <div className="mt-4 bg-gray-700 p-3 rounded-md">
                                   <label className="block text-gray-300 text-sm mb-1">Select Categories</label>
                                   <div className="space-y-4">
                                        {Object.entries(categories).map(([category, data]) => (
                                             <div key={category} className="bg-gray-600 p-3 rounded-md">
                                                  <div className="flex items-center mb-2">
                                                       <input
                                                            type="checkbox"
                                                            id={`category-${category}`}
                                                            checked={data.selected || false}
                                                            onChange={() => handleCategoryChange(category)}
                                                            className="mr-2"
                                                       />
                                                       <label htmlFor={`category-${category}`} className="text-gray-300">{category}</label>
                                                  </div>
                                                  {data.selected && (
                                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                                            <div>
                                                                 <label className="block text-gray-300 text-sm mb-1">Price</label>
                                                                 <input
                                                                      type="text"
                                                                      value={data.price}
                                                                      onChange={(e) => handleCategoryFieldChange(category, "price", e.target.value)}
                                                                      placeholder="Price"
                                                                      className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                                                                 />
                                                            </div>
                                                            <div>
                                                                 <label className="block text-gray-300 text-sm mb-1">Quantity</label>
                                                                 <input
                                                                      type="text"
                                                                      value={data.quantity}
                                                                      onChange={(e) => handleCategoryFieldChange(category, "quantity", e.target.value)}
                                                                      placeholder="Quantity"
                                                                      className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                                                                 />
                                                            </div>
                                                       </div>
                                                  )}
                                             </div>
                                        ))}
                                   </div>
                              </div>

                              {/* Image Upload Section */}
                              <div className="mt-4 bg-gray-700 p-3 rounded-md">
                                   <label className="block text-gray-300 text-sm mb-1">Upload Image</label>
                                   <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEventData({ ...eventData, image: e.target.files[0] })}
                                        className="w-full p-2 bg-gray-800 text-white rounded-md border border-gray-600"
                                   />
                                   {eventData.existingImage && (
                                        <div className="mt-3">
                                             <p className="text-gray-300 text-sm mb-1">Current Image:</p>
                                             <img
                                                  src={eventData.existingImage}
                                                  alt="Event"
                                                  className="max-h-32 rounded-md"
                                             />
                                        </div>
                                   )}
                              </div>

                              {/* Submit Button */}
                              <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                   <button
                                        type="submit"
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 sm:p-3 rounded-md w-full"
                                        disabled={loading}
                                   >
                                        {loading ? "Processing..." : editingIndex !== null ? "Update Event" : "Add Event"}
                                   </button>
                              </div>
                         </form>
                    )}
               </div>
          </div>
     );
};

export default AdminPanel;