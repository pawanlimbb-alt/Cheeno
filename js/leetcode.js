// js/leetcode.js
// Utility for fetching LeetCode profile statistics and ranking data

import { db } from "./firebase.js";
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

/**
 * Fetch LeetCode statistics for a given username.
 * Uses alfa-leetcode-api with fallback error handling.
 * @param {string} username - LeetCode username
 * @returns {Promise<Object>} Formatted LeetCode statistics
 */
export async function fetchLeetCodeStats(username) {
  const cleanUsername = (username || '').trim().replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/, '').replace(/\/$/, '');
  
  if (!cleanUsername) {
    throw new Error("Please provide a valid LeetCode username.");
  }

  const apiUrl = `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(cleanUsername)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`LeetCode API returned status ${res.status}`);
    }

    const data = await res.json();

    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors[0].message || "LeetCode user not found.");
    }

    if (!data.totalQuestions && data.totalSolved === undefined && !data.ranking) {
      throw new Error("Could not retrieve stats for this LeetCode username.");
    }

    const totalSolved = Number(data.totalSolved) || 0;
    const easySolved = Number(data.easySolved) || 0;
    const mediumSolved = Number(data.mediumSolved) || 0;
    const hardSolved = Number(data.hardSolved) || 0;
    const ranking = Number(data.ranking) || 0;
    const totalQuestions = Number(data.totalQuestions) || 4000;
    const totalEasy = Number(data.totalEasy) || 900;
    const totalMedium = Number(data.totalMedium) || 2000;
    const totalHard = Number(data.totalHard) || 900;
    const reputation = Number(data.reputation) || 0;
    const contributionPoint = Number(data.contributionPoint) || 0;

    return {
      username: cleanUsername,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking,
      totalQuestions,
      totalEasy,
      totalMedium,
      totalHard,
      reputation,
      contributionPoint,
      profileUrl: `https://leetcode.com/u/${cleanUsername}/`,
      lastSyncedAt: new Date().toISOString()
    };
  } catch (err) {
    console.warn("LeetCode fetch error:", err);
    throw err;
  }
}

/**
 * Sync LeetCode stats for a user and save to Firestore
 * @param {string} uid - User ID in Firebase
 * @param {string} username - LeetCode username
 * @returns {Promise<Object>} Updated LeetCode stats
 */
export async function syncUserLeetCode(uid, username) {
  const stats = await fetchLeetCodeStats(username);
  
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    leetcodeUsername: stats.username,
    leetcodeStats: stats,
    updatedAt: serverTimestamp()
  });

  return stats;
}
