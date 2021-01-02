import logger from "winston";
import _ from "lodash";

import { SpecificationTracker, RequirementTracker } from "../db/model/tracker";
import checkPathId from "../middleware/checkPathId";
import { RestApi } from "./types";

const RESOURCE_URL = "/tracker";
const RESOURCE_WITH_SPECIFICATION_ID = `${RESOURCE_URL}/:id`;
const RESOURCE_WITH_REQUIREMENT_ID = `${RESOURCE_URL}/:id/:componentId/:sectionId/:subsectionId/:requirementIndex`;

const api: RestApi = ({ app }) => {
  // Get a specific tracker
  app.get(RESOURCE_WITH_SPECIFICATION_ID, checkPathId, async (req, res) => {
    try {
      const specificationId = req.params.id;

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
      const specificationId = req.params.id;

      logger.info(`Posting new Tracker for Spec ${specificationId}`);

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

  app.put(RESOURCE_WITH_REQUIREMENT_ID, checkPathId, async (req, res) => {
    try {
      const {
        id: specificationId,
        componentId,
        sectionId,
        subsectionId,
        requirementIndex,
      } = req.params;
      const { confidence } = _.pick(req.body, ["confidence"]);

      logger.info(
        `Updating tracker  ${JSON.stringify(
          {
            specificationId,
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

      const updated = await RequirementTracker.findOneAndUpdate(
        {
          specificationId,
          componentId,
          sectionId,
          subsectionId,
          requirementIndex: parseInt(requirementIndex, 10),
        },
        {
          specificationId,
          componentId,
          sectionId,
          subsectionId,
          requirementIndex: parseInt(requirementIndex, 10),
          confidence: parseInt(confidence, 10),
        },
        { upsert: true }
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
