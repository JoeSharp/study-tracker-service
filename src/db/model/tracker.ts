import { model, Schema, Types, Document } from "mongoose";
import {
  ISpecificationTracker,
  IRequirementTracker,
  ConfidenceOptions,
} from "study-tracker-lib/dist/trackerModel";

const RequirementTrackerSchema: Schema = new Schema({
  specificationId: {
    type: Types.ObjectId,
  },
  componentId: {
    type: String,
  },
  sectionId: {
    type: String,
  },
  subsectionId: {
    type: String,
  },
  requirementIndex: {
    type: Number,
  },
  confidence: {
    type: String,
    enum: ConfidenceOptions,
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
