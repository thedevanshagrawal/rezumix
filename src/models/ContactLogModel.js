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
        expires: 600, // TTL index: automatically deletes document after 10 minutes (600 seconds)
    }
});

export default mongoose.models.ContactLog || mongoose.model("ContactLog", contactLogSchema);
