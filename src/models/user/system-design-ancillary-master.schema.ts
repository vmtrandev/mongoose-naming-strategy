import { Schema } from 'mongoose';

const DummySchema = new Schema({
  user_name: String,
  user_password: String,
});

// DummySchema.set("toObject", {
//   transform(val: Record<string, unknown>) {
//     return {
//       userName: val.user_name,
//       userPassword: val.user_password,
//     };
//   },
// });

// DummySchema.virtual("userName")
//   .get(function (this: any) {
//     return this.user_name;
//   })
//   .set(function (this: any, val: unknown) {
//     this.user_name = val;
//   });

export const SystemDesignAncillaryMasterSchema = new Schema(
  {
    manufacturer_id: String,
    model_name: String,
    related_component: String,
    description: String,
    average_whole_sale_price: Number,
    applicable_product_manufacturer_id: String,
    insertion_rule: String,
    quantity: Number,
    created_at: { type: Date, default: Date.now },
    created_by: String,
    updated_at: { type: Date, default: Date.now },
    updated_by: String,
    nested: [DummySchema],
  }
  // {
  //   toJSON: {
  //     transform(val: Record<string, unknown>) {
  //       return {
  //         manufacturerId: val.manufacturer_id,
  //         modelName: val.modelName,
  //         relatedComponent: val.related_component,
  //         description: val.description,
  //         averageWholeSalePrice: val.average_whole_sale_price,
  //         applicableProductManufacturerId:
  //           val.applicable_product_manufacturer_id,
  //         insertionRule: val.insertion_rule,
  //         quantity: val.quantity,
  //         createdAt: val.created_at,
  //         createdBy: val.created_by,
  //         updatedAt: val.updated_at,
  //         updatedBy: val.updated_by,
  //         // nested: (val.nested as any).toJSON(),
  //         nested: val.nested
  //       };
  //     },
  //   },
  // }
);
