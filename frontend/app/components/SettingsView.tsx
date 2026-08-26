"use client";

import { useSession, signOut } from "next-auth/react";

export default function SettingsView() {
  const { data: session } = useSession();

  // Get user details
  const name = session?.user?.name || "Ramesh Kumar";
  const email = session?.user?.email || "ramesh.kumar@gmail.com";
  // Check if it's credentials or google (or extract from custom properties)
  const farmer = (session?.user as any)?.farmer || {};
  const location = farmer.location || "Palampur, Kangra District";

  // Create an avatar text from name
  const avatarText = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div id="settings-view" className="view-section">
      <h1 className="page-title">Profile</h1>

      {/* Profile Card */}
      <section className="card profile-card">
        <div className="user-header">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={name}
              className="avatar"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              className="avatar"
              style={{ fontSize: "1.5rem", fontWeight: "bold" }}
            >
              {avatarText}
            </div>
          )}
          <div className="user-details" style={{ marginLeft: "1rem" }}>
            <h2>{name}</h2>
            <p>
              {session?.user?.email ? "Authenticated Farmer" : "Active Farmer"}
            </p>
          </div>
        </div>

        <div className="info-list" style={{ marginTop: "1.5rem" }}>
          <div className="info-item">
            <span className="info-label">Email Address</span>
            <span className="info-value">{email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location</span>
            <span className="info-value">{location}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Primary Crop Type</span>
            <span className="info-value">Wheat & Rice</span>
          </div>
        </div>
      </section>

      {/* Preferences Card */}
      <section className="card preferences-card">
        <h2 className="card-title">Preferences</h2>

        <div className="setting-item">
          <div className="setting-text">
            <span className="setting-label">Language</span>
            <p className="setting-desc">Select your preferred app language</p>
          </div>
          <select id="languageSelect" className="dropdown-btn">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="pa">Punjabi</option>
          </select>
        </div>

        <div className="actions-row">
          <button
            id="logoutBtn"
            className="btn btn-secondary"
            style={{ cursor: "pointer" }}
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Log out
          </button>
        </div>
      </section>
    </div>
  );
}
