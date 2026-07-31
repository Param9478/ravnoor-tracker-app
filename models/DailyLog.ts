import { Schema, models, model } from "mongoose";

const DailyLogSchema = new Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:mm
    feedingType: {
      type: String,
      enum: ["breast_direct", "bottle_breastmilk", "bottle_formula", "solid", "none"],
      default: "none",
    },
    amountMl: { type: Number },
    durationMin: { type: Number },
    diaperWet: { type: Boolean, default: false },
    diaperDirty: { type: Boolean, default: false },
    mood: { type: String },
    notes: { type: String },
    loggedBy: { type: String },
  },
  { timestamps: true }
);

DailyLogSchema.index({ date: 1, time: 1 });

export default models.DailyLog || model("DailyLog", DailyLogSchema);
