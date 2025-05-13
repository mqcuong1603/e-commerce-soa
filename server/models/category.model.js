import { Schema, model } from "mongoose";
import slugify from "slugify";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name
CategorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Static method to get category tree
CategorySchema.statics.getTree = async function () {
  const categories = await this.find().sort("sortOrder");
  const categoriesById = {};

  // Create dictionary for lookup
  categories.forEach((category) => {
    categoriesById[category._id] = {
      ...category.toObject(),
      children: [],
    };
  });

  // Build tree
  const rootCategories = [];
  categories.forEach((category) => {
    if (category.parentId && categoriesById[category.parentId]) {
      categoriesById[category.parentId].children.push(
        categoriesById[category._id]
      );
    } else {
      rootCategories.push(categoriesById[category._id]);
    }
  });

  return rootCategories;
};

export default model("Category", CategorySchema);
