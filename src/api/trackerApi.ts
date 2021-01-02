import logger from "winston";
import _ from "lodash";

import { SpecificationTracker, RequirementTracker } from "../db/model/tracker";
import checkPathId from "../middleware/checkPathId";
import { RestApi } from "./types";
import { Request, RequestHandler } from "express";
import { Specification } from "../db/model/specification";

const RESOURCE_URL = "/tracker";
const RESOURCE_WITH_SPECIFICATION_ID = `${RESOURCE_URL}/:id`;
const RESOURCE_WITH_COMPONENT_ID = `${RESOURCE_URL}/:id/:componentId`;
const RESOURCE_WITH_SECTION_ID = `${RESOURCE_URL}/:id/:componentId/:sectionId`;
const RESOURCE_WITH_SUBSECTION_ID = `${RESOURCE_URL}/:id/:componentId/:sectionId/:subsectionId`;
const RESOURCE_WITH_REQUIREMENT_ID = `${RESOURCE_URL}/:id/:componentId/:sectionId/:subsectionId/:requirementIndex`;

const SUMMARY_RESOURCE_URL = "/trackerSummary/:id/:sectionId";

const api: RestApi = ({ app }) => {
  // Get an overall tracker for a given spec
  app.get(RESOURCE_WITH_SPECIFICATION_ID, checkPathId, async (req, res) => {
    try {
      const { id: specificationId } = req.params;

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

  // Get a summary for a given section
  app.get(SUMMARY_RESOURCE_URL, checkPathId, async (req, res) => {
    try {
      const { id: specificationId, sectionId } = req.params;

      const specification = await Specification.findById(specificationId);

      if (!specification) {
        res.status(404);
        return res.send("Could not find specification");
      }

      const trackers = await RequirementTracker.find({
        specificationId,
        sectionId,
      });
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });

  // Various filtering methods for getting lists of trackers
  const getTrackerHandler = (
    filterExtractor: (req: Request) => object
  ): RequestHandler => async (req, res) => {
    try {
      const filter = filterExtractor(req);

      const found = await RequirementTracker.find(filter);

      if (!found) {
        return res.sendStatus(404);
      }

      res.send(found);
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  };

  // Get trackers with various levels of specific filtering
  app.get(
    RESOURCE_WITH_COMPONENT_ID,
    checkPathId,
    getTrackerHandler((req: Request) => {
      const { id: specificationId, componentId } = req.params;

      const filter = {
        specificationId,
        componentId,
      };

      return filter;
    })
  );

  app.get(
    RESOURCE_WITH_SECTION_ID,
    checkPathId,
    getTrackerHandler((req: Request) => {
      const { id: specificationId, componentId, sectionId } = req.params;

      const filter = {
        specificationId,
        componentId,
        sectionId,
      };

      return filter;
    })
  );
  app.get(
    RESOURCE_WITH_SUBSECTION_ID,
    checkPathId,
    getTrackerHandler((req: Request) => {
      const {
        id: specificationId,
        componentId,
        sectionId,
        subsectionId,
      } = req.params;

      const filter = {
        specificationId,
        componentId,
        sectionId,
        subsectionId,
      };

      return filter;
    })
  );
  app.get(
    RESOURCE_WITH_REQUIREMENT_ID,
    checkPathId,
    getTrackerHandler((req: Request) => {
      const {
        id: specificationId,
        componentId,
        sectionId,
        subsectionId,
        requirementIndexRaw,
      } = req.params;

      const filter = {
        specificationId,
        componentId,
        sectionId,
        subsectionId,
        requirementIndex: parseInt(requirementIndexRaw, 10),
      };

      return filter;
    })
  );

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

  // Register a confidence level
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

  // Delete a specification tracker and any requirements recorded against it
  app.delete(RESOURCE_WITH_SPECIFICATION_ID, checkPathId, async (req, res) => {
    try {
      const specificationId = req.params.specificationId;

      const removedTracker = await SpecificationTracker.deleteOne({
        specificationId,
      });

      const removedRequirements = await RequirementTracker.deleteMany({
        specificationId,
      });

      if (!removedTracker) {
        return res.sendStatus(404);
      }

      res.send({ tracker: removedTracker, requirements: removedRequirements });
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });
};

export default api;
