import { Schema, models, model } from "mongoose";

const MedicineSchema = new Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String },
    time: { type: String }, // HH:mm, for daily reminders
    startDate: { type: String, required: true },
    endDate: { type: String },
    notes: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Medicine || model("Medicine", MedicineSchema);
