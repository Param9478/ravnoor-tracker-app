import { Schema, models, model } from "mongoose";

const GrowthSchema = new Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    weightKg: { type: Number },
    heightCm: { type: Number },
    headCm: { type: Number },
    notes: { type: String },
  },
  { timestamps: true }
);

export default models.Growth || model("Growth", GrowthSchema);
