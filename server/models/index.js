// models/index.js

import User from "./user.model";
import Address from "./address.model";
import Category from "./category.model";
import Product from "./product.model";
import ProductVariant from "./productVariant.model";
import ProductImage from "./productImage.model";
import Review from "./review.model";
import Cart from "./cart.model";
import DiscountCode from "./discountCode.model";
import Order from "./order.model";
import OrderStatus from "./orderStatus.model";

export default {
  User,
  Address,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Review,
  Cart,
  DiscountCode,
  Order,
  OrderStatus,
};
