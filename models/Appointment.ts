import { Schema, models, model } from "mongoose";

const AppointmentSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String },
    doctor: { type: String },
    location: { type: String },
    notes: { type: String },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.Appointment || model("Appointment", AppointmentSchema);
