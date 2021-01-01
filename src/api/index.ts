import specificationApi from "./specificationApi";
import trackerApi from "./trackerApi";
import { RestApi } from "./types";

const apis: RestApi[] = [specificationApi, trackerApi];

export default apis;
