import fs from "fs";
import path from "path";

const CACHE_FILE = path.resolve("./src/cache/auto-bid-cache.json");

// 🧠 Helper: read the JSON file
const readCache = () => {
  try {
    if (!fs.existsSync(CACHE_FILE)) {
      fs.writeFileSync(CACHE_FILE, JSON.stringify([])); // initialize empty
    }
    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading cache file:", err);
    return [];
  }
};

// 🧠 Helper: write back to JSON file
const writeCache = (data) => {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing cache file:", err);
  }
};

// ➕ Insert user
export const insertAutoBidCache = async (subuser) => {
  const autobidUsers = readCache();
  const exists = autobidUsers.some(u => u.sub_user_id === subuser.sub_user_id);
  if (!exists) {
    autobidUsers.push(subuser);
    writeCache(autobidUsers);
  }
};

// 🗑️ Delete user
export const deleteAutoBidUserCache = async (sub_user_id) => {
  const autobidUsers = readCache();
  const updated = autobidUsers.filter(u => u.sub_user_id !== sub_user_id);
  writeCache(updated);
};

// 🔄 Update user
export const updateAutoBidUserCache = async (updatedUser) => {
  const autobidUsers = readCache();
  const index = autobidUsers.findIndex(u => u.sub_user_id === updatedUser.sub_user_id);

  if (index !== -1) {
    autobidUsers[index] = { ...autobidUsers[index], ...updatedUser };
  } else {
    autobidUsers.push(updatedUser); // optional insert if not found
  }

  writeCache(autobidUsers);
};

// 📦 Get all users
export const getAllAutoBidUsersCache = async () => {
  return readCache();
};
