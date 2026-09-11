import mongoose from "mongoose";

const instagramPostSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "L'URL Instagram est requise"],
      trim: true,
    },
    /** Début de la description du post */
    title: {
      type: String,
      trim: true,
      default: "",
    },
    /** Miniature du post */
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    postedAt: {
      type: Date,
      default: Date.now,
    },
    published: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

instagramPostSchema.index({ published: 1, postedAt: -1 });

const InstagramPost = mongoose.model("InstagramPost", instagramPostSchema);

export default InstagramPost;
