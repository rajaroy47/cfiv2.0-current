
import mongoose from "mongoose";

// ── SINGLETON MODEL ───────────────────────────────────────────────────
// Only ONE document should ever exist in this collection.
// Always query with WebsiteSetting.findOne() or use the static getSetting().

const smtpSchema = new mongoose.Schema(
  {
    host: { type: String, default: "" },
    port: { type: Number, default: 587 },
    user: { type: String, default: "" },
    pass: { type: String, default: "", select: false },
    from: { type: String, default: "" }, // "Company Name <noreply@example.com>"
    secure: { type: Boolean, default: false },
  },
  { _id: false }
);

const razorpaySchema = new mongoose.Schema(
  {
    keyId: { type: String, default: "", select: false },
    keySecret: { type: String, default: "", select: false },
    webhookSecret: { type: String, default: "", select: false },
    isLive: { type: Boolean, default: false }, // false = test mode
  },
  { _id: false }
);

const cloudinarySchema = new mongoose.Schema(
  {
    cloudName: { type: String, default: "", select: false },
    apiKey: { type: String, default: "", select: false },
    apiSecret: { type: String, default: "", select: false },
    folder: { type: String, default: "erp_uploads" },
  },
  { _id: false }
);

const seoDefaultsSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const homepageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["hero", "services", "about", "testimonials", "faq", "cta", "stats"],
      required: true,
    },
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    customData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const websiteSettingSchema = new mongoose.Schema(
  {
    // ── Branding ───────────────────────────────────────────────────
    siteName: { type: String, default: "CFI V2" },
    tagline: { type: String, default: "" },
    logo: { type: String, default: "" },           // Cloudinary URL
    logoDark: { type: String, default: "" },        // dark mode variant
    favicon: { type: String, default: "" },

    // ── Contact ────────────────────────────────────────────────────
    contactInfo: {
      email: { type: String, default: "info@clientfilingindia.com" },
      phone: { type: String, default: "+918101744020" },
      whatsapp: { type: String, default: "+918101744020" },
      address: { type: String, default: "" },
      city: { type: String, default: "Siliguri" },
      state: { type: String, default: "West Bengal" },
      pincode: { type: String, default: "735135" },
      mapEmbedUrl: { type: String, default: "https://www.googlemap.com" },
    },

    // ── Social Links ───────────────────────────────────────────────
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },

    // ── Business Info (for invoices) ───────────────────────────────
    businessInfo: {
      gstin: { type: String, default: "" },
      pan: { type: String, default: "" },
      registrationNumber: { type: String, default: "" },
    },

    // ── Integrations ───────────────────────────────────────────────
    smtpSettings: { type: smtpSchema, default: () => ({}) },
    razorpaySettings: { type: razorpaySchema, default: () => ({}) },
    cloudinarySettings: { type: cloudinarySchema, default: () => ({}) },

    // ── SEO ────────────────────────────────────────────────────────
    seoDefaults: { type: seoDefaultsSchema, default: () => ({}) },

    // ── Theme ──────────────────────────────────────────────────────
    themeSettings: {
      primaryColor: { type: String, default: "#0F6E56" },
      secondaryColor: { type: String, default: "#1D9E75" },
      fontFamily: { type: String, default: "Inter" },
    },

    // ── Homepage Sections Order & Visibility ───────────────────────
    homepageSections: {
      type: [homepageSectionSchema],
      default: () => [
        { type: "hero", isVisible: true, order: 1 },
        { type: "services", isVisible: true, order: 2 },
        { type: "stats", isVisible: true, order: 3 },
        { type: "about", isVisible: true, order: 4 },
        { type: "testimonials", isVisible: true, order: 5 },
        { type: "faq", isVisible: true, order: 6 },
        { type: "cta", isVisible: true, order: 7 },
      ],
    },

    // ── Maintenance ────────────────────────────────────────────────
    isMaintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String, default: "The Site Is Under Maintenance" },
  },
  { timestamps: true }
);

// ── Static helper — always use this to get the singleton ─────────────
websiteSettingSchema.statics.getSetting = async function () {
  let setting = await this.findOne();
  if (!setting) {
    setting = await this.create({});
  }
  return setting;
};

const WebsiteSetting = mongoose.model("WebsiteSetting", websiteSettingSchema);
export default WebsiteSetting;
