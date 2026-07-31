import { Schema, models, model } from "mongoose";

const VaccineSchema = new Schema(
  {
    name: { type: String, required: true },
    dueDate: { type: String, required: true }, // YYYY-MM-DD
    doneDate: { type: String }, // set once administered
    doctor: { type: String },
    notes: { type: String },
    status: { type: String, enum: ["upcoming", "done", "missed"], default: "upcoming" },
  },
  { timestamps: true }
);

export default models.Vaccine || model("Vaccine", VaccineSchema);
