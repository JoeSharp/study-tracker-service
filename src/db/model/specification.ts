import { model, Schema, Document, Types } from "mongoose";
import { ISpecification } from "study-tracker-lib/dist/specificationModel";

export type ISpecificationDoc = Document & ISpecification;

const SpecificationSubSectionSchema: Schema = new Schema(
  {
    id: {
      type: String,
    },
    title: {
      type: String,
    },
    requirements: [String],
  },
  { _id: false }
);

const SpecificationSectionSchema: Schema = new Schema(
  {
    id: {
      type: String,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    subsections: [SpecificationSubSectionSchema],
  },
  { _id: false }
);

const SpecificationComponentSchema: Schema = new Schema(
  {
    id: {
      type: String,
    },
    name: {
      type: String,
    },
    sections: [SpecificationSectionSchema],
  },
  { _id: false }
);

const SpecificationSchema: Schema = new Schema({
  name: {
    type: String,
  },
  subject: {
    type: String,
  },
  examBoard: {
    type: String,
  },
  qualificationCode: {
    type: String,
  },
  components: [SpecificationComponentSchema],
});

export const Specification = model<ISpecificationDoc>(
  "specification",
  SpecificationSchema
);
