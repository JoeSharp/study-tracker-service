import logger from "winston";
import _ from "lodash";

import {
  CONFIDENCE_NOT_COVERED,
  Confidence,
  IRequirementTracker,
  ISectionSummary,
  IByConfidenceCount,
  ConfidenceOptions,
} from "study-tracker-lib/dist/trackerModel";
import {
  SpecificationTracker,
  RequirementTracker,
  IRequirementTrackerDoc,
} from "../db/model/tracker";
import generateCheckPathId from "../middleware/checkPathId";
import { RestApi } from "./types";
import { Request, RequestHandler } from "express";
import { Specification } from "../db/model/specification";

const RESOURCE_URL = "/tracker";
const RESOURCE_WITH_SPECIFICATION_ID = `${RESOURCE_URL}/:specificationId`;
const RESOURCE_WITH_COMPONENT_ID = `${RESOURCE_URL}/:specificationId/:componentId`;
const RESOURCE_WITH_SECTION_ID = `${RESOURCE_URL}/:specificationId/:componentId/:sectionId`;
const RESOURCE_WITH_SUBSECTION_ID = `${RESOURCE_URL}/:specificationId/:componentId/:sectionId/:subsectionId`;
const RESOURCE_WITH_REQUIREMENT_ID = `${RESOURCE_URL}/:specificationId/:componentId/:sectionId/:subsectionId/:requirementIndex`;

const SUMMARY_RESOURCE_URL =
  "/trackerSummary/:specificationId/:componentId/:sectionId";

const checkSpecificationId = generateCheckPathId(["specificationId"]);

const api: RestApi = ({ app }) => {
  // Get an overall tracker for a given spec
  app.get(
    RESOURCE_WITH_SPECIFICATION_ID,
    checkSpecificationId,
    async (req, res) => {
      try {
        const { specificationId } = req.params;

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
    }
  );

  // Get a summary for a given section
  app.get(SUMMARY_RESOURCE_URL, checkSpecificationId, async (req, res) => {
    try {
      const { specificationId, componentId, sectionId } = req.params;

      const specification = await Specification.findById(specificationId);

      if (!specification) {
        res.status(404);
        return res.send("Could not find specification");
      }

      // Get all trackers from the database for this spec, component, section
      const trackers: IRequirementTracker[] = await RequirementTracker.find({
        specificationId,
        componentId,
        sectionId,
      });

      let found = false;
      specification.components
        .filter((component) => component.id === componentId)
        .forEach((component) => {
          component.sections
            .filter((section) => section.id === sectionId)
            .forEach((section) => {
              let requirementTotalCount = 0;
              let requirementCoveredCount = 0;
              const byConfidence: IByConfidenceCount = ConfidenceOptions.reduce(
                (acc, curr) => ({ ...acc, [curr]: 0 }),
                {}
              );
              trackers.forEach((t) => logger.info(JSON.stringify(t)));

              section.subsections.forEach((subsection) => {
                subsection.requirements.forEach(async (r, requirementIndex) => {
                  requirementTotalCount++;
                  const requirementTracker = trackers.find(
                    (t) =>
                      t.subsectionId === subsection.id &&
                      t.requirementIndex === requirementIndex
                  );
                  const confidence: Confidence = !!requirementTracker
                    ? requirementTracker.confidence
                    : CONFIDENCE_NOT_COVERED;

                  if (confidence !== CONFIDENCE_NOT_COVERED) {
                    requirementCoveredCount++;
                  }
                  byConfidence[confidence]++;
                });
              });

              const summary = {
                percentCovered:
                  (100 * requirementCoveredCount) / requirementTotalCount,
                byConfidence,
              };
              logger.info("preparing to return " + JSON.stringify(summary));
              res.send(summary);
              found = true;
            });
        });

      if (!found) {
        res.sendStatus(404);
      }
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
    checkSpecificationId,
    getTrackerHandler((req: Request) => {
      const { specificationId, componentId } = req.params;

      const filter = {
        specificationId,
        componentId,
      };

      return filter;
    })
  );

  app.get(
    RESOURCE_WITH_SECTION_ID,
    checkSpecificationId,
    getTrackerHandler((req: Request) => {
      const { specificationId, componentId, sectionId } = req.params;

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
    checkSpecificationId,
    getTrackerHandler((req: Request) => {
      const {
        specificationId,
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
    checkSpecificationId,
    getTrackerHandler((req: Request) => {
      const {
        specificationId,
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
  app.post(
    RESOURCE_WITH_SPECIFICATION_ID,
    checkSpecificationId,
    async (req, res) => {
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
    }
  );

  // Register a confidence level
  app.put(
    RESOURCE_WITH_REQUIREMENT_ID,
    checkSpecificationId,
    async (req, res) => {
      try {
        const {
          specificationId,
          componentId,
          sectionId,
          subsectionId,
          requirementIndex: requirementIndexStr,
        } = req.params;
        const { confidence } = _.pick(req.body, ["confidence"]);

        const requirementIndex = parseInt(requirementIndexStr, 10);

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
          { upsert: true, new: true }
        );

        if (!updated) {
          res.status(404);
          return res.send({ message: "Nothing updated" });
        }

        return res.send({ updated });
      } catch (err) {
        logger.error(err);
        res.status(500);
        res.send(err);
      }
    }
  );

  // Delete a specification tracker and any requirements recorded against it
  app.delete(
    RESOURCE_WITH_SPECIFICATION_ID,
    checkSpecificationId,
    async (req, res) => {
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

        res.send({
          tracker: removedTracker,
          requirements: removedRequirements,
        });
      } catch (err) {
        logger.error(err);
        res.status(500);
        res.send(err);
      }
    }
  );
};

export default api;
