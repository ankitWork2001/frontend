import { createContext, useContext, useState, useEffect } from "react";
import { account, databases, storage } from "../api/appwriteConfig";
import { ID, Query } from "appwrite";
import { generateDefaultQR } from "../utils/generateDefaultQR";

const AuthContext = createContext();

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const PROFILE_BUCKET_ID = import.meta.env.VITE_APPWRITE_PROFILE_BUCKET_ID;
const QR_BUCKET_ID = import.meta.env.VITE_APPWRITE_QR_BUCKET_ID;

export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);

     const updateUser = (newUserData) => {
          setUser((prevUser) => ({
               ...prevUser,
               ...newUserData,
          }));
     };

     const createUserDocument = async (user, profilePicFile) => {
          try {
               if (!user || !user.$id) throw new Error("User ID is missing");

               const existingUser = await databases.listDocuments(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    [Query.equal("userID", user.$id)]
               );
               if (existingUser.documents.length > 0) {
                    return existingUser.documents[0];
               }

               const qrBlob = await generateDefaultQR(user.$id);
               if (!qrBlob || !(qrBlob instanceof Blob)) throw new Error("Invalid QR Code Blob");

               const qrFile = new File([qrBlob], `${user.$id}_qr.png`, { type: "image/png" });
               const qrFileResponse = await storage.createFile(QR_BUCKET_ID, ID.unique(), qrFile);

               let profilePicUrl = "";
               if (profilePicFile) {
                    const profilePicResponse = await storage.createFile(PROFILE_BUCKET_ID, ID.unique(), profilePicFile);
                    profilePicUrl = storage.getFilePreview(PROFILE_BUCKET_ID, profilePicResponse.$id)
               }
               // create user document with profile pic url 
               const userDoc = await databases.createDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    ID.unique(),
                    {
                         userID: user.$id,
                         name: user.name || "Unnamed User",
                         email: user.email || "No Email",
                         qrimageId: qrFileResponse.$id,
                         profilePicUrl,
                         role: "user", // Default role
                    }
               );

               return userDoc;
          } catch (error) {
               console.error("Error creating user document:", error);
          }
     };

     useEffect(() => {
          let isMounted = true; // Prevents updating state after unmounting

          const checkUser = async () => {
               try {
                    const user = await account.get();

                    // ✅ Check if user document already exists
                    const userDoc = await databases.listDocuments(
                         DATABASE_ID,
                         USERS_COLLECTION_ID,
                         [Query.equal("userID", user.$id)]
                    );

                    let userData = userDoc.documents.length > 0 ? userDoc.documents[0] : null;

                    if (!userData) {
                         userData = await createUserDocument(user);

                         if (!userData) {
                              console.error("🚨 Failed to create user document.");
                              return;
                         }
                    } else {
                    }

                    if (isMounted) {
                         setUser(userData);
                    }
               } catch (error) {
                    console.error("❌ Error getting user:", error);
                    if (isMounted) setUser(null);
               } finally {
                    if (isMounted) setLoading(false);
               }
          };

          checkUser();

          return () => {
               isMounted = false; // Prevent state updates if component unmounts
          };
     }, []);


     const register = async (email, password, name = "", profilePicFile = null) => {
          try {
               const newUser = await account.create(ID.unique(), email, password, name || email.split("@")[0]);
               const userDoc = await createUserDocument(newUser, profilePicFile);
               await login(email, password);
               return { ...newUser, ...userDoc };
          } catch (error) {
               console.error("Registration Error:", error);
               throw error;
          }
     };

     const login = async (email, password) => {
          try {
               // 🛑 Ensure no previous session exists
               try {
                    await account.deleteSessions();
               } catch (sessionError) {
                    console.warn("No active session to delete:", sessionError);
               }

               // ✅ Create new login session
               await account.createEmailPasswordSession(email, password);

               // ✅ Get logged-in user details
               const currentUser = await account.get();

               // ✅ Check if user document exists in the database
               const userDoc = await databases.listDocuments(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    [Query.equal("userID", currentUser.$id)]
               );

               // ✅ If user document exists, use it; otherwise, create a new one
               let userData = userDoc.documents.length > 0 ? userDoc.documents[0] : await createUserDocument(currentUser);

               // ✅ Update state
               setUser(userData);
          } catch (error) {
               console.error("Login Error:", error);
               throw error;
          }
     };


     const logout = async () => {
          try {
               await account.deleteSessions();
               setUser(null);
          } catch (error) {
               console.error("Logout Error:", error);
               throw error;
          }
     };

     return (
          <AuthContext.Provider value={{ user, register, login, logout, loading, updateUser }}>
               {children}
          </AuthContext.Provider>
     );
};

export const useAuth = () => useContext(AuthContext);
