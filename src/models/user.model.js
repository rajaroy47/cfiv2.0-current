import mongoose from "mongoose";
import bcrypt from "bcrypt";

const employeeDetailsSchema = new mongoose.Schema(
  {
    department: { type: String, default: "" },
    designation: { type: String, default: "" },
    salary: { type: Number, default: 0 },
    joiningDate: { type: Date },
    employeeCode: { type: String, default: "" },
  },
  { _id: false }
);

const clientDetailsSchema = new mongoose.Schema(
  {
    gstNumber: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    aadhaarNumber: { type: String, default: "" },
    companyName: { type: String, default: "" },
    businessType: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: "",
    },

    // ── Access Control ──────────────────────────────────────────────
    role: {
      type: String,
      enum: ["super_admin", "admin", "employee", "client"],
      default: "client",
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    // ── OAuth ───────────────────────────────────────────────────────
    googleId: { type: String, default: "" },

    // ── Auth Tokens ─────────────────────────────────────────────────
    refreshToken: { type: String, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpiry: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    passwordResetOtp: { type: String, select: false },

    failedLoginAttempts: { type: Number, default: 0 },
    timeOut: { type: Date },

    lastLogin: { type: Date },

    // ── Role-specific Sub-documents ─────────────────────────────────
    employeeDetails: { type: employeeDetailsSchema, default: () => ({}) },
    clientDetails: { type: clientDetailsSchema, default: () => ({}) },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isBlocked: 1 });

// ── Hash password before save ────────────────────────────────────────
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});


// ── Instance Methods ─────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isEmployee = function () {
  return ["employee", "admin", "super_admin"].includes(this.role);
};

userSchema.methods.isAdmin = function () {
  return ["admin", "super_admin"].includes(this.role);
};

const User = mongoose.model("User", userSchema);
export default User;

