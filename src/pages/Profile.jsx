import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiEdit, FiSave, FiX, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { storage, databases } from "../api/appwriteConfig";
import { ID } from "appwrite";

const Profile = () => {
     const { user, updateUser } = useAuth();
     const [editMode, setEditMode] = useState(false);
     const [userDetails, setUserDetails] = useState({
          name: "",
          email: "",
          profilePicUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200", // Default image
          qrimageId: "",
     });

     useEffect(() => {
          if (user) {
               setUserDetails({
                    name: user?.name || "John Doe",
                    email: user?.email || "johndoe@example.com",
                    profilePicUrl: user?.profilePicUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
                    qrimageId: user?.qrimageId || "",
               });
          }
     }, [user]);

     const handleInputChange = (e) => {
          setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
     };

     const handleImageUpload = async (e) => {
          const file = e.target.files[0];
          if (file) {
              try {
                  const fileId = ID.unique();
                  const uploadedFile = await storage.createFile(
                      import.meta.env.VITE_APPWRITE_USER_PROFILE_BUCKET_ID,
                      fileId,
                      file
                  );
      
                  const fileUrl = await storage.getFilePreview(
                      import.meta.env.VITE_APPWRITE_USER_PROFILE_BUCKET_ID,
                      uploadedFile.$id
                  );
      
                  console.log("File uploaded successfully:", fileUrl);
      
                  // Update profilePicUrl in Appwrite database
                  await databases.updateDocument(
                      import.meta.env.VITE_APPWRITE_DATABASE_ID,
                      import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
                      user.$id,
                      { profilePicUrl: fileUrl }
                  );
      
                  // 🟢 updateUser() se AuthContext me user state ko update karein
                  updateUser({ profilePicUrl: fileUrl });
      
                  alert("Profile picture updated successfully!");
              } catch (error) {
                  console.error("Error uploading image:", error.message);
              }
          }
      };

     const handleSave = async () => {
          try {
               await databases.updateDocument(
                    import.meta.env.VITE_APPWRITE_DATABASE_ID,
                    "users",
                    user.$id,
                    {
                         name: userDetails.name,
                         profilePicUrl: userDetails.profilePicUrl,
                    }
               );
               setEditMode(false);
               alert("Profile updated successfully!");
          } catch (error) {
               console.error("Error updating profile:", error.message);
          }
     };

     if (!user) {
          return (
               <div className="min-h-screen bg-black flex items-center justify-center p-4">
                    <div className="max-w-4xl w-full bg-black rounded-xl shadow-2xl overflow-hidden p-6 text-center">
                         <p className="text-white">Loading profile...</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="min-h-screen bg-black flex items-center justify-center p-4">
               <div className="max-w-4xl w-full bg-black rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-gray-800 px-6 py-4 flex justify-between items-center border-b border-gray-700">
                         <Link to="/" className="flex items-center text-gray-400 hover:text-gray-300">
                              <FiArrowLeft className="mr-2" /> Back to Home
                         </Link>
                         <button
                              onClick={() => setEditMode(!editMode)}
                              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${editMode
                                   ? "bg-gray-700 hover:bg-gray-600 text-white"
                                   : "bg-gray-400 hover:bg-gray-300 text-black"
                                   }`}
                         >
                              {editMode ? (
                                   <>
                                        <FiX className="mr-2" /> Cancel
                                   </>
                              ) : (
                                   <>
                                        <FiEdit className="mr-2" /> Edit Profile
                                   </>
                              )}
                         </button>
                    </div>

                    <div className="p-6 md:p-8">
                         <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                              <div className="relative group">
                                   <img
                                        src={userDetails.profilePicUrl}
                                        alt="profile"
                                        className="h-32 w-32 rounded-full border-4 border-gray-400 object-cover shadow-lg"
                                   />
                                   {editMode && (
                                        <label
                                             htmlFor="profile-upload"
                                             className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                             <span className="text-white text-sm font-medium">Change Photo</span>
                                             <input
                                                  type="file"
                                                  id="profile-upload"
                                                  className="hidden"
                                                  accept="image/*"
                                                  onChange={handleImageUpload}
                                             />
                                        </label>
                                   )}
                              </div>

                              <div className="flex-1 text-center md:text-left">
                                   {editMode ? (
                                        <input
                                             type="text"
                                             name="name"
                                             value={userDetails.name}
                                             onChange={handleInputChange}
                                             className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                        />
                                   ) : (
                                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{userDetails.name}</h1>
                                   )}
                              </div>
                         </div>
                         <div className="space-y-4">
                              <div className="flex items-center">
                                   <span className="text-gray-400">{userDetails.email}</span>
                              </div>
                         </div>
                         {editMode && (
                              <div className="mt-8">
                                   <button onClick={handleSave} className="w-full md:w-auto bg-gray-400 hover:bg-gray-300 text-black px-6 py-3 rounded-lg shadow-lg transition-colors">
                                        <FiSave className="mr-2" /> Save Changes
                                   </button>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
};

export default Profile;
