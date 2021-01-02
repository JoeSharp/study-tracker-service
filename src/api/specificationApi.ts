import logger from "winston";
import _ from "lodash";

import { Specification } from "../db/model/specification";
import checkPathId from "../middleware/checkPathId";
import { RestApi } from "./types";

const RESOURCE_URL = "/specification";
const RESOURCE_WITH_ID = `${RESOURCE_URL}/:id`;

const api: RestApi = ({ app }) => {
  app.get(RESOURCE_URL, async (req, res) => {
    try {
      const found = await Specification.find({});
      res.send(found);
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });

  app.get(RESOURCE_WITH_ID, checkPathId, async (req, res) => {
    try {
      const _id = req.params.id;

      const found = await Specification.findOne({ _id });

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

  app.post(RESOURCE_URL, async (req, res) => {
    try {
      logger.info("Posting New Specification", req.body);
      const created = new Specification(req.body);
      created.save();
      res.send(created);
    } catch (err) {
      logger.error(err);
      res.status(500);
      res.send(err);
    }
  });

  app.put(RESOURCE_WITH_ID, checkPathId, async (req, res) => {
    try {
      const _id = req.params.id;

      const body = _.pick(req.body, ["name", "description"]);
      logger.info(
        `Updating specification ${_id} with ${JSON.stringify(body, null, 2)}`
      );

      const updated = await Specification.findOneAndUpdate(
        { _id },
        { $set: body },
        { new: true }
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

  app.delete(RESOURCE_WITH_ID, checkPathId, async (req, res) => {
    try {
      const _id = req.params.id;

      const removed = await Specification.findOneAndDelete({ _id });

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
