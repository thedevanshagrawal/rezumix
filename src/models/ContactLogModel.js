import mongoose from "mongoose";

const contactLogSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1200, // TTL index: automatically deletes document after 20 minutes (1200 seconds)
    }
});

export default mongoose.models.ContactLog || mongoose.model("ContactLog", contactLogSchema);
