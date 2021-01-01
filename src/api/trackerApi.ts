import * as logger from "winston";
import * as _ from "lodash";
import { IRequirementTracker } from "study-tracker-lib/dist/trackerModel";

import { SpecificationTracker, RequirementTracker } from "../db/model/tracker";
import checkPathId from "../middleware/checkPathId";
import { RestApi } from "./types";

const RESOURCE_URL = "/tracker";
const RESOURCE_WITH_SPECIFICATION_ID = `${RESOURCE_URL}/forSpec/:specificationId`;

const api: RestApi = ({ app }) => {
  // Get a specific tracker
  app.get(RESOURCE_WITH_SPECIFICATION_ID, checkPathId, async (req, res) => {
    try {
      const specificationId = req.params.specificationId;

      const found = await SpecificationTracker.findOne({ specificationId });

      if (!found) {
        return res.sendStatus(404);
      }

      res.send(found);
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });

  // Create a tracker, for a spec
  app.post(RESOURCE_WITH_SPECIFICATION_ID, checkPathId, async (req, res) => {
    try {
      const specificationId = req.params.specificationId;

      const created = await SpecificationTracker.create({
        specificationId,
      });
      res.send(created);
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });

  app.put(RESOURCE_WITH_SPECIFICATION_ID, checkPathId, async (req, res) => {
    try {
      const specificationId = req.params.specificationId;

      const {
        componentId,
        sectionId,
        subsectionId,
        requirementIndex,
        confidence,
      } = _.pick(req.body, [
        "componentId",
        "sectionId",
        "subsectionId",
        "requirementIndex",
        "confidence",
      ]);
      logger.info(
        `Updating tracker in spec ${specificationId} with ${JSON.stringify(
          {
            componentId,
            sectionId,
            subsectionId,
            requirementIndex,
            confidence,
          },
          null,
          2
        )}`
      );

      const updated = await RequirementTracker.findOneAndReplace(
        {
          specificationId,
          componentId,
          sectionId,
          subsectionId,
          requirementIndex,
        },
        {
          specificationId,
          componentId,
          sectionId,
          subsectionId,
          requirementIndex,
          confidence,
        },
        {}
      );

      if (!updated) {
        return res.sendStatus(404);
      }

      return res.send({ updated });
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });

  app.delete(RESOURCE_WITH_SPECIFICATION_ID, checkPathId, async (req, res) => {
    try {
      const specificationId = req.params.specificationId;

      const removed = await RequirementTracker.deleteMany({ specificationId });

      if (!removed) {
        return res.sendStatus(404);
      }

      res.send({ removed });
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });
};

export default api;
