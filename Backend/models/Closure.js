import mongoose from "mongoose";

const closureSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    label: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// endDate doit être >= startDate
closureSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    this.endDate = this.startDate;
  }
  next();
});

const Closure = mongoose.model("Closure", closureSchema);

export default Closure;
