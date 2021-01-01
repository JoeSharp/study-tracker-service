import { model, Schema, Document } from "mongoose";
import { ISpecification } from "study-tracker-lib/dist/specificationModel";

export type ISpecificationDoc = Document & ISpecification;

const SpecificationSubSectionSchema: Schema = new Schema({
  title: {
    type: String,
  },
  requirements: [String],
});

const SpecificationSectionSchema: Schema = new Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  subsections: [SpecificationSubSectionSchema],
});

const SpecificationComponentSchema: Schema = new Schema({
  name: {
    type: String,
  },
  sections: [SpecificationSectionSchema],
});

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
