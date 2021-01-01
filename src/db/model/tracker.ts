import { model, Schema, Types, Document } from "mongoose";
import {
  ISpecificationTracker,
  IRequirementTracker,
  Confidence,
} from "study-tracker-lib/dist/trackerModel";

const RequirementTrackerSchema: Schema = new Schema({
  specificationId: {
    type: Types.ObjectId,
  },
  componentId: {
    type: Types.ObjectId,
  },
  sectionId: {
    type: Types.ObjectId,
  },
  subSectionId: {
    type: Types.ObjectId,
  },
  requirementIndex: {
    type: Number,
  },
  confidence: {
    type: Number,
    enum: [
      Confidence.notCovered,
      Confidence.low,
      Confidence.medium,
      Confidence.high,
      Confidence.veryHigh,
    ],
  },
});

export type IRequirementTrackerDoc = Document & IRequirementTracker;

export const RequirementTracker = model<IRequirementTrackerDoc>(
  "requirement_tracker",
  RequirementTrackerSchema
);

export type ISpecificationTrackerDoc = Document & ISpecificationTracker;

const SpecificationTrackerSchema: Schema = new Schema({
  specificationId: {
    type: Types.ObjectId,
  },
});

export const SpecificationTracker = model<ISpecificationTrackerDoc>(
  "specification_tracker",
  SpecificationTrackerSchema
);
